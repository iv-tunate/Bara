using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Bara.API.Utilities.ToolKit
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
