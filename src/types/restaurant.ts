// OrderGenie AI - Core Type Definitions
// Phase 1: Single Restaurant (extensible to multi-tenant)

import { Prisma } from '@prisma/client'

// ============================================================================
// DATABASE TYPES (Auto-generated from Prisma + Extensions)
// ============================================================================

// Base types from Prisma
export type Restaurant = Prisma.RestaurantGetPayload<{
  include: {
    users: true
    menuItems: true
    orders: true
    customers: true
    reviews: true
    promoCodes: true
  }
}>

export type User = Prisma.UserGetPayload<{
  include: {
    restaurant: true
  }
}>

export type Customer = Prisma.CustomerGetPayload<{
  include: {
    orders: true
    reviews: true
    restaurant: true
  }
}>

export type MenuItem = Prisma.MenuItemGetPayload<{
  include: {
    orderItems: true
    restaurant: true
  }
}>

export type Order = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        menuItem: true
      }
    }
    customer: true
    restaurant: true
    promoCode: true
  }
}>

export type OrderItem = Prisma.OrderItemGetPayload<{
  include: {
    menuItem: true
    order: true
  }
}>

export type PromoCode = Prisma.PromoCodeGetPayload<{
  include: {
    restaurant: true
    orders: true
  }
}>

export type Review = Prisma.ReviewGetPayload<{
  include: {
    customer: true
    restaurant: true
  }
}>

export type Analytics = Prisma.AnalyticsGetPayload<{
  include: {
    restaurant: true
  }
}>

// ============================================================================
// API TYPES (Request/Response)
// ============================================================================

// Authentication
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  restaurantName?: string
}

export interface AuthResponse {
  user: User
  token: string
  restaurant: Restaurant
}

// Restaurant Management
export interface CreateRestaurantRequest {
  name: string
  email: string
  phone: string
  address: string
  description?: string
}

export interface UpdateRestaurantRequest {
  name?: string
  email?: string
  phone?: string
  address?: string
  description?: string
  logo?: string
  settings?: RestaurantSettings
}

export interface RestaurantSettings {
  openingHours: OpeningHours
  delivery: DeliverySettings
  payment: PaymentSettings
  notifications: NotificationSettings
  ordering: OrderingSettings
}

export interface OpeningHours {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
  holidays: HolidaySchedule[]
}

export interface DaySchedule {
  isOpen: boolean
  openTime?: string  // "09:00"
  closeTime?: string // "22:00"
  breaks?: TimeSlot[]
}

export interface TimeSlot {
  start: string
  end: string
}

export interface HolidaySchedule {
  date: string
  isOpen: boolean
  openTime?: string
  closeTime?: string
  name?: string
}

export interface DeliverySettings {
  isEnabled: boolean
  fee: number
  freeDeliveryMinimum?: number
  radius: number // in kilometers
  estimatedTime: number // in minutes
  zones: DeliveryZone[]
}

export interface DeliveryZone {
  name: string
  postcodes: string[]
  fee: number
  estimatedTime: number
}

export interface PaymentSettings {
  acceptsCash: boolean
  acceptsCard: boolean
  stripeEnabled: boolean
  minimumOrderAmount: number
}

export interface NotificationSettings {
  email: EmailNotifications
  sms: SmsNotifications
  push: PushNotifications
}

export interface EmailNotifications {
  newOrders: boolean
  orderUpdates: boolean
  dailyReports: boolean
  weeklyReports: boolean
}

export interface SmsNotifications {
  newOrders: boolean
  urgentAlerts: boolean
}

export interface PushNotifications {
  newOrders: boolean
  orderUpdates: boolean
  systemAlerts: boolean
}

export interface OrderingSettings {
  allowPreOrders: boolean
  preOrderDays: number
  requireCustomerAccount: boolean
  allowGuestOrders: boolean
  orderConfirmationRequired: boolean
  kitchenPrintingEnabled: boolean
}

// Menu Management
export interface CreateMenuItemRequest {
  name: string
  description: string
  price: number
  category: string
  subcategory?: string
  image?: string
  images?: string[]
  isVegan?: boolean
  isVegetarian?: boolean
  isGlutenFree?: boolean
  isSpicy?: boolean
  isPopular?: boolean
  isFeatured?: boolean
  calories?: number
  allergens?: string[]
  ingredients?: string[]
  stockCount?: number
  lowStockAlert?: number
}

export interface UpdateMenuItemRequest extends Partial<CreateMenuItemRequest> {
  isAvailable?: boolean
  sortOrder?: number
}

export interface MenuFilters {
  category?: string
  subcategory?: string
  isAvailable?: boolean
  isVegan?: boolean
  isVegetarian?: boolean
  isGlutenFree?: boolean
  search?: string
  priceMin?: number
  priceMax?: number
}

// Order Management
export interface CreateOrderRequest {
  type: 'DELIVERY' | 'PICKUP'
  items: OrderItemRequest[]
  customerInfo: CustomerInfo
  deliveryAddress?: Address
  pickupTime?: string
  notes?: string
  promoCode?: string
}

export interface OrderItemRequest {
  menuItemId: string
  quantity: number
  customizations?: Record<string, any>
  notes?: string
}

export interface CustomerInfo {
  name: string
  email: string
  phone: string
  customerId?: string // For registered customers
}

export interface Address {
  street: string
  city: string
  postcode: string
  country: string
  latitude?: number
  longitude?: number
  instructions?: string
}

export interface UpdateOrderRequest {
  status?: OrderStatus
  estimatedTime?: string
  kitchenNotes?: string
}

