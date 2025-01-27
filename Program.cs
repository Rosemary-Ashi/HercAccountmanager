using AccountManagement.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;


// Add services to the container.
var connectionstring = builder.Configuration.GetConnectionString("DefaultConnectionString");

//Add DB Context
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionstring));
builder.Services.AddScoped<CustomerService>(); // Register your service
builder.Services.AddControllers();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminPolicy", policy => policy.RequireRole("Admin"));
    options.AddPolicy("MemberPolicy", policy => policy.RequireRole("Member"));
});

builder.Services.AddIdentityApiEndpoints<ApplicationUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS configuration
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});


var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
//app.UseSwaggerUI();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/Accountmanager/swagger/v1/swagger.json", "My API V1");
    c.RoutePrefix = "docs";
});
app.UseCors();
app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
//using (var scope = app.Services.CreateScope())
//{
//    var RoleManager =
//        scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

//    var roles = new[] { "Admin", "Manager", "Member" };

//    foreach (var role in roles)
//    {
//        if (!await RoleManager.RoleExistsAsync(role))
//            await RoleManager.CreateAsync(new IdentityRole(role));
//    }
//}

//using (var scope = app.Services.CreateScope())
//{
//    var UserManager =
//        scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

//    string email = "admin@admin.com";
//    string password = "Test%123#";

//    if (await UserManager.FindByEmailAsync(email) == null)
//    {
//        var user = new ApplicationUser();
//        user.UserName = email;
//        user.Email = email;

//        await UserManager.CreateAsync(user, password);

//        await UserManager.AddToRoleAsync(user, "Admin");
//    }
//}