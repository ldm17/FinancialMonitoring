namespace FinancialMonitoringMVC.Models.DTOs;

public class ReorderCategoryRequest
{
    public int? ParentId { get; set; }
    public int OperationType { get; set; }
}