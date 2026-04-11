using FinancialMonitoring.Api.Models.DataModels;

namespace FinancialMonitoring.Api.Models.DataModels;

public class Category
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public string Name { get; set; }
    public int OperationType { get; set; }
    public int? ParentId { get; set; }
    public int SortOrder { get; set; }
    public ICollection<Transaction>? Transactions { get; set; }
    public ICollection<Category>? ChildCategories { get; set; }
}