// src/services/menu/menu.service.ts
import { db } from '@/lib/db'
import { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest, MenuFilters } from '@/types/restaurant'
import { AuditService } from '../audit/audit.service'

export class MenuService {
  /**
   * Get menu items for a restaurant
   */
  static async getMenuItems(
    restaurantId: string,
    filters?: MenuFilters
  ): Promise<MenuItem[]> {
    try {
      const where: Record<string, any> = { restaurantId }
      if (filters?.category) where.category = filters.category
      if (filters?.isAvailable !== undefined) where.isAvailable = filters.isAvailable
      if (filters?.isVegan !== undefined) where.isVegan = filters.isVegan
      if (filters?.isVegetarian !== undefined) where.isVegetarian = filters.isVegetarian
      if (filters?.isGlutenFree !== undefined) where.isGlutenFree = filters.isGlutenFree
      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
      if (filters?.priceMin !== undefined || filters?.priceMax !== undefined) {
        where.price = {}
        if (filters.priceMin !== undefined) where.price.gte = filters.priceMin
        if (filters.priceMax !== undefined) where.price.lte = filters.priceMax
      }

      return await db.menuItem.findMany({
        where,
        orderBy: [
          { sortOrder: 'asc' },
          { category: 'asc' },
          { name: 'asc' }
        ],
        include: { restaurant: true }
      })
    } catch (error) {
      console.error(`[MenuService] Error fetching menu items:`, error)
      // throw new AppError('MENU_ITEMS_FETCH_FAIL', 'Failed to fetch menu items')
      throw new Error('Failed to fetch menu items')
    }
  }

  static async getMenuItem(id: string): Promise<MenuItem | null> {
    try {
      return await db.menuItem.findUnique({
        where: { id },
        include: { restaurant: true, orderItems: true }
      })
    } catch (error) {
      console.error(`[MenuService] Error fetching menu item:`, error)
      throw new Error('Failed to fetch menu item')
    }
  }

  static async createMenuItem(
    restaurantId: string,
    data: CreateMenuItemRequest,
    userId?: string
  ): Promise<MenuItem> {
    try {
      if (!data.category) throw new Error('Category required')
      const menuItem = await db.menuItem.create({
        data: {
          ...data,
          restaurantId,
          sortOrder: await this.getNextSortOrder(restaurantId, data.category)
        },
        include: { restaurant: true }
      })
      await AuditService.log('MENU_ITEM_CREATED', 'MenuItem', menuItem.id, {
        restaurantId,
        userId,
        data: { name: data.name, price: data.price }
      })
      return menuItem
    } catch (error) {
      console.error(`[MenuService] Error creating menu item:`, error)
      throw new Error('Failed to create menu item')
    }
  }

  static async updateMenuItem(
    id: string,
    data: UpdateMenuItemRequest,
    userId?: string
  ): Promise<MenuItem> {
    try {
      const currentItem = await this.getMenuItem(id)
      if (!currentItem) throw new Error('Menu item not found')

      const updatedItem = await db.menuItem.update({
        where: { id },
        data: { ...data, updatedAt: new Date() },
        include: { restaurant: true }
      })
      await AuditService.log('MENU_ITEM_UPDATED', 'MenuItem', id, {
        restaurantId: currentItem.restaurantId,
        userId,
        oldValues: currentItem,
        newValues: data
      })
      return updatedItem
    } catch (error) {
      console.error(`[MenuService] Error updating menu item:`, error)
      throw new Error('Failed to update menu item')
    }
  }

  static async deleteMenuItem(id: string, userId?: string): Promise<void> {
    try {
      const menuItem = await this.getMenuItem(id)
      if (!menuItem) throw new Error('Menu item not found')
      await db.menuItem.delete({ where: { id } })
      await AuditService.log('MENU_ITEM_DELETED', 'MenuItem', id, {
        restaurantId: menuItem.restaurantId,
        userId,
        data: { name: menuItem.name }
      })
    } catch (error) {
      console.error(`[MenuService] Error deleting menu item:`, error)
      throw new Error('Failed to delete menu item')
    }
  }

