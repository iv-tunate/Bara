using Bara.API.Scripts.Models;
using Bara.API.Scripts.Models.ScriptRelatedChats;
using Bara.API.Transactions.Models;
using Bara.API.Users.Models;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Bara.API.DataContext
{
    public class BaraContext : DbContext, IDataProtectionKeyContext
    {
        public BaraContext(DbContextOptions<BaraContext> options) : base(options)
        {
            Scripts = Set<Script>();
            Transactions = Set<PaymentTransaction>();
            Wallets = Set<Wallet>();
            Producers = Set<Producer>();
            Writers = Set<Writer>();
            AuthProfiles = Set<AuthProfile>();
            Services = Set<Service>();
            Documents = Set<Document>();
            Addresses = Set<Address>();
            Users = Set<User>();
            BlackListedUsers = Set<BlackListedUser>();
            //EscrowOperations = Set<Escrow>();
            BankDetails = Set<BankDetail>();
            ScriptTransactions = Set<ScriptTransaction>();
            //ScriptWritingPosts = Set<ScriptWritingPostByProducer>();
            //Applicants = Set<ScriptWritingPostApplicant>();
        }

        public DbSet<Script> Scripts { get; set; }
        public DbSet<Genre> Genres { get; set; }
        public DbSet<PaymentTransaction> Transactions { get; set; }
        public DbSet<Wallet> Wallets { get; set; }
        public DbSet<Producer> Producers { get; set; }
        public DbSet<Writer> Writers { get; set; }
        public DbSet<AuthProfile> AuthProfiles { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<Address> Addresses { get; set; }
        //public DbSet<ScriptWritingPostByProducer> ScriptWritingPosts { get; set; }
        //public DbSet<ScriptWritingPostApplicant> Applicants { get; set; }
        public DbSet<Escrow> Escrow { get; set; }
        public DbSet<PaymentDetail> PaymentDetail { get; set; }
        public DbSet<BlackListedUser> BlackListedUsers { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<BankDetail> BankDetails { get; set; }
        public DbSet<ScriptTransaction> ScriptTransactions { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<Chat> Chats { get; set; }
        public DbSet<DataProtectionKey> DataProtectionKeys { get; set; }

        //protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        //{
        //    base.OnConfiguring(optionsBuilder);
        //    optionsBuilder.ConfigureWarnings(w =>
        //                            w.Throw(RelationalEventId.MultipleCollectionIncludeWarning));
        //}
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(Script).Assembly);
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Writer>().ToTable("Writers");
            modelBuilder.Entity<Producer>().ToTable("Producers");
            modelBuilder.Entity<Script>()
                    .HasMany(s => s.Genres)
                    .WithMany(g => g.Scripts)
                    .UsingEntity(j => j.ToTable("ScriptGenres"));
            modelBuilder.Entity<Script>().HasIndex(x => x.IsPremiumScript);

            //modelBuilder.Entity<Genre>().HasData(new List<Genre>
            //    {
            //        new() { Id = Guid.NewGuid(), Name = "Drama", Description = "Character-driven stories exploring emotion, conflict, and realism." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Comedy", Description = "Light-hearted stories that aim to entertain and amuse audiences." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Action", Description = "High-paced stories with physical feats, chases, and intense conflict." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Thriller", Description = "Suspenseful stories that build tension and keep viewers on edge." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Horror", Description = "Stories designed to scare, shock, or unsettle through fear or tension." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Romance", Description = "Stories focusing on love, relationships, and emotional intimacy." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Science Fiction", Description = "Stories exploring futuristic technology, space, and speculative ideas." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Fantasy", Description = "Stories set in imaginary worlds with magic, myths, or supernatural elements." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Mystery", Description = "Stories centered on solving puzzles, crimes, or hidden truths." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Adventure", Description = "Stories featuring journeys, exploration, and daring experiences." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Crime", Description = "Stories focused on criminal activity, law enforcement, and justice." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Psychological", Description = "Stories exploring the mind, identity, or emotional instability." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Historical", Description = "Stories set in or inspired by real historical periods and events." },
            //        new Genre { Id = Guid.NewGuid(), Name = "War", Description = "Stories depicting conflict, survival, and humanity in wartime." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Biopic", Description = "Dramatized portrayals of real-life people and their experiences." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Superhero", Description = "Stories about extraordinary individuals balancing power and morality." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Political", Description = "Stories revolving around governance, ideology, and corruption." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Dark Comedy", Description = "Humor that emerges from tragedy, irony, or moral ambiguity." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Romantic Comedy", Description = "Love stories blended with humor and lighthearted tension." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Post-Apocalyptic", Description = "Stories set after civilization’s fall, exploring survival and renewal." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Cyberpunk", Description = "Futuristic dystopias mixing tech, rebellion, and moral decay." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Fantasy Adventure", Description = "Epic tales combining magic, myth, and heroic journeys." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Family", Description = "Stories suitable for all ages, often with heartwarming or moral themes." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Animation", Description = "Stories told through stylized or artistic animation." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Musical", Description = "Narratives where song and performance drive the story." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Documentary", Description = "Non-fictional storytelling capturing real-life events or people." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Experimental", Description = "Non-traditional or avant-garde narratives pushing boundaries." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Noir", Description = "Stylized stories featuring cynicism, fatalism, and moral ambiguity." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Faith-Based", Description = "Stories inspired by spiritual, moral, or religious themes." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Social Commentary", Description = "Stories addressing social issues, justice, and cultural reflection." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Sports", Description = "Stories centered on athletes, competition, and perseverance." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Coming-of-Age", Description = "Stories about growth, identity, and the transition into adulthood." },
            //        new Genre { Id = Guid.NewGuid(), Name = "Mystical Realism", Description = "Real-world settings infused with subtle magical or surreal elements." }
            //    });

        }
    }
}
