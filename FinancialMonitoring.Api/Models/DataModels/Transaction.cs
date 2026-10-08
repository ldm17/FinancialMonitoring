namespace FinancialMonitoring.Api.Models.DataModels;

public class Transaction
{
    public int Id { get; set; }
    public int WalletId { get; set; }
    public int CategoryId { get; set; }
    public int OperationType { get; set; }
    public decimal Amount { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsIgnoredInCalculation { get; set; }
    public bool IsFavorite { get; set; }
    public string? TimeZone { get; set; }
    public virtual Wallet Wallet { get; set; }
}