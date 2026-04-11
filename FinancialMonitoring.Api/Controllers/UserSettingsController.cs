using System.Security.Claims;
using FinancialMonitoring.Api.Models;
using FinancialMonitoring.Api.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using NodaTime.TimeZones;

namespace FinancialMonitoring.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserSettingsController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public UserSettingsController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpPut("update-timezone")]
    public async Task<IActionResult> UpdateTimeZone([FromBody] UpdateTimeZoneDto updatedTimeZone)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null)
            return Unauthorized();
        
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        var existingTimeZone = await _context.UserSettings
            .FirstOrDefaultAsync(e => e.UserId == userId);

        if (existingTimeZone == null)
            return NotFound();

        existingTimeZone.TimeZone = updatedTimeZone.TimeZone;

        await _context.SaveChangesAsync();
        return NoContent();
    }
    
    [HttpGet]
    public async Task<IActionResult> GetTimeZoneById()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null)
            return Unauthorized();
    
        var userSettings = await _context.UserSettings
            .FirstOrDefaultAsync(e => e.UserId == userId);

        if (userSettings == null)
            return NotFound();

        // Получаем IANA-таймзону из БД (например, "Europe/Moscow")
        string ianaTimeZone = userSettings.TimeZone;

        // Получаем смещение в формате "UTC+3" или "UTC+5:30"
        string offset = GetUtcOffsetFromIanaTimeZone(ianaTimeZone);
        
        bool isTimeZoneEnabled = userSettings.IsTimeZoneEnabled;
        
        bool isTransactionTimeZoneVisible = userSettings.IsTransactionTimeZoneVisible;
        
        bool isUse12HFormat = userSettings.IsUse12HFormat;
        
        int formatDateType = userSettings.FormatDateType;
        
        var result = new
        {
            TimeZone = ianaTimeZone,
            UtcOffset = offset,
            IsTimeZoneEnabled = isTimeZoneEnabled,
            IsTransactionTimeZoneVisible = isTransactionTimeZoneVisible,
            IsUse12HFormat = isUse12HFormat,
            FormatDateType = formatDateType,
        };

        return Ok(result);
    }

    private string GetUtcOffsetFromIanaTimeZone(string ianaTimeZone)
    {
        try
        {
            // Получаем временную зону из базы данных IANA (TZDB)
            DateTimeZone zone = DateTimeZoneProviders.Tzdb.GetZoneOrNull(ianaTimeZone);

            if (zone == null)
                return "Unknown";

            // Получаем текущее время и смещение
            Instant now = SystemClock.Instance.GetCurrentInstant();
            Offset offset = zone.GetUtcOffset(now);

            // Преобразуем смещение в TimeSpan (часы и минуты)
            TimeSpan offsetTimeSpan = offset.ToTimeSpan();

            // Форматируем смещение в "UTC+3" или "UTC+5:30"
            string sign = offsetTimeSpan >= TimeSpan.Zero ? "+" : "-";
            int hours = Math.Abs(offsetTimeSpan.Hours);
            int minutes = Math.Abs(offsetTimeSpan.Minutes);

            return minutes == 0
                ? $"UTC{sign}{hours}"
                : $"UTC{sign}{hours}:{minutes:D2}";
        }
        catch
        {
            return "Invalid timezone";
        }
    }
    
    [HttpPut("update-timezone-enabled")]
    public async Task<IActionResult> UpdateIsTimezoneEnabled([FromBody] UpdateIsTimeZoneEnabledDto updatedIsTimezoneEnabled)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null)
            return Unauthorized();
    
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
    
        var existingSettings = await _context.UserSettings
            .FirstOrDefaultAsync(e => e.UserId == userId);

        if (existingSettings == null)
            return NotFound();

        existingSettings.IsTimeZoneEnabled = updatedIsTimezoneEnabled.IsTimeZoneEnabled;

        await _context.SaveChangesAsync();
        return NoContent();
    }
    
    [HttpPut("update-transaction-timeZone-visible")]
    public async Task<IActionResult> UpdateIsTransactionTimeZoneVisible([FromBody] UpdateIsTransactionTimeZoneVisibleDto updatedTransactionTimeZoneVisible)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null)
            return Unauthorized();
    
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
    
        var existingSettings = await _context.UserSettings
            .FirstOrDefaultAsync(e => e.UserId == userId);

        if (existingSettings == null)
            return NotFound();

        existingSettings.IsTransactionTimeZoneVisible = updatedTransactionTimeZoneVisible.IsTransactionTimeZoneVisible;

        await _context.SaveChangesAsync();
        return NoContent();
    }
    
    [HttpPut("update-use12HFormat")]
    public async Task<IActionResult> UpdateIsUse12HFormat([FromBody] UpdateIsUse12HFormatDto updateUse12HFormat)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null)
            return Unauthorized();
    
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
    
        var existingSettings = await _context.UserSettings
            .FirstOrDefaultAsync(e => e.UserId == userId);

        if (existingSettings == null)
            return NotFound();

        existingSettings.IsUse12HFormat = updateUse12HFormat.IsUse12HFormat;

        await _context.SaveChangesAsync();
        return NoContent();
    }
    
    [HttpPut("update-format-date-type")]
    public async Task<IActionResult> UpdateFormatDateType([FromBody] UpdateFormatDateTypeDto updateFormatDateType)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null)
            return Unauthorized();
    
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
    
        var existingSettings = await _context.UserSettings
            .FirstOrDefaultAsync(e => e.UserId == userId);

        if (existingSettings == null)
            return NotFound();

        existingSettings.FormatDateType = updateFormatDateType.FormatDateType;

        await _context.SaveChangesAsync();
        return NoContent();
    }
}