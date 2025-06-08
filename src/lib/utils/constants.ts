// 17. src/lib/utils/constants.ts - Application Constants
// ============================================================================

export const APP_CONFIG = {
  name: 'OrderGenie AI',
  description: 'AI-Powered Restaurant Management System',
  version: '1.0.0',
  author: 'OrderGenie Team',
} as const

export const ROUTES = {
  HOME: '/',
  ADMIN: '/admin',
  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    ERROR: '/auth/error',
  },
  API: {
    AUTH: '/api/auth',
    ORDERS: '/api/orders',
    MENU: '/api/menu',
    PAYMENTS: '/api/payments',
    PRINT: '/api/print',
    WEBHOOKS: {
      STRIPE: '/api/webhooks/stripe',
    },
  },
} as const

export const ORDER_STATUS_COLORS = {
  PENDING: 'orange',
  CONFIRMED: 'blue',
  PREPARING: 'yellow',
  READY: 'green',
  OUT_FOR_DELIVERY: 'purple',
  DELIVERED: 'green',
  COMPLETED: 'gray',
  CANCELLED: 'red',
  REFUNDED: 'red',
} as const

export const PAYMENT_STATUS_COLORS = {
  PENDING: 'orange',
  PROCESSING: 'blue',
  COMPLETED: 'green',
  FAILED: 'red',
  CANCELLED: 'red',
  REFUNDED: 'red',
  PARTIAL_REFUND: 'yellow',
} as const

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    orders: 50,
    features: ['Basic order management', 'Email support'],
  },
  STARTER: {
    name: 'Starter',
    price: 29,
    orders: 500,
    features: ['All Free features', 'Kitchen printing', 'Analytics'],
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: 79,
    orders: 2000,
    features: ['All Starter features', 'WhatsApp bot', 'Custom themes'],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 199,
    orders: 'unlimited',
    features: ['All Professional features', 'Priority support', 'Custom integrations'],
  },
} as const

// 
