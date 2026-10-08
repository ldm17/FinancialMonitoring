using FinancialMonitoring.Api.Models;
using FinancialMonitoring.Api.Models.DataModels;
using FinancialMonitoring.Api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace FinancialMonitoring.Api.Services;

public class DefaultDataService
{
    private readonly AppDbContext _context;
    
    public DefaultDataService(AppDbContext context)
    {
        _context = context;
    }

    public async Task CreateDefaultWallets(string userId)
    {
        var defaultWallets = new List<Wallet>
        {
            new Wallet { UserId = userId, Name = "Наличные", Balance = 0, Currency = "RUB", CreatedAt = DateTime.UtcNow },
            new Wallet { UserId = userId, Name = "Банковская карта", Balance = 0, Currency = "RUB", CreatedAt = DateTime.UtcNow }
        };
        await _context.Wallets.AddRangeAsync(defaultWallets);
    }

    public async Task CreateDefaultCategories(string userId)
    {
        if (await _context.Categories.AnyAsync(c => c.UserId == userId))
            return;

        var templates = GetDefaultCategories().ToList();
        var categoryMap = new Dictionary<string, int>();
        
        var parents = templates
            .Where(t => t.ParentName == null)
            .Select(t => new Category 
            {
                UserId = userId,
                Name = t.Name,
                OperationType = t.OperationType
            })
            .ToList();

        await _context.Categories.AddRangeAsync(parents);
        await _context.SaveChangesAsync();
        
        foreach (var parent in parents)
            categoryMap[parent.Name] = parent.Id;
        
        var children = templates
            .Where(t => t.ParentName != null)
            .Select(t => 
            {
                if (!categoryMap.TryGetValue(t.ParentName, out var parentId))
                    throw new Exception($"Родительская категория '{t.ParentName}' не найдена");

                return new Category 
                {
                    UserId = userId,
                    Name = t.Name,
                    OperationType = t.OperationType,
                    ParentId = parentId
                };
            })
            .ToList();

        await _context.Categories.AddRangeAsync(children);
    }
    
    private static IEnumerable<CategoryTemplate> GetDefaultCategories()
    {
        return new List<CategoryTemplate>
        {
            // Расходы (OperationType = 0)
            // Родительские категории
            new() { Name = "Питание", OperationType = 0, ParentName = null },
            new() { Name = "Транспорт", OperationType = 0, ParentName = null },
            new() { Name = "Счета и коммунальные услуги", OperationType = 0, ParentName = null },
            new() { Name = "Развлечения и досуг", OperationType = 0, ParentName = null },
            new() { Name = "Покупки", OperationType = 0, ParentName = null },
            new() { Name = "Здоровье и фитнес", OperationType = 0, ParentName = null },
            new() { Name = "Образование", OperationType = 0, ParentName = null },
            new() { Name = "Подарки и пожертвования", OperationType = 0, ParentName = null },
            new() { Name = "Семья", OperationType = 0, ParentName = null },
            new() { Name = "Путешествия", OperationType = 0, ParentName = null },
            new() { Name = "Инвестиции", OperationType = 0, ParentName = null },
            new() { Name = "Налоги и сборы", OperationType = 0, ParentName = null },
            new() { Name = "Прочие расходы", OperationType = 0, ParentName = null },
            new() { Name = "Исходящий перевод", OperationType = 0, ParentName = null },

            // Доходы (OperationType = 1)
            // Родительские категории
            new() { Name = "Зарплата", OperationType = 1, ParentName = null },
            new() { Name = "Премия", OperationType = 1, ParentName = null },
            new() { Name = "Проценты", OperationType = 1, ParentName = null },
            new() { Name = "Подарки", OperationType = 1, ParentName = null },
            new() { Name = "Входящий перевод", OperationType = 1, ParentName = null },
            new() { Name = "Прочие поступления", OperationType = 1, ParentName = null },

            // Дочерние категории
            // Питание
            new() { Name = "Рестораны", OperationType = 0, ParentName = "Питание" },
            new() { Name = "Кафе", OperationType = 0, ParentName = "Питание" },

            // Транспорт
            new() { Name = "Такси", OperationType = 0, ParentName = "Транспорт" },
            new() { Name = "Топливо", OperationType = 0, ParentName = "Транспорт" },
            new() { Name = "Обслуживание автомобиля", OperationType = 0, ParentName = "Транспорт" },

            // Счета и коммунальные услуги
            new() { Name = "Счет за телефон", OperationType = 0, ParentName = "Счета и коммунальные услуги" },
            new() { Name = "Счет за воду", OperationType = 0, ParentName = "Счета и коммунальные услуги" },
            new() { Name = "Счет за электроэнергию", OperationType = 0, ParentName = "Счета и коммунальные услуги" },
            new() { Name = "Счет за интернет", OperationType = 0, ParentName = "Счета и коммунальные услуги" },
            new() { Name = "Арендные платежи", OperationType = 0, ParentName = "Счета и коммунальные услуги" },

            // Развлечения и досуг
            new() { Name = "Кино", OperationType = 0, ParentName = "Развлечения и досуг" },
            new() { Name = "Игры", OperationType = 0, ParentName = "Развлечения и досуг" },
            new() { Name = "Хобби", OperationType = 0, ParentName = "Развлечения и досуг" },

            // Покупки
            new() { Name = "Одежда", OperationType = 0, ParentName = "Покупки" },
            new() { Name = "Обувь", OperationType = 0, ParentName = "Покупки" },
            new() { Name = "Аксессуары", OperationType = 0, ParentName = "Покупки" },
            new() { Name = "Электроника", OperationType = 0, ParentName = "Покупки" },

            // Здоровье и фитнес
            new() { Name = "Аптека", OperationType = 0, ParentName = "Здоровье и фитнес" },
            new() { Name = "Спорт", OperationType = 0, ParentName = "Здоровье и фитнес" },
            new() { Name = "Врач", OperationType = 0, ParentName = "Здоровье и фитнес" },
            new() { Name = "Личная гигиена", OperationType = 0, ParentName = "Здоровье и фитнес" },

            // Образование
            new() { Name = "Школьные и университетские взносы", OperationType = 0, ParentName = "Образование" },
            new() { Name = "Учебные материалы", OperationType = 0, ParentName = "Образование" },
            new() { Name = "Курсы и тренинги", OperationType = 0, ParentName = "Образование" },
            new() { Name = "Репетиторы", OperationType = 0, ParentName = "Образование" },

            // Подарки и пожертвования
            new() { Name = "Свадьба", OperationType = 0, ParentName = "Подарки и пожертвования" },
            new() { Name = "Благотворительность", OperationType = 0, ParentName = "Подарки и пожертвования" },
            new() { Name = "Подарки", OperationType = 0, ParentName = "Подарки и пожертвования" },
            new() { Name = "Похороны", OperationType = 0, ParentName = "Подарки и пожертвования" },

            // Семья
            new() { Name = "Дети", OperationType = 0, ParentName = "Семья" },
            new() { Name = "Ремонт", OperationType = 0, ParentName = "Семья" },
            new() { Name = "Домашние расходы", OperationType = 0, ParentName = "Семья" },
            new() { Name = "Домашние животные", OperationType = 0, ParentName = "Семья" }
        };
    }
}