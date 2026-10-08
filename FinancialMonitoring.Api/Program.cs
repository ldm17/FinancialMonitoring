using System.Text;
using System.Text.Json.Serialization;
using FinancialMonitoring.Api;
using FinancialMonitoring.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpContextAccessor(); // Регистрация IHttpContextAccessor

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Добавление Identity
builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// Настройка JWT
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]);

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddAuthorization();

// Регистрация DefaultDataService в DI
builder.Services.AddScoped<DefaultDataService>();

try
{
    using (var scope = builder.Services.BuildServiceProvider().CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        context.Database.OpenConnection();
        Console.WriteLine("Соединение с базой данных успешно установлено.");
        context.Database.CloseConnection();
        
        // Заполняем базу данных начальными данными
        // SeedData.Initialize(context);
        // Console.WriteLine($"Категории успешно добавлены в базу данных.");
    }
}
catch (Exception ex)
{
    Console.WriteLine("Ошибка при подключении к базе данных:");
    Console.WriteLine(ex.Message);
}


// // Добавляем сервисы для контроллеров
// builder.Services.AddControllersWithViews()
//     .AddJsonOptions(options =>
//     {
//         options.JsonSerializerOptions.WriteIndented = true; // Включаем отступы
//         options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
//     });

builder.Services.AddControllers() // только API‑контроллеры
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.WriteIndented = true;
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        builder =>
        {
            builder.AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});

// OpenAPI/Swagger (как в шаблоне Web API)
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();               // Swagger UI в dev‑режиме
}
// app.UseHttpsRedirection();        // типично для API‑проекта

app.UseCors("AllowAllOrigins");

// Используем аутентификацию и авторизацию
app.UseAuthentication();
app.UseAuthorization();

// // Устанавливаем сопоставление маршрутов с контроллерами
// app.MapControllerRoute(
//     name: "default",
//     pattern: "{controller=Home}/{action=Index}/{id?}");

// Для API-контроллеров используем атрибутную маршрутизацию
app.MapControllers();

// // Добавляем маршрут для ExpensesController
// app.MapControllerRoute(
//     name: "expenses",
//     pattern: "{controller=Expenses}/{action=GetExpenses}/{id?}");
//
// // Добавляем маршрут для IncomesController
// app.MapControllerRoute(
//     name: "incomes",
//     pattern: "{controller=Incomes}/{action=GetIncomes}/{id?}");

app.Run();