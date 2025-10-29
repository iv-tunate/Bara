using Bara.API.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bara.API.Users.configs.ModelBuilderConfig
{
    public class WriterModelBuilderConfig : IEntityTypeConfiguration<Writer>
    {
        public void Configure(EntityTypeBuilder<Writer> builder)
        {
            //builder.HasKey(x => x.Id);
            builder.HasIndex(u => u.IsDeleted);
            builder.HasIndex(u => u.Email).IsUnique();
            builder.Property(u => u.VerificationStatus)
                .HasConversion<string>();
            builder.Property(u => u.Gender)
                .HasConversion<string>();
            builder.HasBaseType(typeof(User));

        }
    }
}
