using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FinancialMonitoring.Api;
using FinancialMonitoring.Api.Models.Authentication;
using FinancialMonitoring.Api.Models.DataModels;
using FinancialMonitoring.Api.Models.Request;
using FinancialMonitoring.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _context;
    private readonly DefaultDataService _defaultDataService;

    public AuthController(UserManager<IdentityUser> userManager, IConfiguration configuration, AppDbContext context, DefaultDataService defaultDataService)
    {
        _userManager = userManager;
        _configuration = configuration;
        _context = context;
        _defaultDataService = defaultDataService;
    }
    
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterModel model)
    {
        var userExists = await _userManager.FindByEmailAsync(model.Email);
        if (userExists != null)
        {
            return BadRequest(new { message = "User already exists" });
        }

        var user = new IdentityUser
        {
            Email = model.Email,
            UserName = model.Email
        };

        var result = await _userManager.CreateAsync(user, model.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = "User creation failed", errors = result.Errors });
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            await _defaultDataService.CreateDefaultWallets(user.Id);
            await _defaultDataService.CreateDefaultCategories(user.Id);
            
            var (accessToken, refreshToken) = await GenerateTokens(user);
            await _context.RefreshTokens.AddAsync(refreshToken);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(accessToken),
                refreshToken,
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "Error creating user or default data", error = ex.Message });
        }
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
        {
            return BadRequest(new { message = "Invalid email or password" });
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var (accessToken, refreshToken) = await GenerateTokens(user);
            await _context.RefreshTokens.AddAsync(refreshToken);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(accessToken),
                refreshToken,
            });
        }
        catch
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "Error during login" });
        }
    }
    
    [HttpPost("check-user-exists")]
    public async Task<IActionResult> CheckUserExists([FromBody] CheckUserExistsRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        return Ok(new { exists = user != null });
    }
    
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:RefreshKey"]);

        try
        {
            var principal = tokenHandler.ValidateToken(request.RefreshToken, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            }, out var validatedToken);

            var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();
            
            var refreshTokenInDb = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken && rt.UserId == userId);
            
            if (refreshTokenInDb == null || refreshTokenInDb.ExpiryDate < DateTimeOffset.UtcNow)
            {
                return Unauthorized(new { message = "Invalid or expired refresh token" });
            }
            
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return Unauthorized();
            
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                _context.RefreshTokens.Remove(refreshTokenInDb);
                
                var (newAccessToken, newRefreshToken) = await GenerateTokens(user);
                await _context.RefreshTokens.AddAsync(newRefreshToken);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(newAccessToken),
                    refreshToken = newRefreshToken
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Error refreshing token", error = ex.Message });
            }
        }
        catch
        {
            return Unauthorized();
        }
    }
    
    private async Task<(JwtSecurityToken accessToken, RefreshToken refreshToken)> GenerateTokens(IdentityUser user)
    {
        var jti = Guid.NewGuid().ToString();
        
        var authClaims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(JwtRegisteredClaimNames.Jti, jti)
        };

        var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var accessToken = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            expires: DateTimeOffset.UtcNow.AddHours(3).UtcDateTime,
            claims: authClaims,
            signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
        );
        
        var refreshToken = new RefreshToken
        {
            Token = new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(
                expires: DateTimeOffset.UtcNow.AddDays(7).UtcDateTime,
                claims: new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(JwtRegisteredClaimNames.Jti, jti),
                },
                signingCredentials: new SigningCredentials(
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:RefreshKey"])),
                    SecurityAlgorithms.HmacSha256
                )
            )),
            UserId = user.Id,
            AccessTokenJti = jti,
            // ExpiryDate = DateTime.UtcNow.AddDays(7)
            ExpiryDate = DateTimeOffset.UtcNow.AddDays(7)
        };

        return (accessToken, refreshToken);
    }
    
    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var jti = User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(jti))
        {
            return Unauthorized(new { message = "User not authenticated" });
        }
        
        var refreshTokenToRemove = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.UserId == userId && rt.AccessTokenJti == jti);

        if (refreshTokenToRemove != null)
        {
            _context.RefreshTokens.Remove(refreshTokenToRemove);
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Logged out successfully" });
    }
    
    // TODO: Удалить, временно используется для быстрой очистки
    [HttpDelete("delete-user")]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "Пользователь не найден" });
        }
        
        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = "Ошибка при удалении пользователя", errors = result.Errors });
        }
        
        return Ok(new { message = "Пользователь успешно удален" });
    }
}