using FinancialMonitoring.Api.Models.DataModels;

namespace FinancialMonitoring.Api.Models.DTOs;

public class TransactionCreateDto
{
    public int WalletId { get; set; }
    public int CategoryId { get; set; }
    public int OperationType { get; set; }
    public decimal Amount { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public string Description { get; set; } = string.Empty;
    public bool IsIgnoredInCalculation { get; set; }
    public bool IsFavorite { get; set; }
    public string? TimeZone { get; set; }
}