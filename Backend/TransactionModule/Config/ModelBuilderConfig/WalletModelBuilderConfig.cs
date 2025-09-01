using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TransactionModule.Models;

namespace TransactionModule.Config.ModelBuilderConfig
{
    internal class WalletModelBuilderConfig : IEntityTypeConfiguration<Wallet>
    {
        public void Configure(EntityTypeBuilder<Wallet> builder)
        {
            //builder.HasKey(x => x.Id);
            //builder.Property(w => w.Balance).HasColumnType("decimal(18,2)");

            builder.Property(x => x.Currency).HasConversion<string>();
        }
    }
}
