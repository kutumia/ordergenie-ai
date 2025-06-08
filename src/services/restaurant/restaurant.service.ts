// OrderGenie AI - Restaurant Service
// Phase 1: Single Restaurant Management
// Phase 2: Multi-tenant ready architecture
import { validateEmail, validatePhone } from '@/lib/validation/validators'
import { slugify } from '@/lib/utils/slug'
import { db, restaurantRepo, withTransaction } from '@/lib/db'
import { 
  Restaurant, 
  CreateRestaurantRequest, 
  UpdateRestaurantRequest,
  RestaurantSettings,
  ApiResponse,
  AppError 
} from '@/types'
import { slugify } from '@/lib/utils/slug'
import { validateEmail, validatePhone } from '@/lib/validation'
import { AuditService } from '../audit/audit.service'

// ============================================================================
// RESTAURANT SERVICE
// ============================================================================

export class RestaurantService {
  
  /**
   * Get restaurant by ID with full details
   */
  static async getRestaurant(id: string): Promise<Restaurant | null> {
    try {
      const restaurant = await restaurantRepo.findById(id, {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            lastLoginAt: true
          }
        },
        menuItems: {
          where: { isAvailable: true },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            orders: true,
            customers: true,
            reviews: true
          }
        }
      })
      
      return restaurant
    } catch (error) {
      console.error('Error fetching restaurant:', error)
      throw new AppError('RESTAURANT_FETCH_ERROR', 'Failed to fetch restaurant')
    }
  }
  
  /**
   * Get restaurant by slug (for Phase 2 multi-tenant)
   */
  static async getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    try {
      return await restaurantRepo.findBySlug(slug)
    } catch (error) {
      console.error('Error fetching restaurant by slug:', error)
      throw new AppError('RESTAURANT_FETCH_ERROR', 'Failed to fetch restaurant')
    }
  }
  
  /**
   * Create new restaurant (Phase 2 onboarding)
   */
  static async createRestaurant(
    data: CreateRestaurantRequest,
    userId?: string
  ): Promise<Restaurant> {
    try {
      // Validate input
      this.validateRestaurantData(data)
      
      // Check if email already exists
      const existingRestaurant = await restaurantRepo.findByEmail(data.email)
      if (existingRestaurant) {
        throw new AppError('RESTAURANT_EXISTS', 'Restaurant with this email already exists')
      }
      
      // Generate unique slug
      const baseSlug = slugify(data.name)
      const slug = await this.generateUniqueSlug(baseSlug)
      
      // Create restaurant with transaction
      const restaurant = await withTransaction(async (tx) => {
        const newRestaurant = await tx.restaurant.create({
          data: {
            ...data,
            slug,
            settings: this.getDefaultSettings(),
            theme: this.getDefaultTheme()
          },
          include: {
            users: true,
            _count: {
              select: {
                orders: true,
                customers: true,
                reviews: true
              }
            }
          }
        })
        
        // Create default admin user if provided
        if (userId) {
          await tx.user.update({
            where: { id: userId },
            data: { restaurantId: newRestaurant.id }
          })
        }
        
        return newRestaurant
      })
      
      // Log audit
      await AuditService.log('RESTAURANT_CREATED', 'Restaurant', restaurant.id, {
        restaurantId: restaurant.id,
        userId,
        data: { name: data.name, email: data.email }
      })
      
      return restaurant
      
    } catch (error) {
      if (error instanceof AppError) throw error
      console.error('Error creating restaurant:', error)
      throw new AppError('RESTAURANT_CREATE_ERROR', 'Failed to create restaurant')
    }
  }
  
  /**
   * Update restaurant details
   */
  static async updateRestaurant(
    id: string,
    data: UpdateRestaurantRequest,
    userId?: string
  ): Promise<Restaurant> {
    try {
      // Get current restaurant
      const currentRestaurant = await this.getRestaurant(id)
      if (!currentRestaurant) {
        throw new AppError('RESTAURANT_NOT_FOUND', 'Restaurant not found')
      }
      
      // Validate update data
      if (data.email) {
        if (!validateEmail(data.email)) {
          throw new AppError('INVALID_EMAIL', 'Invalid email format')
        }
        
        // Check if email is already taken by another restaurant
        const existingRestaurant = await restaurantRepo.findByEmail(data.email)
        if (existingRestaurant && existingRestaurant.id !== id) {
          throw new AppError('EMAIL_EXISTS', 'Email already taken by another restaurant')
        }
      }
      
      if (data.phone && !validatePhone(data.phone)) {
        throw new AppError('INVALID_PHONE', 'Invalid phone number format')
      }
      
      // Update restaurant
      const updatedRestaurant = await restaurantRepo.update(id, {
        ...data,
        updatedAt: new Date()
      }, {
        users: true,
        _count: {
          select: {
            orders: true,
            customers: true,
            reviews: true
          }
        }
      })
      
      // Log audit
      await AuditService.log('RESTAURANT_UPDATED', 'Restaurant', id, {
        restaurantId: id,
        userId,
        oldValues: currentRestaurant,
        newValues: data
      })
      
      return updatedRestaurant
      
    } catch (error) {
      if (error instanceof AppError) throw error
      console.error('Error updating restaurant:', error)
      throw new AppError('RESTAURANT_UPDATE_ERROR', 'Failed to update restaurant')
    }
  }
  
  /**
   * Update restaurant settings
   */
  static async updateSettings(
    restaurantId: string,
    settings: Partial<RestaurantSettings>,
    userId?: string
  ): Promise<RestaurantSettings> {
    try {
      const restaurant = await this.getRestaurant(restaurantId)
      if (!restaurant) {
        throw new AppError('RESTAURANT_NOT_FOUND', 'Restaurant not found')
      }
      
      // Merge with existing settings
      const currentSettings = restaurant.settings as RestaurantSettings
      const updatedSettings = {
        ...currentSettings,
        ...settings,
        // Ensure nested objects are properly merged
        openingHours: {
          ...currentSettings.openingHours,
          ...settings.openingHours
        },
        delivery: {
          ...currentSettings.delivery,
          ...settings.delivery
        },
        payment: {
          ...currentSettings.payment,
          ...settings.payment
        },
        notifications: {
          ...currentSettings.notifications,
          ...settings.notifications
        },
        ordering: {
          ...currentSettings.ordering,
          ...settings.ordering
        }
      }
      
      // Validate settings
      this.validateSettings(updatedSettings)
      
      // Update restaurant
      await restaurantRepo.update(restaurantId, {
        settings: updatedSettings,
        updatedAt: new Date()
      })
      
      // Log audit
      await AuditService.log('RESTAURANT_SETTINGS_UPDATED', 'Restaurant', restaurantId, {
        restaurantId,
        userId,
        oldValues: currentSettings,
        newValues: updatedSettings
      })
      
      return updatedSettings
      
    } catch (error) {
      if (error instanceof AppError) throw error
      console.error('Error updating restaurant settings:', error)
      throw new AppError('SETTINGS_UPDATE_ERROR', 'Failed to update restaurant settings')
    }
  }
  
  /**
   * Get restaurant operating status
   */
  static async getOperatingStatus(restaurantId: string): Promise<{
    isOpen: boolean
    opensAt?: string
    closesAt?: string
    nextOpenTime?: Date
    message?: string
  }> {
    try {
      const restaurant = await this.getRestaurant(restaurantId)
      if (!restaurant) {
        throw new AppError('RESTAURANT_NOT_FOUND', 'Restaurant not found')
      }
      
      const settings = restaurant.settings as RestaurantSettings
      const now = new Date()
      const currentDay = now.toLocaleLowerCase() as keyof typeof settings.openingHours
      const daySchedule = settings.openingHours[currentDay]
      
      if (!daySchedule.isOpen) {
        return {
          isOpen: false,
          message: 'Closed today',
          nextOpenTime: this.getNextOpenTime(settings.openingHours, now)
        }
      }
      
      const currentTime = now.toTimeString().slice(0, 5) // "HH:MM" format
      const isCurrentlyOpen = currentTime >= daySchedule.openTime! && 
                             currentTime <= daySchedule.closeTime!
      
      return {
        isOpen: isCurrentlyOpen,
        opensAt: daySchedule.openTime,
        closesAt: daySchedule.closeTime,
        nextOpenTime: isCurrentlyOpen ? undefined : this.getNextOpenTime(settings.openingHours, now),
        message: isCurrentlyOpen ? 'Open now' : 'Currently closed'
      }
      
    } catch (error) {
      if (error instanceof AppError) throw error
      console.error('Error getting operating status:', error)
      throw new AppError('STATUS_ERROR', 'Failed to get operating status')
    }
  }
  
  /**
   * Get restaurant analytics summary
   */
  static async getAnalyticsSummary(restaurantId: string, days: number = 30) {
    try {
      const dateFrom = new Date()
      dateFrom.setDate(dateFrom.getDate() - days)
      
      const [orders, customers, revenue] = await Promise.all([
        // Total orders
        db.order.count({
          where: {
            restaurantId,
            createdAt: { gte: dateFrom }
          }
        }),
        
        // New customers
        db.customer.count({
          where: {
            restaurantId,
            createdAt: { gte: dateFrom }
          }
        }),
        
        // Total revenue
        db.order.aggregate({
          where: {
            restaurantId,
            status: { in: ['DELIVERED', 'COMPLETED'] },
            createdAt: { gte: dateFrom }
          },
          _sum: { total: true }
        })
      ])
      
      const avgOrderValue = orders > 0 ? (revenue._sum.total || 0) / orders : 0
      
      return {
        period: ${days} days,
        orders,
        customers,
        revenue: revenue._sum.total || 0,
        avgOrderValue
      }
      
    } catch (error) {
      console.error('Error getting analytics summary:', error)
      throw new AppError('ANALYTICS_ERROR', 'Failed to get analytics summary')
    }
  }
  
  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================
  
  /**
   * Validate restaurant data
   */
  private static validateRestaurantData(data: CreateRestaurantRequest) {
    if (!data.name?.trim()) {
      throw new AppError('INVALID_NAME', 'Restaurant name is required')
    }
    
    if (!validateEmail(data.email)) {
      throw new AppError('INVALID_EMAIL', 'Valid email is required')
    }
    
    if (!validatePhone(data.phone)) {
      throw new AppError('INVALID_PHONE', 'Valid phone number is required')
    }
    
    if (!data.address?.trim()) {
      throw new AppError('INVALID_ADDRESS', 'Restaurant address is required')
    }
  }
  
  /**
   * Generate unique slug for restaurant
   */
  private static async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug
    let counter = 1
    
    while (await restaurantRepo.findBySlug(slug)) {
      slug = ${baseSlug}-${counter}
      counter++
    }
    
    return slug
  }
  
  /**
   * Get default restaurant settings
   */
  private static getDefaultSettings(): RestaurantSettings {
    return {
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
        estimatedTime: 35,
        zones: []
      },
      payment: {
        acceptsCash: true,
        acceptsCard: true,
        stripeEnabled: false,
        minimumOrderAmount: 15.00
      },
      notifications: {
        email: {
          newOrders: true,
          orderUpdates: true,
          dailyReports: true,
          weeklyReports: false
        },
        sms: {
          newOrders: true,
          urgentAlerts: true
        },
        push: {
          newOrders: true,
          orderUpdates: true,
          systemAlerts: true
        }
      },
      ordering: {
        allowPreOrders: false,
        preOrderDays: 1,
        requireCustomerAccount: false,
        allowGuestOrders: true,
        orderConfirmationRequired: true,
        kitchenPrintingEnabled: true
      }
    }
  }
  
  /**
   * Get default theme configuration
   */
  private static getDefaultTheme() {
    return {
      id: 'royal-gold',
      name: 'Royal Gold',
      colors: {
        primary: '#D4AF37',
        secondary: '#8B1538',
        accent: '#50C878',
        background: '#FFFFFF',
        text: '#2D2D2D'
      },
      fonts: {
        primary: 'Inter',
        secondary: 'Playfair Display'
      },
      layout: 'modern'
    }
  }
  
  /**
   * Validate restaurant settings
   */
  private static validateSettings(settings: RestaurantSettings) {
    // Validate delivery settings
    if (settings.delivery.isEnabled) {
      if (settings.delivery.fee < 0) {
        throw new AppError('INVALID_DELIVERY_FEE', 'Delivery fee cannot be negative')
      }
      
      if (settings.delivery.radius <= 0) {
        throw new AppError('INVALID_DELIVERY_RADIUS', 'Delivery radius must be positive')
      }
      
      if (settings.delivery.estimatedTime <= 0) {
        throw new AppError('INVALID_DELIVERY_TIME', 'Delivery time must be positive')
      }
    }
    
    // Validate payment settings
    if (settings.payment.minimumOrderAmount < 0) {
      throw new AppError('INVALID_MINIMUM_ORDER', 'Minimum order amount cannot be negative')
    }
    
    // Validate opening hours
    Object.entries(settings.openingHours).forEach(([day, schedule]) => {
      if (schedule.isOpen) {
        if (!schedule.openTime || !schedule.closeTime) {
          throw new AppError('INVALID_HOURS', Open and close times required for ${day})
        }
        
        if (schedule.openTime >= schedule.closeTime) {
          throw new AppError('INVALID_HOURS', Close time must be after open time for ${day})
        }
      }
    })
  }
  
  /**
   * Get next opening time for restaurant
   */
  private static getNextOpenTime(openingHours: any, currentDate: Date): Date | undefined {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    let checkDate = new Date(currentDate)
    
    // Check next 7 days
    for (let i = 0; i < 7; i++) {
      checkDate.setDate(checkDate.getDate() + (i === 0 ? 0 : 1))
      const dayName = days[checkDate.getDay()]
      const daySchedule = openingHours[dayName]
      
      if (daySchedule.isOpen) {
        const [openHour, openMinute] = daySchedule.openTime.split(':').map(Number)
        const nextOpenTime = new Date(checkDate)
        nextOpenTime.setHours(openHour, openMinute, 0, 0)
        
        // If it's today and we haven't passed opening time, return it
        // If it's a future day, return the opening time
        if (i > 0 || nextOpenTime > currentDate) {
          return nextOpenTime
        }
      }
    }
    
    return undefined
  }
}

// ============================================================================
// RESTAURANT UTILITIES
// ============================================================================

/**
 * Check if restaurant is currently accepting orders
 */
export async function isAcceptingOrders(restaurantId: string): Promise<boolean> {
  try {
    const status = await RestaurantService.getOperatingStatus(restaurantId)
    return status.isOpen
  } catch (error) {
    console.error('Error checking if accepting orders:', error)
    return false
  }
}

/**
 * Get restaurant's current estimated delivery time
 */
export async function getEstimatedDeliveryTime(restaurantId: string): Promise<number> {
  try {
    const restaurant = await RestaurantService.getRestaurant(restaurantId)
    if (!restaurant) return 45 // Default fallback
    
    const settings = restaurant.settings as RestaurantSettings
    return settings.delivery.estimatedTime || 45
  } catch (error) {
    console.error('Error getting estimated delivery time:', error)
    return 45 // Default fallback
  }
}