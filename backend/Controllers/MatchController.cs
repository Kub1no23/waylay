using backend.Hubs;
using backend.Models;
using backend.Utils.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Pgvector;
using Pgvector.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MatchController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<MainHub> _hubContext;

    public MatchController(AppDbContext context, IHubContext<MainHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpGet("lookup/{profileId}")] // GET /api/match/lookup/:id
    public async Task<IActionResult> MatchCandidatesToCompanyProfile(int profileId)
    {
        var companyFlags = await _context.ProfileFlags
            .Where(pf => pf.ProfileId == profileId && pf.Flag!.Embedding != null)
            .Select(pf => new { pf.FlagId, pf.Flag!.Name, pf.Flag!.Embedding })
            .ToListAsync();

        if (!companyFlags.Any())
        {
            return BadRequest("This company profile has no flags assigned, cannot perform semantic search");
        }
        int totalCompanyFlagsCount = companyFlags.Count;

        var candidatesFlags = await _context.ProfileFlags
            .Where(pf => pf.Profile!.OwnerType == "candidate" && pf.Flag!.Embedding != null)
            .Select(pf => new
            {
                ProfileId = pf.ProfileId,
                Profile = pf.Profile,
                FlagId = pf.FlagId,
                FlagName = pf.Flag!.Name,
                Embedding = pf.Flag!.Embedding // Předpokládám, že tohle je Pgvector.Vector (což implementuje nebo lze převést na float[])
            })
            .ToListAsync();

        var candidatesProfilesMatch = candidatesFlags
            .GroupBy(c => c.ProfileId)
            .Select(g =>
            {
                var candidateProfile = g.First().Profile;
                int matchedFlagsCount = 0;
                var details = new List<object>();

                foreach (var cmpF in companyFlags)
                {
                    double bestMatchPct = 0;
                    string bestMatchFlagName = "none";

                    foreach (var cndF in g)
                    {
                        // 🔥 ZMĚNA: Použijeme vlastní C# metodu místo nefunkční EF Core metody
                        double distance = CalculateCosineDistance(cmpF.Embedding, cndF.Embedding);
                        double matchPercentage = (1 - distance) * 100;

                        if (matchPercentage > bestMatchPct)
                        {
                            bestMatchPct = matchPercentage;
                            bestMatchFlagName = cndF.FlagName;
                        }
                    }

                    if (bestMatchPct >= 80.0)
                    {
                        matchedFlagsCount++;
                    }

                    details.Add(new
                    {
                        CompanyFlag = cmpF.Name,
                        CompanyFlagId = cmpF.FlagId,
                        BestMatchWith = bestMatchFlagName,
                        Score = Math.Round(bestMatchPct, 2)
                    });
                }

                return new
                {
                    CandidateProfileId = g.Key,
                    MatchedFlagsScore = matchedFlagsCount,
                    TotalCompanyFlags = totalCompanyFlagsCount,
                    MatchingDetails = details
                };
            })
            .OrderByDescending(cp => cp.MatchedFlagsScore)
            .Take(20)
            .ToList();

        return Ok(new
        {
            searchedProfileId = profileId,
            totalCompanyFlags = totalCompanyFlagsCount,
            candidatesProfileMatches = candidatesProfilesMatch
        });
    }

    // 🧮 POMOCNÁ METODA PRO VÝPOČET KOSINOVÉ VZDÁLENOSTI V C#
    private static double CalculateCosineDistance(Pgvector.Vector vecA, Pgvector.Vector vecB)
    {
        // Pgvector.Vector se dá převést na pole floatů .ToArray()
        float[] a = vecA.ToArray();
        float[] b = vecB.ToArray();

        if (a.Length != b.Length) return 1.0; // Pokud nesouhlasí dimenze, vrať max vzdálenost

        double dotProduct = 0;
        double normA = 0;
        double normB = 0;

        for (int i = 0; i < a.Length; i++)
        {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA == 0 || normB == 0) return 1.0; // Ochrana proti dělení nulou

        double similarity = dotProduct / (Math.Sqrt(normA) * Math.Sqrt(normB));

        // Kosinová vzdálenost je 1 - kosinová podobnost
        return 1.0 - similarity;
    }

    [HttpPost] // POST /api/match
    public async Task<IActionResult> CreateMatchStatus([FromBody] CreateMatchStatusReq dto)
    {
        var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (string.IsNullOrEmpty(currentUserRole))
        {
            return Unauthorized("User role is missing in token");
        }

        int candidateId = currentUserRole == "candidate" ? dto.SourceId : dto.TargetId;
        int companyId = currentUserRole == "company" ? dto.SourceId : dto.TargetId;

        var existingStatus = await _context.Statuses
            .FirstOrDefaultAsync(s => s.CandidateId == candidateId && s.CompanyId == companyId);

        if (currentUserRole == "company")
        {
            bool candidateExists = await _context.Candidates.AnyAsync(c => c.Id == candidateId);
            if (!candidateExists)
            {
                return NotFound($"Target candidate with ID {candidateId} does not exist");
            }

            if (existingStatus != null)
            {
                return BadRequest("A match status entry between you and this candidate already exists");
            }

            var newStatus = new Status
            {
                CandidateId = candidateId,
                CompanyId = companyId,
                CompanyInterested = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Statuses.Add(newStatus);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Match status successfully created by company",
                status = newStatus
            });
        }

        if (currentUserRole == "candidate")
        {
            if (existingStatus == null)
            {
                return BadRequest("Cannot accept match. The company has not initiated a status with this candidate yet");
            }

            if (existingStatus.CandidateInterested)
            {
                return BadRequest("You are already matched with this company");
            }

            existingStatus.CandidateInterested = true;
            existingStatus.UpdatedAt = DateTime.UtcNow;

            _context.Statuses.Update(existingStatus);
            await _context.SaveChangesAsync();

            _context.Chats.Add(new Chat
            {
                StatusId = existingStatus.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

            var matchNotification = new
            {
                Message = "It's a Match! 🎉",
                ChatId = existingStatus.Id,
                CandidateId = candidateId,
                CompanyId = companyId
            };

            await _hubContext.Clients.Group($"candidate_{candidateId}").SendAsync("Notification_Match", matchNotification);
            await _hubContext.Clients.Group($"company_{companyId}").SendAsync("Notification_Match", matchNotification);

            return Ok(new
            {
                message = "It's a Match! Candidate accepted the company request",
                status = existingStatus
            });
        }

        return BadRequest("Invalid user role execution");
    }

    [HttpGet] // GET /api/match
    public async Task<IActionResult> GetMyMatches()
    {
        var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(currentUserIdStr) || !int.TryParse(currentUserIdStr, out int currentUserId))
        {
            return Unauthorized("User is not authenticated or ID is invalid");
        }

        if (currentUserRole == "company")
        {
            var companyMatches = await _context.Statuses
                .Where(s => s.CompanyId == currentUserId)
                .Select(s => new
                {
                    StatusId = s.Id,
                    Pending = !s.CandidateInterested,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt,
                    CandidateId = s.CandidateId
                })
                .ToListAsync();

            return Ok(companyMatches);
        }

        if (currentUserRole == "candidate")
        {
            var candidateMatches = await _context.Statuses
                .Where(s => s.CandidateId == currentUserId)
                .Select(s => new
                {
                    StatusId = s.Id,
                    Pending = !s.CandidateInterested,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt,
                    CompanyId = s.CompanyId
                })
                .ToListAsync();

            return Ok(candidateMatches);
        }

        return BadRequest("Invalid user role execution");
    }

    [HttpDelete("{statusId}")] // DELETE /api/match/:id
    public async Task<IActionResult> DeleteMatchStatus(int statusId)
    {
        var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (string.IsNullOrEmpty(currentUserIdStr) || !int.TryParse(currentUserIdStr, out int userId))
        {
            return Unauthorized("User is not authenticated or ID is invalid");
        }

        var matchStatus = await _context.Statuses
            .FirstOrDefaultAsync(s => s.Id == statusId);
        if (matchStatus == null)
        {
            return NotFound($"Match status with ID {statusId} was not found");
        }

        if (userRole == "candidate" ? matchStatus.CandidateId != userId : matchStatus.CompanyId != userId)
        {
            return Forbid("You do not have permission to delete this match status");
        }

        _context.Statuses.Remove(matchStatus);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Match status successfully deleted",
            deletedStatusId = statusId
        });
    }
}