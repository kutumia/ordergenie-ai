// OrderGenie AI - Complete Order Service
// Phase 1: Production-ready with placeholder dependencies

import { db, orderRepo, withTransaction } from '@/lib/db'
import { 
  Order, 
  CreateOrderRequest, 
  UpdateOrderRequest,
  OrderFilters,
  OrderStatus,
  PaymentStatus,
  AppError 
} from '@/types'
import { AuditService } from '../audit/audit.service'

// ============================================================================
// PLACEHOLDER SERVICES (Until full implementations provided)
// ============================================================================

class MenuService {
  static async getMenuItem(id: string) {
    return await db.menuItem.findUnique({ where: { id } })
  }
}

class CustomerService {
  static async findOrCreateCustomer(restaurantId: string, data: any, tx: any) {
    return await tx.customer.upsert({
      where: { 
        email_restaurantId: { 
          email: data.email, 
          restaurantId 
        } 
      },
      update: { name: data.name, phone: data.phone },
      create: { 
        email: data.email,
        name: data.name,
        phone: data.phone || '',
        restaurantId 
      }
    })
  }
}

class PaymentService {
  static async processPayment(orderId: string, amount: number) {
    // Placeholder - implement with Stripe later
    return { success: true, paymentId: `payment_${Date.now()}` }
  }
}

class PrintingService {
  static async printKitchenTicket(order: Order) {
    // Placeholder - implement printing later
    console.log('Kitchen ticket printed for order:', order.orderNumber)
  }
}

class EmailService {
  static async sendOrderConfirmation(order: Order) {
    // Placeholder - implement email later
    console.log('Order confirmation sent for:', order.orderNumber)
  }
}

class NotificationService {
  static async notifyRestaurant(order: Order, type: string) {
    // Placeholder - implement notifications later
    console.log(`Restaurant notified: ${type} for order ${order.orderNumber}`)
  }
}

// ============================================================================
// ORDER SERVICE
// ============================================================================

