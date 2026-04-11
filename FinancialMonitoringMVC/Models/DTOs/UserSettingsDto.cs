namespace FinancialMonitoringMVC.Models.DTOs;

public class UpdateTimeZoneDto
{
    public string TimeZone { get; set; }
}

public class UpdateIsTimeZoneEnabledDto
{
    public bool IsTimeZoneEnabled { get; set; }
}

public class UpdateIsTransactionTimeZoneVisibleDto
{
    public bool IsTransactionTimeZoneVisible { get; set; }
}

public class UpdateIsUse12HFormatDto
{
    public bool IsUse12HFormat { get; set; }
}

public class UpdateFormatDateTypeDto
{
    public int FormatDateType { get; set; }
}