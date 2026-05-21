using System.Security.Claims;
using backend.Utils.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")] // /api/user
public class UserController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize(Roles = "candidate")]
    [HttpPut("candidate")] // PUT /api/user/candidate
    public async Task<IActionResult> UpdateCandidate([FromBody] CandidateAccReq req)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdStr == null) return Unauthorized();
        int userId = int.Parse(userIdStr);

        bool emailExists = await _context.Candidates.AnyAsync(c => c.Email == req.Email && c.Id != userId)
                          || await _context.Companies.AnyAsync(c => c.Email == req.Email);

        if (emailExists) return BadRequest("This email is already taken by another account");

        var candidate = await _context.Candidates.FindAsync(userId);
        if (candidate == null) return NotFound("Candidate not found");

        // data update : defaults to existing values if new ones are not provided
        candidate.Email = req.Email;
        candidate.FirstName = req.FirstName ?? candidate.FirstName;
        candidate.LastName = req.LastName ?? candidate.LastName;
        candidate.Location = req.Location ?? candidate.Location;
        candidate.Headline = req.Headline ?? candidate.Headline;
        candidate.Summary = req.Summary ?? candidate.Summary;
        candidate.GithubUrl = req.GithubUrl ?? candidate.GithubUrl;
        candidate.PortfolioUrl = req.PortfolioUrl ?? candidate.PortfolioUrl;

        _context.Candidates.Update(candidate);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Candidate profile updated successfully" });
    }

    [Authorize(Roles = "company")]
    [HttpPut("company")] // PUT /api/user/company
    public async Task<IActionResult> UpdateCompany([FromBody] CompanyAccReq req)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdStr == null) return Unauthorized();
        int userId = int.Parse(userIdStr);

        // Kontrola duplicity emailu
        bool emailExists = await _context.Candidates.AnyAsync(c => c.Email == req.Email)
                          || await _context.Companies.AnyAsync(c => c.Email == req.Email && c.Id != userId);

        if (emailExists) return BadRequest("This email is already taken by another account");

        var company = await _context.Companies.FindAsync(userId);
        if (company == null) return NotFound("Company not found");

        company.Email = req.Email;
        company.Name = req.Name ?? company.Name;
        company.Headquarters = req.Headquarters ?? company.Headquarters;
        company.Address = req.Address ?? company.Address;
        company.Industry = req.Industry ?? company.Industry;
        company.Description = req.Description ?? company.Description;

        _context.Companies.Update(company);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Company profile updated successfully" });
    }
}
