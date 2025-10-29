using Bara.API.Transactions.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bara.API.Transactions.Config.ModelBuilderConfig
{
    public class EscrowModelBuilderConfig : IEntityTypeConfiguration<Escrow>
    {
        public void Configure(EntityTypeBuilder<Escrow> builder)
        {
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Status)
                .HasConversion<string>()
                .HasMaxLength(50);
            //builder.HasOne<Transaction>()
            //    .WithOne()
            //    .HasForeignKey<Escrow>("TransactionId")
            //    .OnDelete(DeleteBehavior.Cascade);
            //builder.Property(e => e.Amount)
            //    .HasColumnType("decimal(18,2)");
            //builder.HasIndex(e => e.TransactionId);
        }
    }
}
