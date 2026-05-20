using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok("Auth controller is working");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var candidate = await _context.Candidates
                .FirstOrDefaultAsync(c => c.Email == req.Email);

            if (candidate == null)
            {
                return BadRequest("Uživatel s tímto emailem neexistuje.");
            }

            // Kontrola hesla (pro hackathon stačí porovnat string, v reálu bcrypt/argon2)
            if (candidate.PasswordHash != req.Password)
            {
                return BadRequest("Nesprávné heslo.");
            }

            // TODO: Vygenerovat JWT token (pokud ho na hackathonu používáte)
            return Ok(new
            {
                message = "Přihlášení úspěšné",
                userId = candidate.Id,
                role = "candidate"
            });
        }

        //[HttpPost("register")]
        //public async Task<IActionResult> Register([FromBody] RegisterCandidateDto req)
        //{
        //    // Kontrola, zda už email v databázi není
        //    var emailExists = await _context.Candidates.AnyAsync(c => c.Email == req.Email);
        //    if (emailExists)
        //    {
        //        return BadRequest("Tento email už je zaregistrovaný.");
        //    }

        //    // Vytvoření nové instance modelu
        //    var newCandidate = new Candidate
        //    {
        //        Email = req.Email,
        //        PasswordHash = req.Password,
        //        FirstName = req.FirstName,
        //        LastName = req.LastName
        //    };

        //    // Přidání do kontextu a fyzické uložení do Postgresu na GCP
        //    _context.Candidates.Add(newCandidate);
        //    await _context.SaveChangesAsync();

        //    return Ok(new { message = "Registrace kandidáta proběhla úspěšně!" });
        //}
    }
}
