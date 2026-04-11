using System.Security.Claims;
using FinancialMonitoringMVC.Models;
using FinancialMonitoringMVC.Models.DataModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinancialMonitoringMVC.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class WalletsController : ControllerBase
{
    private readonly AppDbContext _context;

    public WalletsController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetAllWallets()
    {
        var response = await _context.Wallets
            .Include(w => w.Transactions)
            .OrderBy(wallet => wallet.Id)
            .ToListAsync();
        
        if (response.Count == 0)
            return NotFound();
        
        return Ok(response);
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateWallet([FromBody] Wallet wallet)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        wallet.UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        wallet.CreatedAt = DateTimeOffset.UtcNow;
        _context.Wallets.Add(wallet);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetWalletById), new { id = wallet.Id }, wallet);
    }
    
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateWallet(int id, [FromBody] Wallet updatedWallet)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        var existingWallet = await _context.Wallets
            .FirstOrDefaultAsync(e => e.Id == id);

        if (existingWallet == null)
            return NotFound();
        
        existingWallet.Name = updatedWallet.Name;
        existingWallet.Balance = updatedWallet.Balance;
        existingWallet.Currency = updatedWallet.Currency;
        existingWallet.Description = updatedWallet.Description;

        await _context.SaveChangesAsync();
        return NoContent();
    }
    
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetWalletById(int id)
    {
        var wallet = await _context.Wallets
            .Include(w => w.Transactions)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (wallet == null)
            return NotFound();
        
        return Ok(wallet);
    }
    
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteWalletById(int id)
    {
        var wallet = await _context.Wallets
            .FirstOrDefaultAsync(e => e.Id == id);

        if (wallet == null)
            return NotFound();

        _context.Wallets.Remove(wallet);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}