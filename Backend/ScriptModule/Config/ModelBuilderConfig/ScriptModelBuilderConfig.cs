using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ScriptModule.Models;

namespace ScriptModule.Config.ModelBuilderConfig
{
    public class ScriptModelBuilderConfig : IEntityTypeConfiguration<Script>
    {
        public void Configure(EntityTypeBuilder<Script> builder)
        {
            //builder.HasKey(x => x.Id);
            builder.HasIndex(s => s.Title);
            //builder.HasIndex(s => s.WriterId);
            builder.Property(s => s.Title)
                .HasMaxLength(200);
            builder.HasIndex(s => s.Status);
            builder.Property(s => s.Status)
                .HasConversion<string>()
                .HasMaxLength(50);
            builder.Property(s => s.Price)
                .IsRequired();
            builder.Property(s => s.OwnershipRights)
                .HasConversion<string>()
                .HasMaxLength(50);
            builder.Property(s => s.Currency)
            .HasConversion<string>();
        }
    }
}
