using FinancialMonitoringMVC.Models;
using FinancialMonitoringMVC.Models.DataModels;
using FinancialMonitoringMVC.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using System.Text.Json;

namespace FinancialMonitoringMVC.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TransactionsController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetAllTransactions([FromQuery]int operationType, [FromQuery] int walletId)
    {
        var record = await _context.Transactions
            .Where(t => t.OperationType == operationType && t.WalletId == walletId) 
            .ToListAsync();
        return Ok(record);
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateTransaction([FromBody] TransactionCreateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var transaction = new Transaction
        {
            WalletId = dto.WalletId,
            CategoryId = dto.CategoryId,
            OperationType = dto.OperationType,
            Amount = dto.Amount,
            CreatedAtUtc = dto.CreatedAtUtc.ToUniversalTime(),
            CreatedAt = dto.CreatedAtUtc,
            Description = dto.Description,
            IsIgnoredInCalculation = dto.IsIgnoredInCalculation,
            IsFavorite = dto.IsFavorite,
            TimeZone = dto.TimeZone,
        };
        
        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();
    
        return CreatedAtAction(nameof(GetTransactionById), new { id = transaction.Id }, transaction);
    }
    
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTransaction(int id, [FromBody] TransactionUpdateDto updatedTransaction)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        var existingTransaction = await _context.Transactions
            .FirstOrDefaultAsync(e => e.Id == id);

        if (existingTransaction == null)
            return NotFound();

        existingTransaction.CategoryId = updatedTransaction.CategoryId;
        existingTransaction.Amount = updatedTransaction.Amount;
        existingTransaction.CreatedAtUtc = updatedTransaction.CreatedAtUtc.ToUniversalTime();
        existingTransaction.CreatedAt = updatedTransaction.CreatedAtUtc;
        existingTransaction.Description = updatedTransaction.Description;
        existingTransaction.IsIgnoredInCalculation = updatedTransaction.IsIgnoredInCalculation;
        existingTransaction.IsFavorite = updatedTransaction.IsFavorite;
        existingTransaction.OperationType = updatedTransaction.OperationType;
        existingTransaction.WalletId = updatedTransaction.WalletId;
        existingTransaction.TimeZone = updatedTransaction.TimeZone;

        await _context.SaveChangesAsync();
        return NoContent();
    }
    
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetTransactionById(int id)
    {
        var transaction = await _context.Transactions
            .FirstOrDefaultAsync(e => e.Id == id);

        if (transaction == null)
            return NotFound();
        
        return Ok(transaction);
    }
    
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTransactionById(int id)
    {
        var transaction = await _context.Transactions
            .FirstOrDefaultAsync(e => e.Id == id);

        if (transaction == null)
            return NotFound();

        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}