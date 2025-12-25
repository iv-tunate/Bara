using Bara.API.Utilities.Models;

namespace Bara.API.Utilities.Interfaces
{
    public interface IExchangeRateService
    {
        decimal Convert(decimal amount, Currency from, Currency to);
        decimal ConvertToNaira(decimal amount, Currency from);
        decimal GetRate(Currency from, Currency to);
    }
}
