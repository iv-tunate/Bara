using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace SharedModule.Utils
{
    public class EnumToStringConverter<T> : ValueConverter<T, string>
      where T : struct, Enum
    {
        public EnumToStringConverter()
            : base(
                v => v.ToString(),
                v => (T)Enum.Parse(typeof(T), v))
        { }
    }
}
