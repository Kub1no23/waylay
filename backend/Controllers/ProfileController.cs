using backend.Models;
using backend.Utils.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProfileController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost] // POST /api/profile
    public async Task<IActionResult> CreateProfile([FromBody] CreateProfileReq req)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userIdStr == null || role == null) return Unauthorized();
        int userId = int.Parse(userIdStr);

        var newProfile = new Profile
        {
            OwnerType = role,
            OwnerId = userId,
            Title = req.Title,
            Summary = req.Summary,
            Location = req.Location,
            RemotePreference = req.RemotePreference,
            YearsExperience = req.YearsExperience,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Profiles.Add(newProfile);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProfileById), new { id = newProfile.Id }, newProfile);
    }

    [HttpPut("{id}")]  // PUT /api/profile/:id
    public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileReq req)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userIdStr == null || role == null) return Unauthorized();
        int userId = int.Parse(userIdStr);

        var profile = await _context.Profiles.FindAsync(id);
        if (profile == null) return NotFound("Profile not found");

        if (profile.OwnerId != userId || profile.OwnerType != role)
        {
            return Forbid();
        }

        profile.Title = req.Title ?? profile.Title;
        profile.Summary = req.Summary ?? profile.Summary;
        profile.Location = req.Location ?? profile.Location;
        profile.RemotePreference = req.RemotePreference ?? profile.RemotePreference;
        profile.YearsExperience = req.YearsExperience ?? profile.YearsExperience;
        profile.IsActive = req.IsActive ?? profile.IsActive;
        profile.UpdatedAt = DateTime.UtcNow;

        _context.Profiles.Update(profile);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Profile updated successfully", profile });
    }

    [HttpGet("my")] // GET /api/profile/my
    public async Task<IActionResult> GetMyProfiles()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userIdStr == null || role == null) return Unauthorized();
        int userId = int.Parse(userIdStr);

        var myProfiles = await _context.Profiles
            .Where(p => p.OwnerId == userId && p.OwnerType == role)
            .ToListAsync();

        return Ok(myProfiles);
    }

    [HttpGet("{id}")] // GET /api/profile/:id
    public async Task<IActionResult> GetProfileById(int id)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userIdStr == null || role == null) return Unauthorized();
        int userId = int.Parse(userIdStr);

        var profile = await _context.Profiles.FindAsync(id);
        if (profile == null) return NotFound("Profile not found");

        if (profile.OwnerId != userId || profile.OwnerType != role)
        {
            return Forbid();
        }

        return Ok(profile);
    }

    [HttpDelete("{id}")] // DELETE /api/profile/:id
    public async Task<IActionResult> DeleteProfile(int id)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userIdStr == null || role == null) return Unauthorized();
        int userId = int.Parse(userIdStr);

        var profile = await _context.Profiles.FindAsync(id);
        if (profile == null) return NotFound("Profile not found");

        if (profile.OwnerId != userId || profile.OwnerType != role)
        {
            return Forbid();
        }

        _context.Profiles.Remove(profile);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Profile with ID {id} was successfully deleted" });
    }
}
