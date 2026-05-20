using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("profile_flag")]
public class ProfileFlag
{
    [Column("profile_id")]
    public int ProfileId { get; set; }

    [ForeignKey(nameof(ProfileId))]
    public Profile? Profile { get; set; }

    [Column("flag_id")]
    public int FlagId { get; set; }

    [ForeignKey(nameof(FlagId))]
    public Flag? Flag { get; set; }

    [Column("weight")]
    public decimal? Weight { get; set; }
}
