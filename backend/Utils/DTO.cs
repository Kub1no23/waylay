using System.ComponentModel.DataAnnotations;

namespace backend.Utils.DTO;

public class CompanyAccReq
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(255)]
    public required string Email { get; set; }

    [Required(ErrorMessage = "Password is required")]
    [StringLength(255, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters long")]
    public required string Password { get; set; }

    [Required(ErrorMessage = "Company name is required")]
    [StringLength(255)]
    public required string Name { get; set; }

    [StringLength(255)]
    public string? Headquarters { get; set; }

    [StringLength(255)]
    public string? Address { get; set; }

    [StringLength(255)]
    public string? Industry { get; set; }

    public string? Description { get; set; }
}
public class CandidateAccReq
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(255)]
    public required string Email { get; set; }

    [Required(ErrorMessage = "Password is required")]
    [StringLength(255, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters long")]
    public required string Password { get; set; }

    [Required(ErrorMessage = "First name is required")]
    [StringLength(100)]
    public required string FirstName { get; set; }

    [Required(ErrorMessage = "Last name is required")]
    [StringLength(100)]
    public required string LastName { get; set; }

    [StringLength(255)]
    public string? Location { get; set; }

    [StringLength(255)]
    public string? Headline { get; set; }

    public string? Summary { get; set; }

    [Url(ErrorMessage = "Invalid GitHub URL format.")]
    [StringLength(500)]
    public string? GithubUrl { get; set; }

    [Url(ErrorMessage = "Invalid Portfolio URL format.")]
    public string? PortfolioUrl { get; set; }
}
