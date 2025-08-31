namespace Infrastructure.Repositories.TransactionRepositories
{
    //public class WalletService : IWalletService
    //{
    //    private readonly IPaystackService _paystackService;
    //    private readonly IRepository<User> _userRepository;
    //    private readonly IRepository<Transaction> _transactionRepository;
    //    private readonly IRepository<ScriptPayment> _scriptPaymentRepository;
    //    private readonly IRepository<BankAccount> _bankAccountRepository;

    //    public WalletService(
    //        IPaystackService paystackService,
    //        IRepository<User> userRepository,
    //        IRepository<Transaction> transactionRepository,
    //        IRepository<ScriptPayment> scriptPaymentRepository,
    //        IRepository<BankAccount> bankAccountRepository)
    //    {
    //        _paystackService = paystackService;
    //        _userRepository = userRepository;
    //        _transactionRepository = transactionRepository;
    //        _scriptPaymentRepository = scriptPaymentRepository;
    //        _bankAccountRepository = bankAccountRepository;
    //    }

    //    public async Task<string> FundWalletAsync(Guid userId, decimal amount, string email)
    //    {
    //        var user = await _userRepository.GetByIdAsync(userId);
    //        if (user == null) throw new ArgumentException("User not found");

    //        var reference = GenerateInternalReference("FUND");

    //        // Create pending transaction
    //        var transaction = new Transaction
    //        {
    //            Id = Guid.NewGuid(),
    //            UserId = userId,
    //            Amount = amount,
    //            Type = TransactionType.Deposit,
    //            Status = TransactionStatus.Pending,
    //            Description = "Wallet funding",
    //            ExternalReference = reference,
    //            CreatedAt = DateTime.UtcNow,
    //            Metadata = new Dictionary<string, object>
    //            {
    //                ["purpose"] = "wallet_funding",
    //                ["user_email"] = email
    //            }
    //        };

    //        await _transactionRepository.AddAsync(transaction);

    //        var initRequest = new PaymentInitRequest
    //        {
    //            UserId = userId,
    //            Amount = amount,
    //            Email = email,
    //            CallbackUrl = "https://yourapp.com/payment/callback",
    //            Reference = reference,
    //            Metadata = new Dictionary<string, object>
    //            {
    //                ["user_id"] = userId.ToString(),
    //                ["transaction_id"] = transaction.Id.ToString(),
    //                ["purpose"] = "wallet_funding"
    //            }
    //        };

    //        var response = await _paystackService.InitializePaymentAsync(initRequest);

    //        if (response.Status)
    //        {
    //            transaction.PaystackReference = response.Data.Reference;
    //            await _transactionRepository.UpdateAsync(transaction);
    //            return response.Data.AuthorizationUrl;
    //        }

    //        throw new Exception($"Payment initialization failed: {response.Message}");
    //    }

    //    public async Task<bool> ProcessPaymentCallbackAsync(string reference)
    //    {
    //        var verification = await _paystackService.VerifyPaymentAsync(reference);

    //        if (!verification.Status || verification.Data.Status != "success")
    //            return false;

    //        var transaction = await _transactionRepository
    //            .FirstOrDefaultAsync(t => t.PaystackReference == reference);

    //        if (transaction == null) return false;

    //        var user = await _userRepository.GetByIdAsync(transaction.UserId);
    //        var amount = verification.Data.Amount / 100m; // Convert from kobo

    //        // Update transaction
    //        transaction.Status = TransactionStatus.Success;
    //        transaction.CompletedAt = DateTime.UtcNow;
    //        transaction.Amount = amount;

    //        // Update user wallet
    //        user.WalletBalance += amount;

    //        await _transactionRepository.UpdateAsync(transaction);
    //        await _userRepository.UpdateAsync(user);

    //        return true;
    //    }

    //    public async Task<bool> WithdrawFundsAsync(Guid userId, decimal amount, Guid bankAccountId)
    //    {
    //        var user = await _userRepository.GetByIdAsync(userId);
    //        var bankAccount = await _bankAccountRepository.GetByIdAsync(bankAccountId);

    //        if (user.WalletBalance < amount)
    //            throw new InvalidOperationException("Insufficient balance");

    //        // Create withdrawal transaction
    //        var transaction = new Transaction
    //        {
    //            Id = Guid.NewGuid(),
    //            UserId = userId,
    //            Amount = amount,
    //            Type = TransactionType.Withdrawal,
    //            Status = TransactionStatus.Pending,
    //            Description = $"Withdrawal to {bankAccount.BankName}",
    //            ExternalReference = GenerateInternalReference("WITH"),
    //            CreatedAt = DateTime.UtcNow
    //        };

    //        await _transactionRepository.AddAsync(transaction);

    //        // Deduct from wallet immediately (will be reversed if withdrawal fails)
    //        user.WalletBalance -= amount;
    //        await _userRepository.UpdateAsync(user);

    //        var withdrawalRequest = new WithdrawalRequest
    //        {
    //            UserId = userId,
    //            Amount = amount,
    //            RecipientCode = bankAccount.PaystackRecipientCode,
    //            Reason = "Wallet withdrawal"
    //        };

    //        var response = await _paystackService.InitiateWithdrawalAsync(withdrawalRequest);

    //        if (response.Status)
    //        {
    //            transaction.PaystackTransferCode = response.Data.TransferCode;
    //            transaction.PaystackReference = response.Data.Reference;
    //            await _transactionRepository.UpdateAsync(transaction);
    //            return true;
    //        }
    //        else
    //        {
    //            // Reverse the deduction
    //            user.WalletBalance += amount;
    //            transaction.Status = TransactionStatus.Failed;
    //            await _userRepository.UpdateAsync(user);
    //            await _transactionRepository.UpdateAsync(transaction);
    //            return false;
    //        }
    //    }

    //    public async Task<bool> ProcessScriptPaymentAsync(Guid producerId, Guid writerId, Guid scriptId, decimal amount)
    //    {
    //        var producer = await _userRepository.GetByIdAsync(producerId);
    //        var writer = await _userRepository.GetByIdAsync(writerId);

    //        if (producer.WalletBalance < amount)
    //            throw new InvalidOperationException("Insufficient balance");

    //        var commissionRate = 0.1m; // 10% commission
    //        var writerAmount = amount * (1 - commissionRate);
    //        var commissionAmount = amount * commissionRate;

    //        // Deduct from producer
    //        producer.WalletBalance -= amount;

    //        // Add to writer (minus commission)
    //        writer.WalletBalance += writerAmount;

    //        // Create payment transaction for producer
    //        var paymentTransaction = new Transaction
    //        {
    //            Id = Guid.NewGuid(),
    //            UserId = producerId,
    //            Amount = -amount, // Negative for deduction
    //            Type = TransactionType.Payment,
    //            Status = TransactionStatus.Success,
    //            Description = $"Payment for script",
    //            RelatedUserId = writerId,
    //            ScriptId = scriptId,
    //            CommissionAmount = commissionAmount,
    //            CreatedAt = DateTime.UtcNow,
    //            CompletedAt = DateTime.UtcNow
    //        };

    //        // Create receipt transaction for writer
    //        var receiptTransaction = new Transaction
    //        {
    //            Id = Guid.NewGuid(),
    //            UserId = writerId,
    //            Amount = writerAmount,
    //            Type = TransactionType.Payment,
    //            Status = TransactionStatus.Success,
    //            Description = $"Payment received for script",
    //            RelatedUserId = producerId,
    //            ScriptId = scriptId,
    //            CreatedAt = DateTime.UtcNow,
    //            CompletedAt = DateTime.UtcNow
    //        };

    //        // Track script payment
    //        var scriptPayment = new ScriptPayment
    //        {
    //            Id = Guid.NewGuid(),
    //            ScriptId = scriptId,
    //            ProducerId = producerId,
    //            WriterId = writerId,
    //            Amount = amount,
    //            WriterAmount = writerAmount,
    //            CommissionAmount = commissionAmount,
    //            PaymentTransactionId = paymentTransaction.Id,
    //            CreatedAt = DateTime.UtcNow,
    //            IsWriterPaid = true
    //        };

    //        await _userRepository.UpdateAsync(producer);
    //        await _userRepository.UpdateAsync(writer);
    //        await _transactionRepository.AddAsync(paymentTransaction);
    //        await _transactionRepository.AddAsync(receiptTransaction);
    //        await _scriptPaymentRepository.AddAsync(scriptPayment);

    //        return true;
    //    }

    //    public async Task<decimal> GetWalletBalanceAsync(Guid userId)
    //    {
    //        var user = await _userRepository.GetByIdAsync(userId);
    //        return user?.WalletBalance ?? 0;
    //    }

    //    private string GenerateInternalReference(string prefix)
    //    {
    //        return $"{prefix}_{DateTime.Now:yyyyMMddHHmmss}_{Guid.NewGuid().ToString()[..8]}";
    //    }
    //}
}
