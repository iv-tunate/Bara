using Bara.API.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bara.API.Users.configs.ModelBuilderConfig
{
    public class ServiceModelConfigurationBuilder : IEntityTypeConfiguration<Service>
    {
        public void Configure(EntityTypeBuilder<Service> builder)
        {
            //builder.HasKey(x => x.Id);

            builder.Property(s => s.IPDealType)
                .HasConversion<string>()
                .HasMaxLength(50);
            builder.Property(s => s.PaymentType)
                .HasConversion<string>()
                .HasMaxLength(50);
            builder.Property(s => s.Currency)
         .HasConversion<string>();
            //builder.HasOne<Writer>()
            //    .WithMany(w => w.Services)
            //    .HasForeignKey(s => s.ScriptWriterId)
            //    .OnDelete(DeleteBehavior.Cascade);
            //builder.HasIndex(s => s.WriterId);
            //builder.HasQueryFilter(s => !s.ScriptWriter.IsDeleted);

        }
    }
}
