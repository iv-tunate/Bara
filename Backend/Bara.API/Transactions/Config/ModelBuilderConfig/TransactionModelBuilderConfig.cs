using Bara.API.Transactions.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Reflection.Emit;

namespace Bara.API.Transactions.Config.ModelBuilderConfig
{
    internal class TransactionModelBuilderConfig : IEntityTypeConfiguration<PaymentTransaction>
    {
        public void Configure(EntityTypeBuilder<PaymentTransaction> builder)
        {
            builder.Property(t => t.TransactionType)
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property(t => t.Status)
                .HasConversion<string>()
                .HasMaxLength(50);
            builder.Property(t => t.Currency)
         .HasConversion<string>();

            builder
            .HasOne(t => t.User)
            .WithMany(u => u.PaymentTransactions)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(t => t.TransactionType);
            builder.HasIndex(t => t.Status);
            builder.Property(x => x.Amount)
                .IsRequired();
            //builder.HasIndex(t => t.ProducerId);
            //builder.HasIndex(t => t.WriterId);
            //builder.HasIndex(t => t.ScriptId);
            //builder.HasIndex(t => t.ReferenceId);
        }
    }
}
