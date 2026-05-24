using backend.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("messages")]
public class Message
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("chat_id")]
    public int ChatId { get; set; }

    [Column("sender")]
    public int Sender { get; set; }

    [Required]
    [Column("content")]
    public string Content { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("is_read")]
    public bool IsRead { get; set; } = false;

    [ForeignKey(nameof(ChatId))]
    public Chat Chat { get; set; } = null!;
}
