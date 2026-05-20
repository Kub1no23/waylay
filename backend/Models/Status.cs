using backend.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("status")]
public class Status
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("candidate_id")]
    public int CandidateId { get; set; }

    [ForeignKey(nameof(CandidateId))]
    public Candidate? Candidate { get; set; }

    [Column("company_id")]
    public int CompanyId { get; set; }

    [ForeignKey(nameof(CompanyId))]
    public Company? Company { get; set; }

    [Column("company_interested")]
    public bool CompanyInterested { get; set; } = false;

    [Column("candidate_interested")]
    public bool CandidateInterested { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
