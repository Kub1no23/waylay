using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Candidate> Candidates { get; set; }
    public DbSet<Company> Companies { get; set; }
    public DbSet<Profile> Profiles { get; set; }
    public DbSet<Flag> Flags { get; set; }
    public DbSet<ProfileFlag> ProfileFlags { get; set; }
    public DbSet<Status> Statuses { get; set; }
    public DbSet<Chat> Chats { get; set; }
    public DbSet<Message> Messages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Povolení pgvector v EF Core
        modelBuilder.HasPostgresExtension("vector");

        // Konfigurace složeného klíče pro M:N tabulku profile_flag
        modelBuilder.Entity<ProfileFlag>()
            .HasKey(pf => new { pf.ProfileId, pf.FlagId });

        base.OnModelCreating(modelBuilder);
    }
}