// using FinancialMonitoringMVC.Models;
// using Microsoft.EntityFrameworkCore;
// using System.Collections.Generic;
// namespace FinancialMonitoringMVC;
//
// public static class SeedData
// {
//     public static void Initialize(AppDbContext context)
//     {
//         // Проверяем, есть ли уже категории в базе данных
//         if (context.Categories.Any())
//         {
//             return; // Если категории уже существуют, выходим
//         }
//
//         // Локальные массивы категорий
//         var categories = new List<Category>
//         {
//             new Category 
//             { 
//                 Id = 1, 
//                 UserId = "0", 
//                 Name = "Питание", 
//                 Children = new List<Category>
//                 {
//                     new Category { Id = 15, UserId = "0", Name = "Рестораны" },
//                     new Category { Id = 16, UserId = "0", Name = "Кафе" }
//                 } 
//             },
//             new Category 
//             { 
//                 Id = 2, 
//                 UserId = "0", 
//                 Name = "Транспорт", 
//                 Children = new List<Category>
//                 {
//                     new Category { Id = 17, UserId = "0", Name = "Такси" },
//                     new Category { Id = 18, UserId = "0", Name = "Топливо" },
//                     new Category { Id = 19, UserId = "0", Name = "Обслуживание автомобиля" }
//                 } 
//             },
//             new Category 
//             { 
//                 Id = 3, 
//                 UserId = "0", 
//                 Name = "Счета и коммунальные услуги", 
//                 Children = new List<Category>
//                 {
//                     new Category { Id = 20, UserId = "0", Name = "Счет за телефон" },
//                     new Category { Id = 21, UserId = "0", Name = "Счет за воду" },
//                     new Category { Id = 22, UserId = "0", Name = "Счет за электроэнергию" },
//                     new Category { Id = 23, UserId = "0", Name = "Счет за интернет" },
//                     new Category { Id = 24, UserId = "0", Name = "Арендные платы" }
//                 } 
//             },
//             new Category 
//             { 
//                 Id = 4, 
//                 UserId = "0", 
//                 Name = "Развлечения и досуг", 
//                 Children = new List<Category>
//                 {
//                     new Category { Id = 25, UserId = "0", Name = "Кино" },
//                     new Category { Id = 26, UserId = "0", Name = "Игры" },
//                     new Category { Id = 27, UserId = "0", Name = "Хобби" }
//                 } 
//             },
//             new Category 
//             { 
//                 Id = 5, 
//                 UserId = "0", 
//                 Name = "Покупки", 
//                 Children = new List<Category>
//                 {
//                     new Category { Id = 28, UserId = "0", Name = "Одежда" },
//                     new Category { Id = 29, UserId = "0", Name = "Обувь" },
//                     new Category { Id = 30, UserId = "0", Name = "Аксессуары" },
//                     new Category { Id = 31, UserId = "0", Name = "Электроника" }
//                 } 
//             },
//             new Category 
//             { 
//                 Id = 6, 
//                 UserId = "0", 
//                 Name = "Здоровье и фитнесс", 
//                 Children = new List<Category>
//                 {
//                     new Category { Id = 32, UserId = "0", Name = "Аптека" },
//                     new Category { Id = 33, UserId = "0", Name = "Спорт" },
//                     new Category { Id = 34, UserId = "0", Name = "Врач" },
//                     new Category { Id = 35, UserId = "0", Name = "Личная гигиена" }
//                 } 
//             },
//             new Category 
//             { 
//                 Id = 7, 
//                 UserId = "0", 
//                 Name = "Образование", 
//                 Children = new List<Category>
//                 {
//                     new Category { Id = 36, UserId = "0", Name = "Школьные и университетские взносы" },
//                     new Category { Id = 37, UserId = "0", Name = "Учебные материалы" },
//                     new Category { Id = 38, UserId = "0", Name = "Курсы и тренинги" },
//                     new Category { Id = 39, UserId = "0", Name = "Репетиторы" }
//                 } 
//             },
//             new Category 
//             { 
//                 Id = 8, 
//                 UserId = "0", 
//                 Name = "Подарки и пожертвования", 
//                 Children = new List<Category>
//                 {
//                     new Category { Id = 40, UserId = "0", Name = "Свадьба" },
//                     new Category { Id = 41, UserId = "0", Name = "Учебные материалы" },
//                     new Category { Id = 42, UserId = "0", Name = "Благотворительность" },
//                     new Category { Id = 43, UserId = "0", Name = "Похороны" }
//                 } 
//             },
//             new Category 
//             { 
//                 Id = 9, 
//                 UserId = "0", 
//                 Name = "Семья", 
//                 Children = new List<Category>
//                 {
//                     new Category { Id = 44, UserId = "0", Name = "Дети" },
//                     new Category { Id = 45, UserId = "0", Name = "Ремонт" },
//                     new Category { Id = 46, UserId = "0", Name = "Домашние расходы" },
//                     new Category { Id = 47, UserId = "0", Name = "Домашние животные" }
//                 } 
//             },
//             new Category { Id = 10, UserId = "0", Name = "Путешествия" },
//             new Category { Id = 11, UserId = "0", Name = "Инвестиции" },
//             new Category { Id = 12, UserId = "0", Name = "Налоги и сборы" },
//             new Category { Id = 13, UserId = "0", Name = "Прочие расходы" },
//             new Category { Id = 14, UserId = "0", Name = "Исходящий перевод" }
//         };
//
//         var categoriesIncomes = new List<Category>
//         {
//             new Category { Id = 55, UserId = "0", Name = "Зарплата" },
//             new Category { Id = 56, UserId = "0", Name = "Премия" },
//             new Category { Id = 57, UserId = "0", Name = "Проценты" },
//             new Category { Id = 58, UserId = "0", Name = "Подарки" },
//             new Category { Id = 59, UserId = "0", Name = "Прочие поступления" }
//         };
//
//         // Импортируем категории в базу данных
//         ImportCategories(context, categories, operationType: 0); // Расходы
//         ImportCategories(context, categoriesIncomes, operationType: 1); // Доходы
//     }
//
//     private static void ImportCategories(AppDbContext context, List<Category> categories, int operationType)
//     {
//         foreach (var category in categories)
//         {
//             // Создаем объект категории
//             var dbCategory = new Category
//             {
//                 Id = category.Id,
//                 UserId = category.UserId,
//                 Name = category.Name,
//                 OperationType = operationType,
//                 ParentId = null // Для родительских категорий ParentId изначально null
//             };
//
//             // Добавляем категорию в базу данных
//             context.Categories.Add(dbCategory);
//
//             // Если есть дочерние категории, обрабатываем их рекурсивно
//             if (category.Children != null && category.Children.Any())
//             {
//                 foreach (var child in category.Children)
//                 {
//                     var dbChild = new Category
//                     {
//                         Id = child.Id,
//                         UserId = child.UserId,
//                         Name = child.Name,
//                         OperationType = operationType,
//                         ParentId = dbCategory.Id // ParentId указывает на Id родительской категории
//                     };
//
//                     context.Categories.Add(dbChild);
//                 }
//             }
//         }
//
//         // Сохраняем изменения в базе данных
//         context.SaveChanges();
//     }
// }