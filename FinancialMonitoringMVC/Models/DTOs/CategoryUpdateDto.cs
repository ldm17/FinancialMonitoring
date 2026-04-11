namespace FinancialMonitoringMVC.Models.DTOs;

public class CategoryUpdateDto
{
    public string Name { get; set; }
    public int? ParentId { get; set; }
    public int SortOrder { get; set; }
    public int OperationType { get; set; }
    public string? Position { get; set; }
}
