namespace FinancialMonitoring.Api.Models.DTOs;

public class ReorderCategoryRequest
{
    public int? ParentId { get; set; }
    public int OperationType { get; set; }
}