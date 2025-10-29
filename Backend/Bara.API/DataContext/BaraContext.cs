using Bara.API.Scripts.Models;
using Bara.API.Scripts.Models.ScriptRelatedChats;
using Bara.API.Transactions.Models;
using Bara.API.Users.Models;
using Microsoft.EntityFrameworkCore;

namespace Bara.API.DataContext
{
    public class BaraContext : DbContext
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
        //public DbSet<Escrow> EscrowOperations { get; set; }
        public DbSet<BlackListedUser> BlackListedUsers { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<BankDetail> BankDetails { get; set; }
        public DbSet<ScriptTransaction> ScriptTransactions { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<Chat> Chats { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(Script).Assembly);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(PaymentTransaction).Assembly);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(User).Assembly);
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Writer>().ToTable("Writers");
            modelBuilder.Entity<Producer>().ToTable("Producers");
        }
    }
}
