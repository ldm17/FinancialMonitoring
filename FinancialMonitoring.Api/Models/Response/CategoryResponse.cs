namespace FinancialMonitoring.Api.Models.Response;

public class CategoryResponse
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int OperationType { get; set; }
    public int? ParentId { get; set; }
    public int SortOrder { get; set; }
}