  static async toggleAvailability(id: string, userId?: string): Promise<MenuItem> {
    try {
      const menuItem = await this.getMenuItem(id)
      if (!menuItem) throw new Error('Menu item not found')

      const updatedItem = await db.menuItem.update({
        where: { id },
        data: { isAvailable: !menuItem.isAvailable, updatedAt: new Date() },
        include: { restaurant: true }
      })
      await AuditService.log('MENU_ITEM_AVAILABILITY_TOGGLED', 'MenuItem', id, {
        restaurantId: menuItem.restaurantId,
        userId,
        data: { name: menuItem.name, isAvailable: updatedItem.isAvailable }
      })
      return updatedItem
    } catch (error) {
      console.error(`[MenuService] Error toggling menu item availability:`, error)
      throw new Error('Failed to toggle menu item availability')
    }
  }

  static async getCategories(restaurantId: string): Promise<string[]> {
    try {
      const items = await db.menuItem.findMany({
        where: { restaurantId },
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' }
      })
      return items.map(item => item.category)
    } catch (error) {
      console.error(`[MenuService] Error fetching categories:`, error)
      throw new Error('Failed to fetch categories')
    }
  }

  static async updateStock(
    id: string,
    stockCount: number,
    userId?: string
  ): Promise<MenuItem> {
    try {
      const menuItem = await this.getMenuItem(id)
      if (!menuItem) throw new Error('Menu item not found')

      const updatedItem = await db.menuItem.update({
        where: { id },
        data: {
          stockCount,
          isAvailable: stockCount > 0,
          updatedAt: new Date()
        },
        include: { restaurant: true }
      })
      if (menuItem.lowStockAlert && stockCount <= menuItem.lowStockAlert) {
        // TODO: Trigger low stock alert (notification system)
        console.warn(`[MenuService] Low stock alert: ${menuItem.name} has ${stockCount} left`)
      }
      await AuditService.log('MENU_ITEM_STOCK_UPDATED', 'MenuItem', id, {
        restaurantId: menuItem.restaurantId,
        userId,
        data: { name: menuItem.name, oldStock: menuItem.stockCount, newStock: stockCount }
      })
      return updatedItem
    } catch (error) {
      console.error(`[MenuService] Error updating stock:`, error)
      throw new Error('Failed to update menu item stock')
    }
  }

  static async reorderItems(
    restaurantId: string,
    itemOrders: Array<{ id: string; sortOrder: number }>,
    userId?: string
  ): Promise<void> {
    try {
      await db.$transaction(
        itemOrders.map(({ id, sortOrder }) =>
          db.menuItem.update({ where: { id, restaurantId }, data: { sortOrder } })
        )
      )
      await AuditService.log('MENU_ITEMS_REORDERED', 'MenuItem', 'multiple', {
        restaurantId,
        userId,
        data: { itemCount: itemOrders.length }
      })
    } catch (error) {
      console.error(`[MenuService] Error reordering items:`, error)
      throw new Error('Failed to reorder menu items')
    }
  }

  static async getPopularItems(
    restaurantId: string,
    limit = 10
  ): Promise<MenuItem[]> {
    try {
      const popularItems = await db.orderItem.groupBy({
        by: ['menuItemId'],
        where: {
          order: { restaurantId, status: { in: ['DELIVERED', 'COMPLETED'] } }
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: limit
      })

      const menuItemIds = popularItems.map(item => item.menuItemId)
      if (menuItemIds.length === 0) return []

      return await db.menuItem.findMany({
        where: { id: { in: menuItemIds }, isAvailable: true },
        include: { restaurant: true }
      })
    } catch (error) {
      console.error(`[MenuService] Error fetching popular items:`, error)
      throw new Error('Failed to fetch popular items')
    }
  }

  /**
   * Get next sort order for a category
   */
  private static async getNextSortOrder(
    restaurantId: string,
    category: string
  ): Promise<number> {
    if (!category) return 1
    const lastItem = await db.menuItem.findFirst({
      where: { restaurantId, category },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true }
    })
    return (lastItem?.sortOrder || 0) + 1
  }
}
