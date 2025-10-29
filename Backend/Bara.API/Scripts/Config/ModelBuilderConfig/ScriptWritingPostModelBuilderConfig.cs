namespace Bara.API.Scripts.Config.ModelBuilderConfig
{
    //internal class ScriptWritingPostModelBuilderConfig : IEntityTypeConfiguration<ScriptWritingPostByProducer>
    //{
    //    public void Configure(EntityTypeBuilder<ScriptWritingPostByProducer> builder)
    //    {
    //        builder.HasKey(x => x.Id);
    //        builder.HasOne<Producer>()
    //            .WithMany().HasForeignKey(p => p.ProducerId)
    //            .OnDelete(DeleteBehavior.Cascade);
    //        builder.Property(s => s.PaymentType)
    //            .HasConversion<string>()
    //            .HasMaxLength(50);
    //        builder.Property(s => s.IPArrangement)
    //            .HasConversion<string>()
    //            .HasMaxLength(50);
    //        builder.HasMany(p => p.Applicants)
    //             .WithOne(a => a.ScriptWritingPost)
    //             .HasForeignKey(a => a.ScriptWritingPostByProducerId)
    //             .OnDelete(DeleteBehavior.Cascade);
    //        builder.HasIndex(s => s.ProducerId);

    //    }
    //}
}
