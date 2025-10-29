using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using PayStack.Net;
using Services.Paystack.DTOs;
using SharedModule.Settings;
using SharedModule.Utils;
using JsonSerializer = System.Text.Json.JsonSerializer;

namespace Services.Paystack
{
    public class PaystackService : IPaystackService
    {
        private readonly HttpClient _httpClient;
        private readonly string _secretKey;
        private readonly string _baseUrl = "https://api.paystack.co";
        private readonly Secrets secrets;
        private readonly LogHelper<PaystackService> logHelper;
        private readonly ILogger<PaystackService> logger;
        private readonly IMemoryCache cache;

        public PaystackService(HttpClient httpClient, IConfiguration configuration,
                IOptions<Secrets> appSecrets, LogHelper<PaystackService> logHelper, ILogger<PaystackService> logger, IMemoryCache memoryCache)
        {
            secrets = appSecrets.Value;
            this.logHelper = logHelper;
            this.logger = logger;
            _httpClient = httpClient;
            _secretKey = secrets.PaystackSecret;
            _httpClient.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", secrets.PaystackSecret);
            cache = memoryCache;
        }

        public async Task<PaymentInitResponse> InitializePaymentAsync(PaymentInitRequest request)
        {
            var paymentInitResponse = new PaymentInitResponse();
            try
            {
                var paystack = new PayStackApi(secrets.PaystackSecret);
                var reference = GenerateReference(request.TransactionId);
                var res = paystack.Transactions.Initialize(new TransactionInitializeRequest
                {
                    AmountInKobo = (int)(request.Amount * 100),
                    Email = request.Email,
                    Currency = request.Currency,
                    Reference = reference,
                    //CallbackUrl = request.CallbackUrl,
                    Metadata = JsonConvert.SerializeObject(new
                    {
                        request.UserId,
                        request.CustomerName,
                        request.Email,
                        request.TransactionId,
                        reference
                    })
                });

                if (res.Status)
                {
                    return new PaymentInitResponse
                    {
                        Status = true,
                        Message = res.Message,
                        Data = new PaymentData
                        {
                            AuthorizationUrl = res.Data.AuthorizationUrl,
                            AccessCode = res.Data.AccessCode,
                            Reference = res.Data.Reference
                        }
                    };
                }
                else
                {
                    return paymentInitResponse;
                }
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "Initializing payment with Paystack");
                return paymentInitResponse;
            }
        }

        public async Task<PaymentVerifyResponse> VerifyPaymentAsync(string reference)
        {
            var paystack = new PayStackApi(secrets.PaystackSecret);
            var result = new PaymentVerifyResponse();

            try
            {
                var response = paystack.Transactions.Verify(reference);

                if (!response.Status || response.Data == null)
                {
                    return result;
                }

                result.Status = response.Status;
                result.Message = response.Message;
                result.Data = new PaymentVerificationData
                {
                    Domain = response.Data.Domain,
                    Status = response.Data.Status,
                    Reference = response.Data.Reference,
                    Amount = response.Data.Amount / 100m,
                    GatewayResponse = response.Data.GatewayResponse,
                    CreatedAt = response.Data.TransactionDate,
                    Channel = response.Data.Channel,
                    Currency = response.Data.Currency,
                    Fees = (decimal)response.Data.Fees / 100m,
                    Authorization = response.Data.Authorization == null ? null : new AuthorizationData
                    {
                        AuthorizationCode = response.Data.Authorization.AuthorizationCode,
                        Bin = response.Data.Authorization.Bin,
                        Last4 = response.Data.Authorization.Last4,
                        ExpMonth = response.Data.Authorization.ExpMonth,
                        ExpYear = response.Data.Authorization.ExpYear,
                        CardType = response.Data.Authorization.CardType,
                        Bank = response.Data.Authorization.Bank,
                        CountryCode = response.Data.Authorization.CountryCode,
                        Reusable = response.Data.Authorization.Reusable ?? false
                    },

                    Customer = response.Data.Customer == null ? null : new CustomerData
                    {
                        Id = response.Data.Customer.Id,
                        Email = response.Data.Customer.Email,
                        CustomerCode = response.Data.Customer.CustomerCode
                    }
                };

                return result;
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(
                    ex.GetType().Name,
                    ex.GetBaseException().GetType().Name,
                    "Verifying payment with Paystack"
                );

                return result;
            }
        }

