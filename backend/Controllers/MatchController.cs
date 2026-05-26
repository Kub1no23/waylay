using backend.Models;
using backend.Utils.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    public MatchController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("lookup/{companyProfileId}")] // GET /api/match/lookup/:id
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
                Embedding = pf.Flag!.Embedding
            })
            .ToListAsync();

        var candidatesProfilesMatch = candidatesFlags
            .GroupBy(c => c.ProfileId)
            .Select(g => //loop over each candidate profile /w flags
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
                        double distance = cmpF.Embedding!.CosineDistance(cndF.Embedding);
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

            return Ok(new
            {
                message = "It's a Match! Candidate accepted the company request",
                status = existingStatus
            });
        }

        return BadRequest("Invalid user role execution");
    }
}