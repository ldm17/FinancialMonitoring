using Microsoft.AspNetCore.Identity;

namespace FinancialMonitoring.Api.Models.DataModels;

public class UserSettings
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public IdentityUser User { get; set; }
    public string TimeZone { get; set; }
    public bool IsTimeZoneEnabled { get; set; }
    public bool IsTransactionTimeZoneVisible { get; set; }
    public bool IsUse12HFormat { get; set; }
    public int FormatDateType { get; set; }
}