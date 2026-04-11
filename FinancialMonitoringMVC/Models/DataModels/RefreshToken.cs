using Microsoft.AspNetCore.Identity;

namespace FinancialMonitoringMVC.Models.DataModels;

public class RefreshToken
{
    public int Id { get; set; }
    public string Token { get; set; }
    public string UserId { get; set; }
    public DateTimeOffset ExpiryDate { get; set; } = DateTimeOffset.UtcNow.AddDays(7);
    public string AccessTokenJti { get; set; }
}