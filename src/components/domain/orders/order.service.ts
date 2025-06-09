
// src/services/order/order.service.ts
import { db, withTransaction } from '@/lib/db'
import { 
  Order, 
  CreateOrderRequest, 
  UpdateOrderRequest,
  OrderFilters,
  OrderStatus,
  PaymentStatus
} from '@/types/restaurant'
import { AuditService } from '../audit/audit.service'
import { MenuService } from '../menu/menu.service'

// Custom error class
class AppError extends Error {
  constructor(public code: string, message: string) {
    super(message)
    this.name = 'AppError'
  }
}

export class OrderService {
  /**
   * Get a single order by ID
   */
  static async getOrder(id: string): Promise<Order | null> {
    try {
      return await db.order.findUnique({
        where: { id },
        include: {
          items: { include: { menuItem: true } },
          customer: true,
          restaurant: true,
          promoCode: true,
        }
      })
    } catch (error) {
      console.error('[OrderService] Error fetching order:', error)
      throw new AppError('ORDER_FETCH_FAIL', 'Failed to fetch order')
    }
  }

  /**
   * List orders with filters & pagination
   */
  static async listOrders(
    restaurantId: string, 
    filters: OrderFilters = {}, 
    limit = 25, 
    offset = 0
  ): Promise<Order[]> {
    try {
      const where: any = { restaurantId }
      if (filters.status) where.status = { in: filters.status }
      if (filters.type) where.type = { in: filters.type }
      if (filters.customerId) where.customerId = filters.customerId
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {}
        if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom)
        if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo)
      }
      if (filters.search) {
        where.OR = [
          { orderNumber: { contains: filters.search, mode: 'insensitive' } },
          { customer: { name: { contains: filters.search, mode: 'insensitive' } } }
        ]
      }
      return await db.order.findMany({
        where,
        include: {
          items: { include: { menuItem: true } },
          customer: true,
          restaurant: true,
          promoCode: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      })
    } catch (error) {
      console.error('[OrderService] Error listing orders:', error)
      throw new AppError('ORDER_LIST_FAIL', 'Failed to list orders')
    }
  }

  /**
   * Create a new order (atomic with stock update)
   */
  static async createOrder(
    restaurantId: string,
    data: CreateOrderRequest,
    userId?: string
  ): Promise<Order> {
    return await withTransaction(async (prisma) => {
      // Check menu item stock, prices, etc. (menuItemIds, quantities)
      for (const item of data.items) {
        const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } })
        if (!menuItem) throw new AppError('MENU_ITEM_NOT_FOUND', `Menu item ${item.menuItemId} not found`)
        if (menuItem.stockCount !== undefined && menuItem.stockCount < item.quantity) {
          throw new AppError('OUT_OF_STOCK', `${menuItem.name} is out of stock`)
        }
      }

      // Create order
      const order = await prisma.order.create({
        data: {
          restaurantId,
          customer: { connectOrCreate: { 
            where: { email: data.customerInfo.email }, 
            create: { ...data.customerInfo, restaurantId } 
          }},
          type: data.type,
          status: 'PENDING',
          items: {
            create: data.items.map(i => ({
              menuItemId: i.menuItemId,
              quantity: i.quantity,
              customizations: i.customizations,
              notes: i.notes
            }))
          },
          deliveryAddress: data.deliveryAddress ? JSON.stringify(data.deliveryAddress) : undefined,
          pickupTime: data.pickupTime,
          notes: data.notes,
          promoCode: data.promoCode ? { connect: { code: data.promoCode } } : undefined,
        },
        include: {
          items: { include: { menuItem: true } },
          customer: true,
          restaurant: true,
          promoCode: true,
        }
      })

      // Decrement stock for ordered items
      for (const item of data.items) {
        await prisma.menuItem.update({
          where: { id: item.menuItemId },
          data: { stockCount: { decrement: item.quantity } }
        })
      }

      await AuditService.log('ORDER_CREATED', 'Order', order.id, {
        restaurantId, userId, data: { orderNumber: order.orderNumber }
      })

      return order
    })
  }

  /**
   * Update order (status, notes, estimate, etc.)
   */
  static async updateOrder(
    id: string,
    data: UpdateOrderRequest,
    userId?: string
  ): Promise<Order> {
    try {
      const oldOrder = await db.order.findUnique({ where: { id } })
      if (!oldOrder) throw new AppError('ORDER_NOT_FOUND', 'Order not found')
      const updated = await db.order.update({
        where: { id },
        data: { ...data, updatedAt: new Date() },
        include: {
          items: { include: { menuItem: true } },
          customer: true,
          restaurant: true,
          promoCode: true,
        }
      })
      await AuditService.log('ORDER_UPDATED', 'Order', id, {
        restaurantId: oldOrder.restaurantId,
        userId,
        oldValues: oldOrder,
        newValues: data
      })
      return updated
    } catch (error) {
      console.error('[OrderService] Error updating order:', error)
      throw new AppError('ORDER_UPDATE_FAIL', 'Failed to update order')
    }
  }

  /**
   * Change order status (e.g. CONFIRMED → PREPARING → READY → OUT_FOR_DELIVERY)
   */
  static async updateStatus(
    id: string,
    status: OrderStatus,
    userId?: string
  ): Promise<Order> {
    try {
      const order = await db.order.update({
        where: { id },
        data: { status, updatedAt: new Date() },
        include: {
          items: { include: { menuItem: true } },
          customer: true,
          restaurant: true,
          promoCode: true,
        }
      })
      await AuditService.log('ORDER_STATUS_UPDATED', 'Order', id, {
        restaurantId: order.restaurantId,
        userId,
        data: { status }
      })
      // Optionally: send notifications to kitchen, customer, etc.
      return order
    } catch (error) {
      console.error('[OrderService] Error updating order status:', error)
      throw new AppError('ORDER_STATUS_FAIL', 'Failed to update order status')
    }
  }

  /**
   * Refund an order (partial or full)
   */
  static async refundOrder(
    id: string,
    amount: number,
    reason: string,
    userId?: string
  ): Promise<Order> {
    // Implement Stripe or payment provider integration here.
    // This example just sets status to REFUNDED for demo.
    try {
      const order = await db.order.update({
        where: { id },
        data: { status: 'REFUNDED', paymentStatus: 'REFUNDED', refundReason: reason, updatedAt: new Date() },
        include: {
          items: { include: { menuItem: true } },
          customer: true,
          restaurant: true,
          promoCode: true,
        }
      })
      await AuditService.log('ORDER_REFUNDED', 'Order', id, {
        restaurantId: order.restaurantId,
        userId,
        data: { amount, reason }
      })
      // TODO: Optionally restock items, notify finance, etc.
      return order
    } catch (error) {
      console.error('[OrderService] Error refunding order:', error)
      throw new AppError('ORDER_REFUND_FAIL', 'Failed to refund order')
    }
  }

  /**
   * Cancel an order (atomic, with possible stock restoration)
   */
  static async cancelOrder(
    id: string,
    userId?: string
  ): Promise<Order> {
    // Optionally, add logic to restore stock for items.
    try {
      const order = await db.order.update({
        where: { id },
        data: { status: 'CANCELLED', updatedAt: new Date() },
        include: {
          items: { include: { menuItem: true } },
          customer: true,
          restaurant: true,
          promoCode: true,
        }
      })
      await AuditService.log('ORDER_CANCELLED', 'Order', id, {
        restaurantId: order.restaurantId,
        userId,
        data: { orderNumber: order.orderNumber }
      })
      // Optionally: restore stock here if required
      return order
    } catch (error) {
      console.error('[OrderService] Error cancelling order:', error)
      throw new AppError('ORDER_CANCEL_FAIL', 'Failed to cancel order')
    }
  }
}

export { AppError }