export class OrderService {
  /**
   * Create new order
   */
  static async createOrder(
    restaurantId: string,
    orderData: CreateOrderRequest,
    userId?: string
  ): Promise<Order> {
    try {
      // Validate order data
      await this.validateOrderData(restaurantId, orderData)

      // Calculate pricing
      const pricing = await this.calculateOrderPricing(restaurantId, orderData)

      // Generate unique order number
      const orderNumber = await orderRepo.generateOrderNumber()

      // Calculate estimated time
      const estimatedTime = await this.calculateEstimatedTime(orderData.type, restaurantId)

      // Transaction for order + items
      const order = await withTransaction(async (tx) => {
        // Create or get customer
        let customerId = orderData.customerInfo.customerId
        if (!customerId && orderData.customerInfo.email) {
          const customer = await CustomerService.findOrCreateCustomer(
            restaurantId,
            {
              email: orderData.customerInfo.email,
              name: orderData.customerInfo.name,
              phone: orderData.customerInfo.phone
            },
            tx
          )
          customerId = customer.id
        }

        // Apply promo code if provided
        let promoCodeId: string | undefined
        let discountAmount = 0
        if (orderData.promoCode) {
          const promoValidation = await this.validateAndApplyPromoCode(
            restaurantId,
            orderData.promoCode,
            pricing.subtotal,
            customerId
          )
          promoCodeId = promoValidation.promoCodeId
          discountAmount = promoValidation.discountAmount
        }

        // Create the order
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            restaurantId,
            customerId,
            status: 'PENDING',
            type: orderData.type,
            subtotal: pricing.subtotal,
            taxAmount: pricing.taxAmount,
            deliveryFee: pricing.deliveryFee,
            discountAmount,
            total: pricing.total - discountAmount,
            customerInfo: orderData.customerInfo,
            deliveryAddress: orderData.deliveryAddress,
            pickupTime: orderData.pickupTime ? new Date(orderData.pickupTime) : undefined,
            notes: orderData.notes,
            promoCodeId,
            paymentStatus: 'PENDING',
            estimatedTime,
          }
        })

        // Create order items
        await Promise.all(orderData.items.map(async (itemData) => {
          const menuItem = await tx.menuItem.findUnique({
            where: { id: itemData.menuItemId }
          })
          if (!menuItem) {
            throw new AppError('MENU_ITEM_NOT_FOUND', `Menu item ${itemData.menuItemId} not found`)
          }
          
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              menuItemId: itemData.menuItemId,
              quantity: itemData.quantity,
              unitPrice: menuItem.price,
              totalPrice: Number(menuItem.price) * itemData.quantity,
              customizations: itemData.customizations || {},
              notes: itemData.notes
            }
          })
        }))

        // Update promo code usage
        if (promoCodeId) {
          await tx.promoCode.update({
            where: { id: promoCodeId },
            data: { currentUses: { increment: 1 } }
          })
        }

        // Return complete order
        return await tx.order.findUnique({
          where: { id: newOrder.id },
          include: {
            items: { include: { menuItem: true } },
            customer: true,
            restaurant: true,
            promoCode: true
          }
        }) as Order
      })

      // Send notifications (async)
      this.sendOrderNotifications(order, 'CREATED').catch(console.error)

      // Log audit
      AuditService.log('ORDER_CREATED', 'Order', order.id, {
        restaurantId,
        userId,
        data: { orderNumber: order.orderNumber, total: order.total }
      }).catch(console.error)

      return order

    } catch (error) {
      if (error instanceof AppError) throw error
      console.error('Error creating order:', error)
      throw new AppError('ORDER_CREATE_ERROR', 'Failed to create order')
    }
  }

  /**
   * Get order by ID
   */
  static async getOrder(id: string, restaurantId?: string): Promise<Order | null> {
    try {
      const where: any = { id }
      if (restaurantId) where.restaurantId = restaurantId

      return await db.order.findFirst({
        where,
        include: {
          items: { include: { menuItem: true } },
          customer: true,
          restaurant: true,
          promoCode: true
        }
      })
    } catch (error) {
      console.error('Error fetching order:', error)
      throw new AppError('ORDER_FETCH_ERROR', 'Failed to fetch order')
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    id: string,
    status: OrderStatus,
    restaurantId?: string,
    userId?: string
  ): Promise<Order> {
    try {
      const where: any = { id }
      if (restaurantId) where.restaurantId = restaurantId

      const order = await db.order.update({
        where,
        data: { 
          status,
          updatedAt: new Date(),
          ...(status === 'COMPLETED' && { completedAt: new Date() })
        },
        include: {
          items: { include: { menuItem: true } },
          customer: true,
          restaurant: true
        }
      })

      // Send status update notifications
      this.sendOrderNotifications(order, 'STATUS_UPDATED').catch(console.error)

      // Log audit
      AuditService.log('ORDER_STATUS_UPDATED', 'Order', id, {
        restaurantId,
        userId,
        data: { status, orderNumber: order.orderNumber }
      }).catch(console.error)

      return order
    } catch (error) {
      console.error('Error updating order status:', error)
      throw new AppError('ORDER_UPDATE_ERROR', 'Failed to update order status')
    }
  }

  /**
   * Get orders for restaurant
   */
  static async getOrders(
    restaurantId: string,
    filters: OrderFilters = {},
    pagination = { page: 1, pageSize: 20 }
  ) {
    try {
      const where: any = { restaurantId }

      // Apply filters
      if (filters.status) where.status = { in: filters.status }
      if (filters.type) where.type = { in: filters.type }
      if (filters.customerId) where.customerId = filters.customerId
      
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {}
        if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom)
        if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo)
      }

      // Search by order number or customer name
      if (filters.search) {
        where.OR = [
          { orderNumber: { contains: filters.search, mode: 'insensitive' } },
          { customerInfo: { path: ['name'], string_contains: filters.search } }
        ]
      }

      const skip = (pagination.page - 1) * pagination.pageSize
      const take = pagination.pageSize

      const [orders, total] = await Promise.all([
        db.order.findMany({
          where,
          include: {
            items: { include: { menuItem: true } },
            customer: true
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        db.order.count({ where })
      ])

      return {
        orders,
        pagination: {
          page: pagination.page,
          pageSize: pagination.pageSize,
          total,
          pages: Math.ceil(total / pagination.pageSize)
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw new AppError('ORDERS_FETCH_ERROR', 'Failed to fetch orders')
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private static async validateOrderData(restaurantId: string, orderData: CreateOrderRequest) {
    // Validate restaurant exists
    const restaurant = await db.restaurant.findUnique({ where: { id: restaurantId } })
    if (!restaurant) {
      throw new AppError('RESTAURANT_NOT_FOUND', 'Restaurant not found')
    }

    // Validate order has items
    if (!orderData.items?.length) {
      throw new AppError('NO_ITEMS', 'Order must contain at least one item')
    }

    // Validate customer info
    if (!orderData.customerInfo?.name || !orderData.customerInfo?.email) {
      throw new AppError('INVALID_CUSTOMER', 'Customer name and email required')
    }

    // Validate delivery address for delivery orders
    if (orderData.type === 'DELIVERY' && !orderData.deliveryAddress) {
      throw new AppError('NO_DELIVERY_ADDRESS', 'Delivery address required for delivery orders')
    }

    // Validate menu items exist and are available
    for (const item of orderData.items) {
      const menuItem = await db.menuItem.findUnique({
        where: { id: item.menuItemId }
      })
      
      if (!menuItem || menuItem.restaurantId !== restaurantId) {
        throw new AppError('INVALID_MENU_ITEM', `Invalid menu item: ${item.menuItemId}`)
      }
      
      if (!menuItem.isAvailable) {
        throw new AppError('ITEM_UNAVAILABLE', `Item not available: ${menuItem.name}`)
      }

      if (item.quantity <= 0) {
        throw new AppError('INVALID_QUANTITY', 'Item quantity must be positive')
      }
    }
  }

  private static async calculateOrderPricing(restaurantId: string, orderData: CreateOrderRequest) {
    let subtotal = 0

    // Calculate items subtotal
    for (const item of orderData.items) {
      const menuItem = await db.menuItem.findUnique({
        where: { id: item.menuItemId }
      })
      if (menuItem) {
        subtotal += Number(menuItem.price) * item.quantity
      }
    }

    // Get restaurant settings for delivery fee and tax
    const restaurant = await db.restaurant.findUnique({ where: { id: restaurantId } })
    const settings = restaurant?.settings as any || {}

    // Calculate delivery fee
    let deliveryFee = 0
    if (orderData.type === 'DELIVERY') {
      deliveryFee = settings.delivery?.fee || 0
      const freeDeliveryMinimum = settings.delivery?.freeDeliveryMinimum || 0
      if (subtotal >= freeDeliveryMinimum) {
        deliveryFee = 0
      }
    }

    // Calculate tax (assuming 20% VAT for UK)
    const taxRate = 0.20
    const taxAmount = subtotal * taxRate

    const total = subtotal + deliveryFee + taxAmount

    return {
      subtotal,
      taxAmount,
      deliveryFee,
      total
    }
  }

  private static async calculateEstimatedTime(orderType: string, restaurantId: string): Promise<Date> {
    // Get restaurant delivery settings
    const restaurant = await db.restaurant.findUnique({ where: { id: restaurantId } })
    const settings = restaurant?.settings as any || {}
    
    // Base preparation time (minutes)
    let estimatedMinutes = 30
    
    if (orderType === 'DELIVERY') {
      estimatedMinutes = settings.delivery?.estimatedTime || 45
    } else if (orderType === 'PICKUP') {
      estimatedMinutes = 25
    }

    // Add current time + estimated minutes
    const estimatedTime = new Date()
    estimatedTime.setMinutes(estimatedTime.getMinutes() + estimatedMinutes)
    
    return estimatedTime
  }

  private static async validateAndApplyPromoCode(
    restaurantId: string,
    promoCode: string,
    orderAmount: number,
    customerId?: string
  ) {
    const promo = await db.promoCode.findFirst({
      where: {
        code: promoCode,
        restaurantId,
        isActive: true,
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() }
      }
    })

    if (!promo) {
      throw new AppError('INVALID_PROMO_CODE', 'Invalid or expired promo code')
    }

    // Check usage limits
    if (promo.maxUses && promo.currentUses >= promo.maxUses) {
      throw new AppError('PROMO_CODE_EXHAUSTED', 'Promo code usage limit reached')
    }

    // Check minimum order amount
    if (promo.minOrderAmount && orderAmount < Number(promo.minOrderAmount)) {
      throw new AppError('MINIMUM_ORDER_NOT_MET', 
        `Minimum order amount of £${promo.minOrderAmount} required`)
    }

    // Calculate discount
    let discountAmount = 0
    if (promo.type === 'PERCENTAGE') {
      discountAmount = (orderAmount * Number(promo.value)) / 100
    } else if (promo.type === 'FIXED_AMOUNT') {
      discountAmount = Number(promo.value)
    }

    // Apply maximum discount limit
    if (promo.maxDiscountAmount && discountAmount > Number(promo.maxDiscountAmount)) {
      discountAmount = Number(promo.maxDiscountAmount)
    }

    return {
      promoCodeId: promo.id,
      discountAmount
    }
  }

  private static async sendOrderNotifications(order: Order, type: string) {
    try {
      // Send to restaurant
      await NotificationService.notifyRestaurant(order, type)
      
      // Send customer confirmation
      if (type === 'CREATED') {
        await EmailService.sendOrderConfirmation(order)
      }
      
      // Print kitchen ticket
      if (type === 'CREATED' || type === 'CONFIRMED') {
        await PrintingService.printKitchenTicket(order)
      }
    } catch (error) {
      console.error('Error sending notifications:', error)
      // Don't throw - notifications shouldn't break order flow
    }
  }
}

// ============================================================================
// ORDER UTILITIES
// ============================================================================

export function getOrderStatusInfo(status: OrderStatus) {
  const statusInfo: Record<OrderStatus, { label: string; color: string; description: string }> = {
    'PENDING': {
      label: 'Pending',
      color: 'orange',
      description: 'Order placed, awaiting confirmation'
    },
    'CONFIRMED': {
      label: 'Confirmed',
      color: 'blue',
      description: 'Order confirmed by restaurant'
    },
    'PREPARING': {
      label: 'Preparing',
      color: 'yellow',
      description: 'Kitchen is preparing your order'
    },
    'READY': {
      label: 'Ready',
      color: 'green',
      description: 'Order ready for pickup/delivery'
    },
    'OUT_FOR_DELIVERY': {
      label: 'Out for Delivery',
      color: 'purple',
      description: 'Order is on the way'
    },
    'DELIVERED': {
      label: 'Delivered',
      color: 'green',
      description: 'Order delivered successfully'
    },
    'COMPLETED': {
      label: 'Completed',
      color: 'gray',
      description: 'Order completed'
    },
    'CANCELLED': {
      label: 'Cancelled',
      color: 'red',
      description: 'Order cancelled'
    },
    'REFUNDED': {
      label: 'Refunded',
      color: 'red',
      description: 'Order refunded'
    }
  }
  return statusInfo[status]
}