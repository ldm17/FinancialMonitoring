using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace FinancialMonitoringMVC;

public class CreatedAtConverter : ValueConverter<DateTimeOffset?, string?>
{
    public CreatedAtConverter() 
        : base(
            v => ConvertToString(v),
            v => ConvertToDateTimeOffset(v))
    {
    }

    private static string? ConvertToString(DateTimeOffset? value)
    {
        return value?.ToString("O");
    }

    private static DateTimeOffset? ConvertToDateTimeOffset(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        return DateTimeOffset.ParseExact(
            value,
            "O",
            System.Globalization.CultureInfo.InvariantCulture,
            System.Globalization.DateTimeStyles.RoundtripKind);
    }
}