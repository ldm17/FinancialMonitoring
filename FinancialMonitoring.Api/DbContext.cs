using System.Globalization;
using System.Security.Claims;
using FinancialMonitoring.Api.Models;
using FinancialMonitoring.Api.Models.DataModels;
using FinancialMonitoring.Api.Utils;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace FinancialMonitoring.Api;

public class AppDbContext : IdentityDbContext<IdentityUser>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    
    public AppDbContext(DbContextOptions options, IHttpContextAccessor httpContextAccessor)
        : base(options)
    {
        _httpContextAccessor = httpContextAccessor;
    }
    
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<Wallet> Wallets { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<UserSettings> UserSettings { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Настройка конвертера типа даты со смещением
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.Property(e => e.CreatedAt)
                .HasColumnType("text")
                .HasConversion(new CreatedAtConverter());
        });
        
        // Настройка связи один-ко-многим между Wallet и Transaction
        modelBuilder.Entity<Transaction>()
            .HasOne<Wallet>(t => t.Wallet) // Навигационное свойство
            .WithMany(w => w.Transactions) // Кошелек имеет много транзакций
            .HasForeignKey(t => t.WalletId); // Внешний ключ
        
        // Настройка связи многие-к-одному между Transaction и Category
        modelBuilder.Entity<Transaction>()
            .HasOne<Category>() // Транзакция имеет одну категорию
            .WithMany(c => c.Transactions) // Категория может иметь много транзакций
            .HasForeignKey(t => new { t.CategoryId, t.OperationType }) // Составной внешний ключ
            .HasPrincipalKey(c => new { c.Id, c.OperationType }); // Составной первичный ключ
        
        // Связь один-ко-многим между IdentityUser и Wallet
        modelBuilder.Entity<Wallet>()
            .HasOne<IdentityUser>() // Кошелек принадлежит одному пользователю
            .WithMany() // У пользователя может быть много кошельков
            .HasForeignKey(w => w.UserId) // Внешний ключ
            .OnDelete(DeleteBehavior.Cascade); // Каскадное удаление
        
        // Связь один-ко-многим между IdentityUser и Category
        modelBuilder.Entity<Category>()
            .HasOne<IdentityUser>() // Категория принадлежит одному пользователю
            .WithMany() // У пользователя может быть много категорий
            .HasForeignKey(c => c.UserId) // Внешний ключ
            .OnDelete(DeleteBehavior.Cascade); // Каскадное удаление
        
        // Каскадное удаление дочерних категорий
        modelBuilder.Entity<Category>()
            .HasMany(c => c.ChildCategories) // Навигационное свойство для дочерних категорий
            .WithOne() // Связь один-ко-многим
            .HasForeignKey(c => c.ParentId) // Внешний ключ
            .OnDelete(DeleteBehavior.Cascade); // Каскадное удаление

        // Значение по умолчанию для свойства SortOrder
        modelBuilder.Entity<Category>()
            .Property(c => c.SortOrder)
            .HasDefaultValue(0);
        
        // Связь один-ко-многим между IdentityUser и RefreshToken
        modelBuilder.Entity<RefreshToken>()
            .HasOne<IdentityUser>()
            .WithMany()
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Индекс для ускорения поиска по токену
        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => rt.Token)
            .IsUnique();
        
        // Связь один-к-одному между IdentityUser и UserSettings
        modelBuilder.Entity<UserSettings>()
            .HasOne(us => us.User)
            .WithOne()                           // У IdentityUser может быть только один UserSettings
            .HasForeignKey<UserSettings>(us => us.UserId)  // Внешний ключ
            .OnDelete(DeleteBehavior.Cascade);   // При удалении пользователя удалять и настройки

        // Уникальность UserId
        modelBuilder.Entity<UserSettings>()
            .HasIndex(us => us.UserId)
            .IsUnique(); // Один UserSettings на одного пользователя
        
        // Установка значения формата даты по умолчанию
        modelBuilder.Entity<UserSettings>()
            .Property(us => us.FormatDateType)
            .HasDefaultValue(1);
        
        // Глобальный фильтр для Wallet
        modelBuilder.Entity<Wallet>().HasQueryFilter(w => w.UserId == GetCurrentUserId());

        // Глобальный фильтр для Category
        modelBuilder.Entity<Category>().HasQueryFilter(c => c.UserId == GetCurrentUserId());

        // Глобальный фильтр для Transaction (через Wallet)
        modelBuilder.Entity<Transaction>().HasQueryFilter(t => t.Wallet.UserId == GetCurrentUserId());
        
        // Глобальный фильтр для UserSettings
        modelBuilder.Entity<UserSettings>().HasQueryFilter(us => us.UserId == GetCurrentUserId());
    }
    
    // Метод для получения UserId текущего пользователя
    private string GetCurrentUserId()
    {
        var userId = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userId;
    }
}
