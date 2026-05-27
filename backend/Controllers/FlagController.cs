using System.Security.Claims;
using backend.Models;
using backend.Utils.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Google.Cloud.AIPlatform.V1;
using Google.Protobuf.WellKnownTypes;
using ProtobufValue = Google.Protobuf.WellKnownTypes.Value;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FlagController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public FlagController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("/api/profile/{profileId}/flag")] // POST /api/profile/:id/flag
    public async Task<IActionResult> AssignFlagsToProfile(int profileId, [FromBody] AssignFlagsReq dto)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userIdStr == null || userRole == null) return Unauthorized();
        int userId = int.Parse(userIdStr);

        var profile = await _context.Profiles.FindAsync(profileId);
        if (profile == null) return NotFound("Profile not found");

        if (profile.OwnerType != userRole || profile.OwnerId != userId)
        {
            return Forbid();
        }



        var flagIds = dto.Flags.Keys.ToList();
        if (flagIds == null || !flagIds.Any())
            return BadRequest("No flag IDs provided for assignment");

        var validFlags = await _context.Flags
            .Where(f => flagIds.Contains(f.Id) && f.Embedding != null)
            .ToListAsync();

        var invalidOrMissingIds = flagIds
            .Except(validFlags.Select(f => f.Id))
            .ToList();
        if (invalidOrMissingIds.Any())
        {
            return BadRequest(new
            {
                message = "One or more provided flag IDs either do not exist in the database or are missing their semantic embeddings",
                invalidFlagIds = invalidOrMissingIds
            });
        }

        //duplicity check
        var existingProfileFlagIds = await _context.ProfileFlags
            .Where(pf => pf.ProfileId == profileId && flagIds.Contains(pf.FlagId))
            .Select(pf => pf.FlagId)
            .ToListAsync();
        var flagsToAssign = flagIds.Except(existingProfileFlagIds).ToList();
        if (!flagsToAssign.Any())
        {
            return BadRequest("All provided flags are already assigned to this profile");
        }

        var newProfileFlags = flagsToAssign.Select(flagId => new ProfileFlag
        {
            ProfileId = profileId,
            FlagId = flagId,
            Weight = dto.Flags[flagId] ?? 1.0m,
        }).ToList();

        _context.ProfileFlags.AddRange(newProfileFlags);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"{newProfileFlags.Count} flags successfully assigned to profile",
            skippedCount = existingProfileFlagIds.Count
        });
    }

    [HttpDelete("/api/profile/{id}/flag")] // DELETE /api/profile/:id/flag
    public async Task<IActionResult> DeleteFlagsFromProfile(int profileId, [FromBody] DeleteFlagsReq dto)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userIdStr == null || userRole == null) return Unauthorized();
        int userId = int.Parse(userIdStr);

        var profile = await _context.Profiles.FindAsync(profileId);
        if (profile == null) return NotFound("Profile not found");

        if (profile.OwnerType != userRole || profile.OwnerId != userId)
        {
            return Forbid();
        }



        if (dto.FlagIds == null || !dto.FlagIds.Any())
            return BadRequest("No flag IDs provided for deletion");

        var relationsToDelete = await _context.ProfileFlags
            .Where(pf => pf.ProfileId == profileId && dto.FlagIds.Contains(pf.FlagId))
            .ToListAsync();

        if (!relationsToDelete.Any())
            return NotFound("No matching flags found on this profile");

        _context.ProfileFlags.RemoveRange(relationsToDelete);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"{relationsToDelete.Count} flags successfully removed from profile" });
    }

    [HttpGet] // GET /api/flag?q=...&category=...&page=2
    public async Task<IActionResult> SearchFlags([FromQuery] string? q, [FromQuery] string? category, [FromQuery] int page = 1)
    {
        if (page < 1) page = 1;
        const int pageSize = 20;

        var query = _context.Flags
            .Where(f => f.Embedding != null);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var normalizedQuery = q.Trim().ToLower();
            query = query.Where(f => f.Name.ToLower().Contains(normalizedQuery));
        }
        if (!string.IsNullOrWhiteSpace(category))
        {
            var normalizedCategory = category.Trim().ToLower();
            query = query.Where(f => f.Category != null && f.Category.ToLower() == normalizedCategory);
        }

        int totalCount = await query.CountAsync();
        int totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

        var results = await query
            .OrderBy(f => f.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(f => new
            {
                f.Id,
                f.Name,
                f.Category
            })
            .ToListAsync();

        var response = new
        {
            TotalCount = totalCount,
            TotalPages = totalPages,
            CurrentPage = page,
            PageSize = pageSize,
            HasNextPage = page < totalPages,
            Data = results
        };

        return Ok(response);
    }

    [AllowAnonymous]
    [HttpPost] // POST /api/flag
    public async Task<IActionResult> CreateGlobalFlag([FromBody] CreateFlagReq dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Flag name cannot be empty");
        if (string.IsNullOrWhiteSpace(dto.Category))
            return BadRequest("Flag category cannot be empty");

        var normalizedName = dto.Name.Trim().ToLower();

        var existingFlag = await _context.Flags
            .FirstOrDefaultAsync(f => f.Name == normalizedName);
        if (existingFlag != null)
        {
            return Ok(new
            {
                message = "Flag already exists in the database",
                flag = new { existingFlag.Id, existingFlag.Name, existingFlag.Category }
            });
        }

        float[] embeddingVector;
        try
        {
            embeddingVector = await GenerateEmbeddingAsync(normalizedName);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Failed to generate semantic embedding for the flag", details = ex.Message });
        }

        var newFlag = new Flag
        {
            Name = normalizedName,
            Category = dto.Category.Trim().ToLower(),
            Embedding = new Pgvector.Vector(embeddingVector),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Flags.Add(newFlag);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(SearchFlags), new { q = newFlag.Name }, new
        {
            message = "Flag successfully created with semantic embedding",
            flag = new { newFlag.Id, newFlag.Name, newFlag.Category }
        });
    }

    private async Task<float[]> GenerateEmbeddingAsync(string text)
    {
        var projectId = _configuration["PROJECT_ID"];
        var location = _configuration["GCP:Location"];
        var modelName = _configuration["GCP:TextModelName"];

        if (string.IsNullOrEmpty(projectId))
        {
            throw new Exception("GCP ProjectId is missing in configuration (PROJECT_ID)");
        }
        if (string.IsNullOrEmpty(location))
        {
            throw new Exception("GCP Location is missing in configuration (GCP:Location)");
        }
        if (string.IsNullOrEmpty(modelName))
        {
            throw new Exception("GCP TextModelName is missing in configuration (GCP:TextModelName)");
        }

        var clientBuilder = new PredictionServiceClientBuilder
        {
            Endpoint = $"{location}-aiplatform.googleapis.com"
        };
        PredictionServiceClient predictionServiceClient = await clientBuilder.BuildAsync();
        var endpointName = EndpointName.FromProjectLocationPublisherModel(projectId, location, "google", modelName);

        var instance = new ProtobufValue
        {
            StructValue = new Struct
            {
                Fields = { { "content", ProtobufValue.ForString(text) } }
            }
        };
        // Set dimensions to 768
        var parameters = new ProtobufValue
        {
            StructValue = new Struct
            {
                Fields = { { "outputDimensionality", ProtobufValue.ForNumber(768) } }
            }
        };

        PredictResponse response = await predictionServiceClient.PredictAsync(
            endpointName.ToString(),
            new[] { instance },
            parameters
        );

        var predictions = response.Predictions;
        if (predictions == null || predictions.Count == 0)
        {
            throw new Exception("Vertex AI returned an empty prediction response");
        }

        var embeddingsStruct = predictions[0].StructValue.Fields["embeddings"].StructValue;
        var valuesList = embeddingsStruct.Fields["values"].ListValue.Values;

        return valuesList.Select(v => (float)v.NumberValue).ToArray();
    }
}