        public async Task<PaymentVerifyResponse> VerifyTransferAsync(string reference)
        {
            var result = new PaymentVerifyResponse();

            try
            {
                var req = await _httpClient.GetAsync($"{_baseUrl}/transfer/{reference}");
                if (!req.IsSuccessStatusCode)
                {
                    logger.LogError("Failed to verify transfer with Paystack. Reference: {Reference}, StatusCode: {StatusCode}", reference, req.StatusCode);
                    return result;
                }

                var content = await req.Content.ReadAsStringAsync();
                var response = JsonConvert.DeserializeObject<PaymentVerifyResponse>(content);

                if (response == null || !response.Status || response.Data == null)
                {
                    return result;
                }

                result.Status = response.Status;
                result.Message = response.Message;

                result.Data = new PaymentVerificationData
                {
                    Domain = response.Data.Domain,
                    Status = response.Data.Status,
                    Reference = response.Data.Reference,
                    Amount = response.Data.Amount / 100m,
                    GatewayResponse = response.Data.GatewayResponse,
                    CreatedAt = response.Data.CreatedAt,
                    Currency = response.Data.Currency,
                    Fees = response.Data.Fees / 100m,
                    Reason = response.Data.Reason,
                    TransferCode = response.Data.TransferCode,
                    Recipient = response.Data.Recipient == null ? null : new RecipientTransferData
                    {
                        Id = response.Data.Recipient.Id,
                        Name = response.Data.Recipient.Name,
                        RecipientCode = response.Data.Recipient.RecipientCode,
                        Details = response.Data.Recipient.Details == null ? null : new RecipientDetails
                        {
                            BankName = response.Data.Recipient.Details.BankName,
                            AccountNumber = response.Data.Recipient.Details.AccountNumber
                        }
                    }
                };

                return result;
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(
                    ex.GetType().Name,
                    ex.GetBaseException().GetType().Name,
                    $"Verifying transfer with Paystack. Reference: {reference}"
                );

                return result;
            }
        }

        public async Task<RecipientData> CreateRecipientAsync(CreateRecipientRequest data)
        {
            try
            {
                var paystack = new PayStackApi(secrets.PaystackSecret);
                var req = paystack.Post<ApiResponse<RecipientData>, CreateRecipientRequest>($"{_baseUrl}/transferrecipient", data);

                if (req.Status && req.Data != null)
                {
                    return req.Data;
                }
                return new RecipientData();
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "Creating transfer recipient with Paystack");
                return new RecipientData();
            }
        }

        public async Task<WithdrawalResponse> InitiateWithdrawalAsync(WithdrawalRequest request)
        {
            var paystack = new PayStackApi(secrets.PaystackSecret);
            var amount = (int)request.Amount * 100;

            //var reqbody = JsonConvert.SerializeObject(request);
            //var serialIzedBody = new StringContent(reqbody, Encoding.UTF8, "application/json");
            //var response = await _httpClient.PostAsync($"{_baseUrl}/transfer", serialIzedBody);
            //request.Reference = GenerateReference(request.TransactionId);
            var req = paystack.Transfers.InitiateTransfer(amount, request.RecipientCode, reason: request.Reason);
            if (req.RawJson != null)
            {
                var responseContent = req.RawJson;
                return JsonConvert.DeserializeObject<WithdrawalResponse>(responseContent);
            }
            return new WithdrawalResponse();
        }

        public async Task<List<BankData>> GetBanksAsync()
        {
            try
            {
                var cacheKey = "PaystackBanks";
                cache.TryGetValue(cacheKey, out List<BankData> cachedBanks);
                if (cachedBanks != null && cachedBanks.Count > 0)
                {
                    return cachedBanks;
                }

                var response = await _httpClient.GetAsync($"{_baseUrl}/bank?country=nigeria");
                if (!response.IsSuccessStatusCode)
                {
                    logger.LogError("Failed to fetch banks from Paystack {}", response.StatusCode.ToString());
                    return [];
                }
                var responseContent = await response.Content.ReadAsStringAsync();
                var bankResponse = JsonSerializer.Deserialize<BankInfoResponse>(responseContent);

                cachedBanks = bankResponse?.Data ?? [];
                return cachedBanks;
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "Fetching banks from Paystack");
                return [];
            }
        }
        public async Task<AccountResolveResponse> ResolveAccountNumber(string accountNumber, string bankCode)
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_baseUrl}/bank/resolve?account_number={accountNumber}&bank_code={bankCode}");
                if (!response.IsSuccessStatusCode)
                {
                    logger.LogError("Failed to resolve account number with Paystack: {}", response.StatusCode.ToString());
                    return new AccountResolveResponse
                    {
                        Status = false,
                        Message = "Failed to resolve account number."
                    };
                }
                var responseContent = await response.Content.ReadAsStringAsync();
                var accountResolveResponse = JsonConvert.DeserializeObject<AccountResolveResponse>(responseContent);
                return accountResolveResponse;
            }
            catch (Exception ex)
            {
                logHelper.LogExceptionError(ex.GetType().Name, ex.GetBaseException().GetType().Name, "Resolving account number with Paystack");
                return new AccountResolveResponse
                {
                    Status = false,
                    Message = "An error occurred while resolving the account number."
                };
            }
        }

        private static string GenerateReference(Guid transactionId)
        {
            return $"TXN_{transactionId}_{DateTime.Now:yyyyMMddHHmmss}_{Guid.NewGuid().ToString()[..6]}";
        }
    }
}




