using Bara.API.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bara.API.Users.configs.ModelBuilderConfig
{
    public class UserModelBuilderConfig : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasOne(w => w.AuthProfile)
            .WithOne()
            .HasForeignKey<AuthProfile>(ap => ap.UserId);
            builder.HasIndex(x => x.Id);
            builder.HasIndex(x => x.Email);
            builder.HasIndex(x => x.IsBlacklisted);
            builder.HasIndex(x => x.Gender);
            builder.Property(x => x.Type).HasConversion<string>();
        }
    }
}
