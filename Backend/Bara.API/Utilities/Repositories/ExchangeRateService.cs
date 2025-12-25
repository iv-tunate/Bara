using Bara.API.Utilities.Interfaces;
using Bara.API.Utilities.Models;
using Bara.API.Utilities.Settings;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace Bara.API.Utilities.Repositories
{
    public class ExchangeRateService : IExchangeRateService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly Secrets _secrets;
        private readonly ILogger<ExchangeRateService> _logger;
        private readonly IMemoryCache _cache;

        private const string CACHE_KEY_PREFIX = "ExRate_";
        private readonly TimeSpan _cacheDuration = TimeSpan.FromHours(1);

        // Fallback rates (1 base unit = X Naira)
        private readonly Dictionary<Currency, decimal> _fallbackRates = new()
        {
            { Currency.NAIRA, 1.0m },
            { Currency.USD, 1500.0m },
            { Currency.EUR, 1820.0m },
            { Currency.GBP, 2000.0m }
        };

        public ExchangeRateService(IHttpClientFactory httpClientFactory, IOptions<Secrets> secrets, ILogger<ExchangeRateService> logger, IMemoryCache cache)
        {
            _httpClientFactory = httpClientFactory;
            _secrets = secrets.Value;
            _logger = logger;
            _cache = cache;
        }

        public decimal Convert(decimal amount, Currency from, Currency to)
        {
            if (from == to) return amount;

            var inNaira = ConvertToNaira(amount, from);
            var rateToTarget = GetRateFromNaira(to);

            return inNaira / rateToTarget;
        }

        public decimal ConvertToNaira(decimal amount, Currency from)
        {
            if (from == Currency.NAIRA) return amount;
            return amount * GetRateToNaira(from);
        }

        public decimal GetRate(Currency from, Currency to)
        {
            if (from == to) return 1.0m;
            return GetRateToNaira(from) / GetRateToNaira(to);
        }

        private decimal GetRateToNaira(Currency currency)
        {
            if (currency == Currency.NAIRA) return 1.0m;

            string cacheKey = $"{CACHE_KEY_PREFIX}{currency}_To_NGN";
            if (_cache.TryGetValue(cacheKey, out decimal cachedRate))
            {
                return cachedRate;
            }

            try
            {
                if (string.IsNullOrEmpty(_secrets.ExchangeAPIKey))
                {
                    return _fallbackRates[currency];
                }

                var client = _httpClientFactory.CreateClient();
                var url = $"https://v6.exchangerate-api.com/v6/{_secrets.ExchangeAPIKey}/pair/{currency}/NGN";
                
                var response = client.GetAsync(url).Result; 
                if (response.IsSuccessStatusCode)
                {
                    var content = response.Content.ReadAsStringAsync().Result;
                    var data = JsonConvert.DeserializeObject<ExchangeRateResponse>(content);
                    if (data?.result == "success")
                    {
                        var rate = (decimal)data.conversion_rate;
                        _cache.Set(cacheKey, rate, _cacheDuration);
                        return rate;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to fetch live exchange rate for {Currency}. Using fallback.", currency);
            }

            return _fallbackRates[currency];
        }

        private decimal GetRateFromNaira(Currency currency)
        {
            if (currency == Currency.NAIRA) return 1.0m;

            string cacheKey = $"{CACHE_KEY_PREFIX}NGN_To_{currency}";
            if (_cache.TryGetValue(cacheKey, out decimal cachedRate))
            {
                return cachedRate;
            }
            
            try
            {
                 if (string.IsNullOrEmpty(_secrets.ExchangeAPIKey))
                {
                    return 1.0m / _fallbackRates[currency];
                }

                var client = _httpClientFactory.CreateClient();
                var url = $"https://v6.exchangerate-api.com/v6/{_secrets.ExchangeAPIKey}/pair/NGN/{currency}";
                
                var response = client.GetAsync(url).Result;
                if (response.IsSuccessStatusCode)
                {
                    var content = response.Content.ReadAsStringAsync().Result;
                    var data = JsonConvert.DeserializeObject<ExchangeRateResponse>(content);
                    if (data?.result == "success")
                    {
                        var rate = (decimal)data.conversion_rate;
                        _cache.Set(cacheKey, rate, _cacheDuration);
                        return rate;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to fetch live exchange rate from NGN to {Currency}. Using fallback.", currency);
            }

            return 1.0m / _fallbackRates[currency];
        }

        private class ExchangeRateResponse
        {
            public string result { get; set; }
            public double conversion_rate { get; set; }
        }
    }
}
