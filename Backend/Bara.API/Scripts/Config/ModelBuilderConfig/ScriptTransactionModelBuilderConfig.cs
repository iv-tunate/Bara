using Bara.API.Scripts.Enums;
using Bara.API.Scripts.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bara.API.Scripts.Config.ModelBuilderConfig
{
    internal class ScriptTransactionModelBuilderConfig : IEntityTypeConfiguration<ScriptTransaction>
    {
        public void Configure(EntityTypeBuilder<ScriptTransaction> builder)
        {
            builder.Property<ScriptDeliveryStatus>("Status")
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.Property<ScriptTransactionStatus>("TransactionStatus")
                .HasConversion<string>()
                .HasMaxLength(50);

            builder.HasIndex(st => st.IdempotencyKey);
            builder.HasIndex(st => new { st.ProducerId, st.ScriptId });
        }
    }
}