export interface OrderFilters {
  status?: OrderStatus[]
  type?: OrderType[]
  dateFrom?: string
  dateTo?: string
  customerId?: string
  search?: string // Search by order number, customer name, etc.
  limit?: number
  offset?: number
}

// Customer Management
export interface CreateCustomerRequest {
  name: string
  email: string
  phone?: string
  address?: string
  preferences?: CustomerPreferences
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
  loyaltyPoints?: number
}

export interface CustomerPreferences {
  dietaryRestrictions: string[]
  allergies: string[]
  favoriteItems: string[]
  preferredOrderType: 'DELIVERY' | 'PICKUP'
  communicationPreferences: {
    email: boolean
    sms: boolean
    push: boolean
  }
}

// Payment Processing
export interface PaymentRequest {
  orderId: string
  amount: number
  currency: string
  paymentMethodId?: string // Stripe payment method
  savePaymentMethod?: boolean
}

export interface PaymentResult {
  success: boolean
  paymentIntentId?: string
  clientSecret?: string
  error?: string
}

export interface RefundRequest {
  orderId: string
  amount?: number // Partial refund amount
  reason: string
}

// Promo Codes
export interface CreatePromoCodeRequest {
  code: string
  name: string
  description?: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_DELIVERY'
  value: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  maxUses?: number
  maxUsesPerCustomer?: number
  validFrom: string
  validUntil: string
  applicableCategories?: string[]
  applicableItems?: string[]
}

export interface ValidatePromoCodeRequest {
  code: string
  orderAmount: number
  customerId?: string
}

export interface PromoCodeValidation {
  isValid: boolean
  discountAmount: number
  error?: string
}

// Analytics & Reporting
export interface AnalyticsFilters {
  dateFrom: string
  dateTo: string
  groupBy?: 'day' | 'week' | 'month'
  metrics?: string[] // revenue, orders, customers, etc.
}

export interface DashboardMetrics {
  today: DailyMetrics
  thisWeek: WeeklyMetrics
  thisMonth: MonthlyMetrics
  trends: TrendData
}

export interface DailyMetrics {
  revenue: number
  orders: number
  newCustomers: number
  avgOrderValue: number
  popularItems: PopularItem[]
}

export interface WeeklyMetrics extends DailyMetrics {
  dailyBreakdown: DailyMetrics[]
}

export interface MonthlyMetrics extends WeeklyMetrics {
  weeklyBreakdown: WeeklyMetrics[]
}

export interface TrendData {
  revenueGrowth: number // Percentage change
  orderGrowth: number
  customerGrowth: number
  avgOrderValueGrowth: number
}

export interface PopularItem {
  menuItemId: string
  menuItemName: string
  quantity: number
  revenue: number
  category: string
}

// ============================================================================
// UI/UX TYPES
// ============================================================================

// Cart Management
export interface CartItem {
  id: string
  menuItem: MenuItem
  quantity: number
  customizations: Record<string, any>
  notes?: string
  subtotal: number
}

export interface CartState {
  items: CartItem[]
  subtotal: number
  discount: number
  discountCode?: string
  tax: number
  deliveryFee: number
  total: number
  estimatedTime?: number
}

// Form States
export interface FormState<T = any> {
  data: T
  errors: Record<string, string>
  isSubmitting: boolean
  isValid: boolean
}

// UI States
export interface LoadingState {
  isLoading: boolean
  error?: string
  lastUpdated?: Date
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
  hasNext: boolean
  hasPrevious: boolean
}

// Notification Types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: () => void
  style?: 'primary' | 'secondary'
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// API Response Wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    pagination?: PaginationState
    filters?: Record<string, any>
    timestamp: string
  }
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: Record<string, any>
  statusCode?: number
}

// Feature Flags (for gradual rollouts)
export interface FeatureFlags {
  enableLoyaltyProgram: boolean
  enableAdvancedAnalytics: boolean
  enableVoiceOrders: boolean // Phase 3
  enableWhatsAppBot: boolean // Phase 3
  enableMultiTenant: boolean // Phase 2
}

// Theme Configuration (Phase 2)
export interface ThemeConfig {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  fonts: {
    primary: string
    secondary: string
  }
  layout: 'modern' | 'classic' | 'minimal'
  customCss?: string
}

// ============================================================================
// TYPE GUARDS & VALIDATORS
// ============================================================================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

export const isValidPostcode = (postcode: string): boolean => {
  // UK postcode regex
  const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i
  return postcodeRegex.test(postcode)
}

// Type guards for runtime type checking
export const isOrder = (obj: any): obj is Order => {
  return obj && typeof obj.id === 'string' && typeof obj.total === 'number'
}

export const isMenuItem = (obj: any): obj is MenuItem => {
  return obj && typeof obj.id === 'string' && typeof obj.price === 'number'
}

export const isCustomer = (obj: any): obj is Customer => {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string'
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED', 
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED'
] as const

export const ORDER_TYPES = ['DELIVERY', 'PICKUP', 'DINE_IN'] as const

export const PAYMENT_STATUSES = [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
  'PARTIAL_REFUND'
] as const

export const USER_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER', 
  'STAFF',
  'CUSTOMER'
] as const

export const DISCOUNT_TYPES = [
  'PERCENTAGE',
  'FIXED_AMOUNT',
  'FREE_DELIVERY',
  'BUY_X_GET_Y'
] as const



// Export Prisma enums for consistency
export { 
  UserRole,
  RestaurantStatus,
  SubscriptionPlan,
  OrderStatus,
  OrderType,
  OrderPriority,
  PaymentStatus,
  DiscountType,
  ReviewStatus
} from '@prisma/client'