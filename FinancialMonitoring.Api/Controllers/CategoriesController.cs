using System.Security.Claims;
using FinancialMonitoring.Api.Models;
using FinancialMonitoring.Api.Models.DataModels;
using FinancialMonitoring.Api.Models.DTOs;
using FinancialMonitoring.Api.Models.Response;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinancialMonitoring.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriesController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetAllCategories()
    {
        var response = await _context.Categories
            .Select(c => new CategoryResponse
            {
                Id = c.Id,
                Name = c.Name,
                OperationType = c.OperationType,
                ParentId = c.ParentId,
                SortOrder = c.SortOrder,
            })
            .OrderBy(c => c.Id)
            .ToListAsync();

        return Ok(response);
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] Category category)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        category.UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;  // Установливаем UserId для новой категории
        
        // Нахождение максимального SortOrder среди категорий того же уровня
        var maxSortOrder = await _context.Categories
            .Where(c => c.ParentId == category.ParentId && c.OperationType == category.OperationType)
            .MaxAsync(c => (int?)c.SortOrder) ?? -1;
    
        category.SortOrder = maxSortOrder + 1;
        
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
    
        return CreatedAtAction(nameof(GetCategoryById), new { id = category.Id }, category);
    }
    
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCategories(int id, [FromBody] CategoryUpdateDto updatedCategory)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        var existingCategory = await _context.Categories.FirstOrDefaultAsync(e => e.Id == id);
        if (existingCategory == null)
            return NotFound();

        var oldParentId = existingCategory.ParentId;
        var oldSortOrder = existingCategory.SortOrder;
        
        existingCategory.Name = updatedCategory.Name;

        if (!string.IsNullOrEmpty(updatedCategory.Position))
        {
            var dropNode = await _context.Categories.FindAsync(updatedCategory.SortOrder);
            if (dropNode == null)
                return BadRequest("Drop node not found");

            await MoveCategoryAsync(existingCategory, dropNode, updatedCategory);
        }
        else
        {
            existingCategory.ParentId = updatedCategory.ParentId;
            existingCategory.SortOrder = updatedCategory.SortOrder;
        }

        await _context.SaveChangesAsync();

        if (HasCategoryChanged(existingCategory, oldParentId, oldSortOrder))
            await ReorderAfterMoveAsync(existingCategory, oldParentId, updatedCategory.OperationType);
        else if (!string.IsNullOrEmpty(updatedCategory.Position))
            await ReorderAfterMoveAsync(existingCategory, oldParentId, updatedCategory.OperationType);

        return NoContent();
    }

    private async Task MoveCategoryAsync(Category category, Category dropNode, CategoryUpdateDto dto)
    {
        switch (dto.Position)
        {
            case "inner":
                category.ParentId = dropNode.Id;
                var maxSort = await _context.Categories
                    .Where(c => c.ParentId == dropNode.Id && c.OperationType == dto.OperationType && c.Id != category.Id)
                    .MaxAsync(c => (int?)c.SortOrder) ?? -1;
                category.SortOrder = maxSort + 1;
                break;
            case "before":
                category.ParentId = dropNode.ParentId;
                category.SortOrder = dropNode.SortOrder;
                await ShiftSiblingsAsync(dropNode.ParentId, dto.OperationType, dropNode.SortOrder, int.MaxValue, category.Id);
                break;
            case "after":
                category.ParentId = dropNode.ParentId;
                category.SortOrder = dropNode.SortOrder + 1;
                await ShiftSiblingsAsync(dropNode.ParentId, dto.OperationType, dropNode.SortOrder + 1, int.MaxValue, category.Id);
                break;
            default:
                category.ParentId = dto.ParentId;
                category.SortOrder = dto.SortOrder;
                break;
        }
    }

    private async Task ShiftSiblingsAsync(int? parentId, int operationType, int fromSortOrder, int toSortOrder, int excludeId)
    {
        var siblings = await _context.Categories
            .Where(c => c.ParentId == parentId && c.OperationType == operationType && c.Id != excludeId && c.SortOrder >= fromSortOrder && c.SortOrder < toSortOrder)
            .ToListAsync();
        foreach (var s in siblings) s.SortOrder++;
    }

    private bool HasCategoryChanged(Category category, int? oldParentId, int oldSortOrder) =>
        category.ParentId != oldParentId || category.SortOrder != oldSortOrder;

    private async Task ReorderAfterMoveAsync(Category category, int? oldParentId, int operationType)
    {
        if (oldParentId != category.ParentId && oldParentId != null)
            await ReorderCategoriesByParentAsync(oldParentId, operationType);
        await ReorderCategoriesByParentAsync(category.ParentId, operationType);
        await _context.SaveChangesAsync();
    }

    private async Task ReorderCategoriesByParentAsync(int? parentId, int operationType)
    {
        var categories = await _context.Categories
            .Where(c => c.OperationType == operationType)
            .Where(c => parentId == null ? c.ParentId == null : c.ParentId == parentId)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Id)
            .ToListAsync();

        for (int i = 0; i < categories.Count; i++)
            categories[i].SortOrder = i;
    }
    
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetCategoryById(int id)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(e => e.Id == id);

        if (category == null)
            return NotFound();
        
        return Ok(category);
    }
    
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCategoryById(int id)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(e => e.Id == id);

        if (category == null)
            return NotFound();

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
