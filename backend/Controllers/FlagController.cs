using System.Security.Claims;
using backend.Models;
using backend.Utils.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
// Nezapomeň si nainstalovat/přidat balíček pro OpenAI, pokud ho ještě nemáš (např. Azure.AI.OpenAI nebo OpenAI)
// using Azure.AI.OpenAI; 

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

    [HttpPost("/api/profile/{id}/flag")] // POST /api/profile/:id/flag
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

    [HttpGet("/api/flag")] // GET /api/flag?q=...&category=...&page=2
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

    // =========================================================================
    // 3. Interní metoda: Generování vektoru (Text Embedding)
    // =========================================================================
    private async Task<float[]> GenerateEmbeddingAsync(string text)
    {
        // TODO: Tady na hackathonu uděláte reálné volání Azure OpenAI / OpenAI API.
        // Prozatím ti sem dávám mock, který vrací prázdné pole o správné velikosti 1536 prvků,
        // abyste mohli testovat zbytek aplikace bez padání.

        // Ukázka, jak by to vypadalo s oficiálním OpenAI SDK:
        /*
        var apiKey = _configuration["OpenAI:ApiKey"]; // Načtení z Secret Manageru
        var client = new OpenAIClient(apiKey);
        var options = new EmbeddingsOptions("text-embedding-3-small", new[] { text }); 
        var response = await client.GetEmbeddingsAsync(options);
        return response.Value.Data[0].Embedding.ToArray();
        */

        // MOCK: Vrátí pole 1536 náhodných / nulových čísel (vyhovuje podmínce VECTOR(1536) v DB)
        float[] mockVector = new float[1536];
        Array.Fill(mockVector, 0.01f); // Jen dummy data pro test
        return await Task.FromResult(mockVector);
    }
}
