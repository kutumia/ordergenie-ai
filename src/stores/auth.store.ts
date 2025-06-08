// OrderGenie AI - Authentication Store (Production Ready)
// Phase 1: User/Customer Auth State, Permissions, Session, Sync

import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { User, Customer, Restaurant, UserRole } from '@/types/restaurant' // ← Fixed import

// ==============================
// AUTH STATE INTERFACE & TYPES
// ==============================

interface AuthState {
  user: User | null
  customer: Customer | null
  restaurant: Restaurant | null

  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  sessionId: string | null
  lastActivity: string | null
  expiresAt: string | null

  role: UserRole | null
  permissions: string[]
  canAccessAdmin: boolean

  // Actions
  login: (credentials: LoginCredentials) => Promise<AuthResult>
  loginAsCustomer: (credentials: CustomerLoginCredentials) => Promise<AuthResult>
  logout: () => Promise<void>
  register: (data: RegisterData) => Promise<AuthResult>
  registerCustomer: (data: CustomerRegisterData) => Promise<AuthResult>
  refreshToken: () => Promise<boolean>
  updateActivity: () => void
  checkSession: () => Promise<boolean>
  updateUser: (updates: Partial<User>) => Promise<void>
  updateCustomer: (updates: Partial<Customer>) => Promise<void>
  hasPermission: (permission: string) => boolean
  canAccess: (resource: string, action: string) => boolean
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

interface LoginCredentials {
  email: string
  password: string
  restaurantId?: string
  rememberMe?: boolean
}

interface CustomerLoginCredentials {
  email: string
  phone?: string
  restaurantId: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  role?: UserRole
  restaurantId?: string
}

interface CustomerRegisterData {
  name: string
  email: string
  phone?: string
  address?: string
  restaurantId: string
}

interface AuthResult {
  success: boolean
  user?: User
  customer?: Customer
  restaurant?: Restaurant
  token?: string
  error?: string
}

// ==============================
// AUTH STORE IMPLEMENTATION
// ==============================

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set, get) => ({
        user: null,
        customer: null,
        restaurant: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        sessionId: null,
        lastActivity: null,
        expiresAt: null,
        role: null,
        permissions: [],
        canAccessAdmin: false,

        // =============================
        // AUTHENTICATION ACTIONS
        // =============================
        login: async (credentials) => {
          set(state => { state.isLoading = true; state.error = null })
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(credentials)
            })
            const result = await response.json()
            if (result.success) {
              const { user, restaurant, token } = result
              set(state => {
                state.user = user
                state.customer = null
                state.restaurant = restaurant
                state.isAuthenticated = true
                state.role = user.role
                state.permissions = user.permissions || []
                state.canAccessAdmin = ['ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(user.role)
                state.sessionId = token
                state.lastActivity = new Date().toISOString()
                state.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                state.error = null
              })
              // Browser storage handled by middleware
              if (typeof window !== 'undefined') {
                localStorage.setItem('auth_token', token)
              }
              return result
            } else {
              set(state => {
                state.error = result.error || 'Login failed'
                state.isAuthenticated = false
              })
              return result
            }
          } catch (error) {
            set(state => {
              state.error = 'Network error. Please try again.'
              state.isAuthenticated = false
            })
            return { success: false, error: 'Network error. Please try again.' }
          } finally {
            set(state => { state.isLoading = false })
          }
        },

        loginAsCustomer: async (credentials) => {
          set(state => { state.isLoading = true; state.error = null })
          try {
            const response = await fetch('/api/auth/customer-login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(credentials)
            })
            const result = await response.json()
            if (result.success) {
              const { customer, restaurant, token } = result
              set(state => {
                state.customer = customer
                state.user = null
                state.restaurant = restaurant
                state.isAuthenticated = true
                state.role = 'CUSTOMER'
                state.permissions = ['view_menu', 'place_order', 'view_orders']
                state.canAccessAdmin = false
                state.sessionId = token || null
                state.lastActivity = new Date().toISOString()
                state.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                state.error = null
              })
              if (token && typeof window !== 'undefined') {
                localStorage.setItem('auth_token', token)
              }
              return result
            } else {
              set(state => {
                state.error = result.error || 'Customer login failed'
                state.isAuthenticated = false
              })
              return result
            }
          } catch (error) {
            set(state => {
              state.error = 'Network error. Please try again.'
              state.isAuthenticated = false
            })
            return { success: false, error: 'Network error. Please try again.' }
          } finally {
            set(state => { state.isLoading = false })
          }
        },

        logout: async () => {
          try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
            if (token) {
              await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
              })
            }
          } catch (error) {
            // Ignore network errors for logout
          } finally {
            set(state => {
              state.user = null
              state.customer = null
              state.restaurant = null
              state.isAuthenticated = false
              state.role = null
              state.permissions = []
              state.canAccessAdmin = false
              state.sessionId = null
              state.lastActivity = null
              state.expiresAt = null
              state.error = null
            })
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token')
            }
          }
        },

        register: async (data) => {
          set(state => { state.isLoading = true; state.error = null })
          try {
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            })
            const result = await response.json()
            if (result.success) {
              // Auto-login after registration
              return await get().login({
                email: data.email,
                password: data.password,
                restaurantId: data.restaurantId
              })
            } else {
              set(state => { state.error = result.error || 'Registration failed' })
              return result
            }
          } catch (error) {
            set(state => { state.error = 'Network error. Please try again.' })
            return { success: false, error: 'Network error. Please try again.' }
          } finally {
            set(state => { state.isLoading = false })
          }
        },

        registerCustomer: async (data) => {
          set(state => { state.isLoading = true; state.error = null })
          try {
            const response = await fetch('/api/auth/customer-register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            })
            const result = await response.json()
            if (result.success) {
              // Auto-login after customer registration
              return await get().loginAsCustomer({
                email: data.email,
                phone: data.phone,
                restaurantId: data.restaurantId
              })
            } else {
              set(state => { state.error = result.error || 'Customer registration failed' })
              return result
            }
          } catch (error) {
            set(state => { state.error = 'Network error. Please try again.' })
            return { success: false, error: 'Network error. Please try again.' }
          } finally {
            set(state => { state.isLoading = false })
          }
        },

        // =============================
        // SESSION MANAGEMENT
        // =============================
        refreshToken: async () => {
          const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
          if (!token) return false
          try {
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` }
            })
            const result = await response.json()
            if (result.success) {
              const { token: newToken, user, customer, restaurant } = result
              set(state => {
                if (user) state.user = user
                if (customer) state.customer = customer
                if (restaurant) state.restaurant = restaurant
                state.sessionId = newToken
                state.lastActivity = new Date().toISOString()
                state.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
              })
              if (typeof window !== 'undefined') {
                localStorage.setItem('auth_token', newToken)
              }
              return true
            } else {
              await get().logout()
              return false
            }
          } catch {
            await get().logout()
            return false
          }
        },

        updateActivity: () => {
          set(state => { state.lastActivity = new Date().toISOString() })
        },

        checkSession: async () => {
          const state = get()
          if (!state.isAuthenticated || !state.expiresAt) return false
          if (new Date() > new Date(state.expiresAt)) {
            return await get().refreshToken()
          }
          // Proactively refresh token if expiring soon (within 1 hour)
          if (new Date(state.expiresAt) < new Date(Date.now() + 60 * 60 * 1000)) {
            await get().refreshToken()
          }
          return true
        },

        // =============================
        // USER / CUSTOMER MANAGEMENT
        // =============================
        updateUser: async (updates) => {
          const state = get()
          if (!state.user) throw new Error('No user to update')
          try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
            const response = await fetch(`/api/users/${state.user.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(updates)
            })
            const result = await response.json()
            if (result.success) {
              set(state => {
                if (state.user) Object.assign(state.user, updates)
              })
            } else {
              throw new Error(result.error || 'Failed to update user')
            }
          } catch (error) {
            set(state => {
              state.error = error instanceof Error ? error.message : 'Failed to update user'
            })
            throw error
          }
        },

        updateCustomer: async (updates) => {
          const state = get()
          if (!state.customer) throw new Error('No customer to update')
          try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
            const response = await fetch(`/api/customers/${state.customer.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(updates)
            })
            const result = await response.json()
            if (result.success) {
              set(state => {
                if (state.customer) Object.assign(state.customer, updates)
              })
            } else {
              throw new Error(result.error || 'Failed to update customer')
            }
          } catch (error) {
            set(state => {
              state.error = error instanceof Error ? error.message : 'Failed to update customer'
            })
            throw error
          }
        },

        // =============================
        // PERMISSIONS & UTILITIES
        // =============================
        hasPermission: (permission: string) => {
          const state = get()
          return state.permissions.includes(permission)
        },
        canAccess: (resource: string, action: string) => {
          // Simple example, extend with RBAC logic as needed
          const state = get()
          if (state.role === 'SUPER_ADMIN') return true
          // e.g. permissions: ["order:read", "menu:write"]
          return state.permissions.includes(`${resource}:${action}`)
        },
        setLoading: (loading: boolean) => set(state => { state.isLoading = loading }),
        setError: (error: string | null) => set(state => { state.error = error }),
        clearError: () => set(state => { state.error = null })
      })),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          customer: state.customer,
          restaurant: state.restaurant,
          isAuthenticated: state.isAuthenticated,
          sessionId: state.sessionId,
          lastActivity: state.lastActivity,
          expiresAt: state.expiresAt,
          role: state.role,
          permissions: state.permissions,
          canAccessAdmin: state.canAccessAdmin
        })
      }
    ),
    { name: 'AuthStore' }
  )
)

// ==============================
// UTILITY HOOKS & EXPORTS
// ==============================

export const useAuth = () => useAuthStore()
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated)
export const useUser = () => useAuthStore(state => state.user)
export const useCustomer = () => useAuthStore(state => state.customer)
export const useRestaurant = () => useAuthStore(state => state.restaurant)
export const useAuthLoading = () => useAuthStore(state => state.isLoading)
export const useAuthError = () => useAuthStore(state => state.error)
export const useCanAccessAdmin = () => useAuthStore(state => state.canAccessAdmin)

// Session management hooks
export const useSessionCheck = () => {
  const checkSession = useAuthStore(state => state.checkSession)
  return checkSession
}

export const usePermissions = () => {
  const hasPermission = useAuthStore(state => state.hasPermission)
  const canAccess = useAuthStore(state => state.canAccess)
  return { hasPermission, canAccess }
}