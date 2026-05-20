using Pgvector;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Numerics;

namespace backend.Models;

[Table("profile")]
public class Profile
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("owner_type")]
    public string OwnerType { get; set; } = string.Empty; // 'candidate' or 'company'

    [Required]
    [Column("owner_id")]
    public int OwnerId { get; set; }

    [Column("title")]
    public string? Title { get; set; }

    [Column("summary")]
    public string? Summary { get; set; }

    [Column("location")]
    public string? Location { get; set; }

    [Column("remote_preference")]
    public string? RemotePreference { get; set; }

    [Column("years_experience")]
    public int? YearsExperience { get; set; }

    [Column("embedding", TypeName = "vector(1536)")]
    public Pgvector.Vector? Embedding { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}