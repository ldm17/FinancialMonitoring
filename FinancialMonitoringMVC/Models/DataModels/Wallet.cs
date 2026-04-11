namespace FinancialMonitoringMVC.Models.DataModels;

public class Wallet
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public string Name { get; set; }
    public decimal Balance { get; set; }
    public string Currency { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string Description { get; set; } = string.Empty;
    public ICollection<Transaction>? Transactions { get; set; }
}