using Bara.API.Users.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bara.API.Users.configs.ModelBuilderConfig
{
    public class DocumentModelBuilderConfig : IEntityTypeConfiguration<Document>
    {
        public void Configure(EntityTypeBuilder<Document> builder)
        {
            builder.HasKey(d => d.Id);
            builder.Property(d => d.DocumentType)
                .HasConversion<string>()
                .HasMaxLength(50);
        }
    }
}
