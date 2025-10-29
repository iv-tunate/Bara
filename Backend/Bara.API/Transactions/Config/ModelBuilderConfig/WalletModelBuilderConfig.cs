using Bara.API.Transactions.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bara.API.Transactions.Config.ModelBuilderConfig
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
