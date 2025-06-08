// OrderGenie AI - Database Configuration
// Phase 1: Single Restaurant Database Client
// Designed for easy scaling to multi-tenant in Phase 2

import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// ============================================================================
// PRISMA CLIENT CONFIGURATION
// ============================================================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Database client with performance optimizations
export const db = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: 'pretty',
  }).$extends(withAccelerate())

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// ============================================================================
// DATABASE UTILITIES
// ============================================================================

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await db.$queryRawSELECT 1
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

/**
 * Get database connection info
 */
export async function getDatabaseInfo() {
  try {
    const result = await db.$queryRaw<Array<{ version: string }>>
      SELECT version() as version
    
    return {
      connected: true,
      version: result[0]?.version || 'Unknown',
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Transaction wrapper with retry logic
 */
export async function withTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await db.$transaction(fn, {
        maxWait: 5000, // 5 seconds
        timeout: 10000, // 10 seconds
        isolationLevel: 'ReadCommitted'
      })
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Transaction failed')
      
      // Don't retry on certain errors
      if (lastError.message.includes('Unique constraint')) {
        throw lastError
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100))
      }
    }
  }
  
  throw lastError!
}

// ============================================================================
// QUERY BUILDERS & HELPERS
// ============================================================================

/**
 * Build restaurant filter for multi-tenant queries (Phase 2 ready)
 */
export function buildRestaurantFilter(restaurantId: string) {
  return {
    restaurantId
  }
}

/**
 * Build pagination parameters
 */
export function buildPagination(page: number = 1, pageSize: number = 20) {
  const skip = (page - 1) * pageSize
  const take = Math.min(pageSize, 100) // Max 100 items per page
  
  return {
    skip,
    take
  }
}

/**
 * Build date range filter
 */
export function buildDateRangeFilter(
  dateFrom?: string | Date,
  dateTo?: string | Date,
  field: string = 'createdAt'
) {
  const filter: Record<string, any> = {}
  
  if (dateFrom || dateTo) {
    filter[field] = {}
    
    if (dateFrom) {
      filter[field].gte = new Date(dateFrom)
    }
    
    if (dateTo) {
      filter[field].lte = new Date(dateTo)
    }
  }
  
  return filter
}

/**
 * Build search filter for text fields
 */
export function buildSearchFilter(
  query: string,
  fields: string[]
): { OR: Array<Record<string, any>> } | {} {
  if (!query?.trim()) return {}
  
  const searchTerm = query.trim()
  
  return {
    OR: fields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive'
      }
    }))
  }
}

// ============================================================================
// REPOSITORY BASE CLASS (For Phase 2 extensibility)
// ============================================================================

export abstract class BaseRepository<T> {
  protected abstract model: any
  
  async findById(id: string, include?: any): Promise<T | null> {
    return await this.model.findUnique({
      where: { id },
      include
    })
  }
  
  async findMany(
    where: any = {},
    orderBy: any = { createdAt: 'desc' },
    include?: any,
    pagination?: { skip?: number; take?: number }
  ): Promise<T[]> {
    return await this.model.findMany({
      where,
      orderBy,
      include,
      ...pagination
    })
  }
  
  async create(data: any, include?: any): Promise<T> {
    return await this.model.create({
      data,
      include
    })
  }
  
  async update(id: string, data: any, include?: any): Promise<T> {
    return await this.model.update({
      where: { id },
      data,
      include
    })
  }
  
  async delete(id: string): Promise<T> {
    return await this.model.delete({
      where: { id }
    })
  }
  
  async count(where: any = {}): Promise<number> {
    return await this.model.count({ where })
  }
  
  async exists(where: any): Promise<boolean> {
    const count = await this.model.count({ where })
    return count > 0
  }
}

// ============================================================================
// SPECIFIC REPOSITORIES
// ============================================================================

class RestaurantRepository extends BaseRepository<any> {
  protected model = db.restaurant
  
