using backend.Models;
using backend.Utils;
using backend.Utils.DTO;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing.Matching;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _conf;

        public AuthController(AppDbContext context, IConfiguration conf)
        {
            _context = context;
            _conf = conf;
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok("Auth controller is working");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            Candidate? candidate = await _context.Candidates
                .FirstOrDefaultAsync(c => c.Email == req.Email);
            Company? company = await _context.Companies
                .FirstOrDefaultAsync(c => c.Email == req.Email);

            if (candidate == null && company == null)
            {
                return BadRequest("Account with this email doesn't exist");
            }

            string role = candidate != null ? "candidate" : "company";

            if (!Auth.VerifyPassword(req.Password, role == "candidate" ? candidate!.PasswordHash : company!.PasswordHash))
            {
                return BadRequest("Invalid password");
            }

            string secretKey = _conf["Jwt:Key"]!;
            string issuer = _conf["Jwt:Issuer"]!;
            string audience = _conf["Jwt:Audience"]!;

            string token = Auth.GenerateJwtToken(role == "candidate" ? candidate! : company!, role, secretKey, issuer, audience);

            return Ok(new
            {
                message = "Login successful",
                jwt = token
            });
        }

        [HttpPost("register/candidate")]
        public async Task<IActionResult> RegisterCandidate([FromBody] CandidateAccReq req)
        {
            bool emailExists = await _context.Candidates.AnyAsync(c => c.Email == req.Email)
                                || await _context.Companies.AnyAsync(c => c.Email == req.Email);

            if (emailExists)
            {
                return BadRequest("Account with this email already exists");
            }

            string hashedPassword = Auth.HashPassword(req.Password);

            var newCandidate = new Candidate
            {
                Email = req.Email,
                PasswordHash = hashedPassword,
                FirstName = req.FirstName,
                LastName = req.LastName,
                Location = req.Location,
                Headline = req.Headline,
                Summary = req.Summary,
                GithubUrl = req.GithubUrl,
                PortfolioUrl = req.PortfolioUrl
            };

            _context.Candidates.Add(newCandidate);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Candidate registration successful" });
        }
        [HttpPost("register/company")]
        public async Task<IActionResult> RegisterCompany([FromBody] CompanyAccReq req)
        {
            bool emailExists = await _context.Candidates.AnyAsync(c => c.Email == req.Email)
                              || await _context.Companies.AnyAsync(c => c.Email == req.Email);

            if (emailExists)
            {
                return BadRequest("Account with this email already exists.");
            }

            string hashedPassword = Auth.HashPassword(req.Password);

            var newCompany = new Company
            {
                Email = req.Email,
                PasswordHash = hashedPassword,
                Name = req.Name,
                Headquarters = req.Headquarters,
                Address = req.Address,
                Industry = req.Industry,
                Description = req.Description
            };

            _context.Companies.Add(newCompany);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Company registration successful" });
        }
    }
}
