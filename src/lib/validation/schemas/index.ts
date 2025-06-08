// 6. src/lib/validation/schemas/index.ts - Zod Validation Schemas
// ============================================================================

import { z } from 'zod'

// Restaurant schemas
export const createRestaurantSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  address: z.string().min(1, 'Address is required'),
  description: z.string().optional(),
})

export const updateRestaurantSchema = createRestaurantSchema.partial()

// Menu item schemas
export const createMenuItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  image: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  isVegan: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  isSpicy: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  calories: z.number().optional(),
  allergens: z.array(z.string()).optional(),
  ingredients: z.array(z.string()).optional(),
})

export const updateMenuItemSchema = createMenuItemSchema.partial()

// Order schemas
export const createOrderSchema = z.object({
  type: z.enum(['DELIVERY', 'PICKUP', 'DINE_IN']),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().positive(),
    customizations: z.record(z.any()).optional(),
    notes: z.string().optional(),
  })),
  customerInfo: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Invalid phone number'),
    customerId: z.string().optional(),
  }),
  deliveryAddress: z.object({
    street: z.string(),
    city: z.string(),
    postcode: z.string(),
    country: z.string(),
    instructions: z.string().optional(),
  }).optional(),
  pickupTime: z.string().optional(),
  notes: z.string().optional(),
  promoCode: z.string().optional(),
})

// Customer schemas
export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone number'),
  address: z.string().optional(),
  preferences: z.record(z.any()).optional(),
})

export const updateCustomerSchema = createCustomerSchema.partial()

// Promo code schemas
export const createPromoCodeSchema = z.object({
  code: z.string().min(1, 'Code is required').toUpperCase(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_DELIVERY', 'BUY_X_GET_Y']),
  value: z.number().positive('Value must be positive'),
  minOrderAmount: z.number().optional(),
  maxDiscountAmount: z.number().optional(),
  maxUses: z.number().optional(),
  maxUsesPerCustomer: z.number().optional(),
  validFrom: z.string().or(z.date()),
  validUntil: z.string().or(z.date()),
  applicableCategories: z.array(z.string()).optional(),
  applicableItems: z.array(z.string()).optional(),
})

// Auth schemas
export const signInSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  restaurantName: z.string().optional(),
})

// Payment schemas
export const createPaymentIntentSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  currency: z.string().optional(),
})

export const refundPaymentSchema = z.object({
  paymentIntentId: z.string(),
  amount: z.number().positive().optional(),
  reason: z.string().optional(),
})

// Export type inference
export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type CreatePromoCodeInput = z.infer<typeof createPromoCodeSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>