  async findBySlug(slug: string) {
    return await this.model.findUnique({
      where: { slug },
      include: {
        users: true,
        menuItems: {
          where: { isAvailable: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    })
  }
  
  async findByEmail(email: string) {
    return await this.model.findUnique({
      where: { email }
    })
  }
}

class MenuRepository extends BaseRepository<any> {
  protected model = db.menuItem
  
  async findByRestaurant(
    restaurantId: string,
    filters: {
      category?: string
      isAvailable?: boolean
      search?: string
    } = {}
  ) {
    const where = {
      restaurantId,
      ...(filters.category && { category: filters.category }),
      ...(filters.isAvailable !== undefined && { isAvailable: filters.isAvailable }),
      ...(filters.search && buildSearchFilter(filters.search, ['name', 'description']))
    }
    
    return await this.findMany(where, { sortOrder: 'asc' })
  }
  
  async findCategories(restaurantId: string): Promise<string[]> {
    const items = await this.model.findMany({
      where: { restaurantId },
      select: { category: true },
      distinct: ['category']
    })
    
    return items.map(item => item.category)
  }
}

class OrderRepository extends BaseRepository<any> {
  protected model = db.order
  
  async findByRestaurant(
    restaurantId: string,
    filters: {
      status?: string[]
      dateFrom?: Date
      dateTo?: Date
      customerId?: string
    } = {},
    pagination?: { skip?: number; take?: number }
  ) {
    const where = {
      restaurantId,
      ...(filters.status && { status: { in: filters.status } }),
      ...(filters.customerId && { customerId: filters.customerId }),
      ...buildDateRangeFilter(filters.dateFrom, filters.dateTo)
    }
    
    return await this.findMany(
      where,
      { createdAt: 'desc' },
      {
        items: {
          include: { menuItem: true }
        },
        customer: true,
        promoCode: true
      },
      pagination
    )
  }
  
  async findRecentOrders(restaurantId: string, limit: number = 10) {
    return await this.model.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        items: {
          include: { menuItem: true }
        },
        customer: true
      }
    })
  }
  
  async generateOrderNumber(): Promise<string> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const count = await this.model.count({
      where: {
        orderNumber: {
          startsWith: today
        }
      }
    })
    
    return ${today}${(count + 1).toString().padStart(3, '0')}
  }
}

class CustomerRepository extends BaseRepository<any> {
  protected model = db.customer
  
  async findByEmail(email: string, restaurantId: string) {
    return await this.model.findFirst({
      where: { email, restaurantId }
    })
  }
  
  async findTopCustomers(restaurantId: string, limit: number = 10) {
    return await this.model.findMany({
      where: { restaurantId },
      include: {
        orders: {
          select: { total: true }
        },
        _count: {
          select: { orders: true }
        }
      },
      orderBy: {
        orders: {
          _count: 'desc'
        }
      },
      take: limit
    })
  }
}

// ============================================================================
// REPOSITORY INSTANCES
// ============================================================================

export const restaurantRepo = new RestaurantRepository()
export const menuRepo = new MenuRepository()
export const orderRepo = new OrderRepository()
export const customerRepo = new CustomerRepository()

// ============================================================================
// DATABASE SEED DATA (Development)
// ============================================================================

export async function seedDatabase() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot seed database in production')
  }
  
  console.log('🌱 Seeding database...')
  
  try {
    // Create demo restaurant
    const restaurant = await db.restaurant.upsert({
      where: { slug: 'royal-spice' },
      update: {},
      create: {
        name: 'Royal Spice',
        slug: 'royal-spice',
        email: 'owner@royalspice.co.uk',
        phone: '+44 28 3752 2123',
        address: '15 Russell Street, Armagh BT61 9AA, Northern Ireland',
        description: 'Experience authentic royal Indian cuisine in the heart of Armagh, Northern Ireland',
        logo: '/images/logo.png',
        settings: {
          openingHours: {
            monday: { isOpen: true, openTime: '17:00', closeTime: '22:00' },
            tuesday: { isOpen: true, openTime: '17:00', closeTime: '22:00' },
            wednesday: { isOpen: true, openTime: '17:00', closeTime: '22:00' },
            thursday: { isOpen: true, openTime: '17:00', closeTime: '22:00' },
            friday: { isOpen: true, openTime: '17:00', closeTime: '22:30' },
            saturday: { isOpen: true, openTime: '17:00', closeTime: '22:30' },
            sunday: { isOpen: true, openTime: '16:00', closeTime: '21:30' }
          },
          delivery: {
            isEnabled: true,
            fee: 2.50,
            freeDeliveryMinimum: 25.00,
            radius: 5,
            estimatedTime: 35
          },
          payment: {
            acceptsCash: true,
            acceptsCard: true,
            stripeEnabled: true,
            minimumOrderAmount: 15.00
          }
        }
      }
    })
    
    // Create admin user
    const adminUser = await db.user.upsert({
      where: { email: 'admin@royalspice.co.uk' },
      update: {},
      create: {
        email: 'admin@royalspice.co.uk',
        name: 'Restaurant Admin',
        role: 'ADMIN',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj',
        restaurantId: restaurant.id
      }
    })
    
    // Create sample menu items
    const menuItems = [
      {
        name: 'Chicken Tikka Masala',
        description: 'Tender chicken pieces in a rich, creamy tomato-based sauce with aromatic spices',
        price: 16.95,
        category: 'Main Course',
        image: '/images/menu/chicken-tikka-masala.jpg',
        isPopular: true,
        restaurantId: restaurant.id
      },
      {
        name: 'Lamb Biryani',
        description: 'Fragrant basmati rice layered with succulent lamb and exotic spices',
        price: 19.95,
        category: 'Main Course',
        image: '/images/menu/lamb-biryani.jpg',
        isPopular: true,
        isFeatured: true,
        restaurantId: restaurant.id
      },
      {
        name: 'Vegetable Samosas',
        description: 'Crispy pastries filled with spiced potatoes and peas, served with chutneys',
        price: 8.95,
        category: 'Appetizers',
        image: '/images/menu/vegetable-samosas.jpg',
        isVegan: true,
        isVegetarian: true,
        restaurantId: restaurant.id
      },
      {
        name: 'Paneer Makhani',
        description: 'Cottage cheese cubes in a velvety tomato and butter sauce',
        price: 14.95,
        category: 'Main Course',
        image: '/images/menu/paneer-makhani.jpg',
        isVegetarian: true,
        restaurantId: restaurant.id
      },
      {
        name: 'Garlic Naan',
        description: 'Freshly baked traditional Indian flatbread with garlic and herbs',
        price: 4.95,
        category: 'Sides',
        image: '/images/menu/garlic-naan.jpg',
        isVegetarian: true,
        restaurantId: restaurant.id
      },
      {
        name: 'Gulab Jamun',
        description: 'Sweet milk dumplings in cardamom-flavored syrup',
        price: 6.95,
        category: 'Desserts',
        image: '/images/menu/gulab-jamun.jpg',
        isVegetarian: true,
        restaurantId: restaurant.id
      },
      {
        name: 'Vindaloo',
        description: 'Fiery hot curry with tender meat in a tangy spice blend',
        price: 17.95,
        category: 'Main Course',
        image: '/images/menu/vindaloo.jpg',
        isSpicy: true,
        restaurantId: restaurant.id
      },
      {
        name: 'Dal Makhani',
        description: 'Rich and creamy black lentils slow-cooked with butter and spices',
        price: 12.95,
        category: 'Main Course',
        image: '/images/menu/dal-makhani.jpg',
        isVegan: true,
        isVegetarian: true,
        restaurantId: restaurant.id
      }
    ]
    
    for (const item of menuItems) {
      await db.menuItem.upsert({
        where: { 
          restaurantId_name: { 
            restaurantId: restaurant.id, 
            name: item.name 
          } 
        },
        update: {},
        create: item
      })
    }
    
    // Create sample customers
    const customers = [
      {
        email: 'sarah.johnson@email.com',
        name: 'Sarah Johnson',
        phone: '+44 7700 900123',
        address: '123 Main Street, Armagh BT61 7AA',
        restaurantId: restaurant.id
      },
      {
        email: 'michael.oconnor@email.com',
        name: 'Michael O\'Connor',
        phone: '+44 7700 900124',
        address: '456 High Street, Armagh BT61 8BB',
        restaurantId: restaurant.id
      }
    ]
    
    for (const customer of customers) {
      await db.customer.upsert({
        where: { 
          email_restaurantId: { 
            email: customer.email, 
            restaurantId: restaurant.id 
          } 
        },
        update: {},
        create: customer
      })
    }
    
    // Create sample promo codes
    const promoCodes = [
      {
        code: 'ROYAL20',
        name: '20% Off Everything',
        description: 'Get 20% off your entire order',
        type: 'PERCENTAGE',
        value: 20,
        maxUses: 100,
        currentUses: 45,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        restaurantId: restaurant.id
      },
      {
        code: 'FIRST10',
        name: 'First Order Discount',
        description: 'Get £10 off your first order',
        type: 'FIXED_AMOUNT',
        value: 10,
        minOrderAmount: 30,
        maxUses: 50,
        currentUses: 23,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2024-12-31'),
        restaurantId: restaurant.id
      }
    ]
    
    for (const promoCode of promoCodes) {
      await db.promoCode.upsert({
        where: { code: promoCode.code },
        update: {},
        create: promoCode
      })
    }
    
    console.log('✅ Database seeded successfully!')
    console.log(📍 Restaurant: ${restaurant.name} (${restaurant.slug}))
    console.log(👤 Admin User: ${adminUser.email})
    console.log(🍽️ Menu Items: ${menuItems.length})
    console.log(👥 Customers: ${customers.length})
    console.log(🎫 Promo Codes: ${promoCodes.length})
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    throw error
  }
}

// ============================================================================
// CLEANUP UTILITIES
// ============================================================================

/**
 * Clean up test data (useful for testing)
 */
export async function cleanupTestData() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot cleanup data in production')
  }
  
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.review.deleteMany()
  await db.customer.deleteMany()
  await db.promoCode.deleteMany()
  await db.menuItem.deleteMany()
  await db.user.deleteMany()
  await db.restaurant.deleteMany()
  
  console.log('🧹 Test data cleaned up')
}

/**
 * Reset database to initial state
 */
export async function resetDatabase() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot reset database in production')
  }
  
  await cleanupTestData()
  await seedDatabase()
  
  console.log('🔄 Database reset complete')
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Log slow queries for performance monitoring
 */
export function enableQueryLogging() {
  if (process.env.NODE_ENV === 'development') {
    const originalQuery = db.$queryRaw
    
    db.$queryRaw = async function(query: any, ...args: any[]) {
      const start = Date.now()
      const result = await originalQuery.call(this, query, ...args)
      const duration = Date.now() - start
      
      if (duration > 1000) { // Log queries taking more than 1 second
        console.warn(🐌 Slow query detected (${duration}ms):, query)
      }
      
      return result
    } as any
  }
}

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

/**
 * Gracefully disconnect from database
 */
export async function disconnectDatabase() {
  try {
    await db.$disconnect()
    console.log('📤 Database disconnected gracefully')
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error)
    process.exit(1)
  }
}

// Handle process termination
process.on('SIGINT', disconnectDatabase)
process.on('SIGTERM', disconnectDatabase)
process.on('beforeExit', disconnectDatabase)