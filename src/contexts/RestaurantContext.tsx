// src/contexts/RestaurantContext.tsx
'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { MenuItem, PromoCode, Order, Customer, Restaurant } from '@/types/restaurant'
import { toast } from 'sonner'

// ==============================
// TYPES
// ==============================
interface CartItem {
  id: string
  menuItem: MenuItem
  quantity: number
  customizations: Record<string, any>
  notes?: string
  price: number
}

interface RestaurantState {
  restaurant: Restaurant | null
  isLoading: boolean
  error: string | null
  menuItems: MenuItem[]
  categories: string[]
  cart: CartItem[]
  totalDiscount: number
  currentPromoCode: string | null
  orders: Order[]
  currentOrder: Order | null
  currentCustomer: Customer | null
  isAdmin: boolean
  promoCodes: PromoCode[]
}

type RestaurantAction =
  | { type: 'SET_RESTAURANT'; payload: Restaurant }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MENU_ITEMS'; payload: MenuItem[] }
  | { type: 'SET_CATEGORIES'; payload: string[] }
  | { type: 'ADD_TO_CART'; payload: MenuItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'APPLY_PROMO_CODE'; payload: { code: string; discount: number } }
  | { type: 'REMOVE_PROMO_CODE' }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'SET_CURRENT_ORDER'; payload: Order | null }
  | { type: 'SET_CURRENT_CUSTOMER'; payload: Customer | null }
  | { type: 'SET_IS_ADMIN'; payload: boolean }
  | { type: 'SET_PROMO_CODES'; payload: PromoCode[] }

// ==============================
// INITIAL STATE
// ==============================
const initialState: RestaurantState = {
  restaurant: null,
  isLoading: true,
  error: null,
  menuItems: [],
  categories: [],
  cart: [],
  totalDiscount: 0,
  currentPromoCode: null,
  orders: [],
  currentOrder: null,
  currentCustomer: null,
  isAdmin: false,
  promoCodes: [],
}

// ==============================
// REDUCER
// ==============================
function restaurantReducer(state: RestaurantState, action: RestaurantAction): RestaurantState {
  switch (action.type) {
    case 'SET_RESTAURANT':
      return { ...state, restaurant: action.payload, isLoading: false }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'SET_MENU_ITEMS':
      return {
        ...state,
        menuItems: action.payload,
        categories: [...new Set(action.payload.map(item => item.category))]
      }
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload }
    case 'ADD_TO_CART': {
      const menuItem = action.payload
      const existingItem = state.cart.find(item => item.menuItem.id === menuItem.id)
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        }
      }
      return {
        ...state,
        cart: [...state.cart, {
          id: `${menuItem.id}_${Date.now()}`,
          menuItem,
          quantity: 1,
          customizations: {},
          price: Number(menuItem.price)
        }]
      }
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      }
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      }
    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
        totalDiscount: 0,
        currentPromoCode: null
      }
    case 'APPLY_PROMO_CODE':
      return {
        ...state,
        currentPromoCode: action.payload.code,
        totalDiscount: action.payload.discount
      }
    case 'REMOVE_PROMO_CODE':
      return {
        ...state,
        currentPromoCode: null,
        totalDiscount: 0
      }
    case 'SET_ORDERS':
      return { ...state, orders: action.payload }
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] }
    case 'SET_CURRENT_ORDER':
      return { ...state, currentOrder: action.payload }
    case 'SET_CURRENT_CUSTOMER':
      return { ...state, currentCustomer: action.payload }
    case 'SET_IS_ADMIN':
      return { ...state, isAdmin: action.payload }
    case 'SET_PROMO_CODES':
      return { ...state, promoCodes: action.payload }
    default:
      return state
  }
}

// ==============================
// CONTEXT & PROVIDER
// ==============================
interface RestaurantContextValue {
  state: RestaurantState
  dispatch: React.Dispatch<RestaurantAction>
  addToCart: (menuItem: MenuItem) => void
  removeFromCart: (itemId: string) => void
  updateCartQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartItemCount: () => number
}
const RestaurantContext = createContext<RestaurantContextValue | undefined>(undefined)

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(restaurantReducer, initialState)

  // Load initial data
  useEffect(() => { loadInitialData() }, [])

  async function loadInitialData() {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      // ...mock data logic here (same as your code)
      // Omitted here for brevity, but use exactly as you wrote.
      // Remember: set all prices as numbers, not `as any`.
      // ...load mockRestaurant, mockMenuItems, mockPromoCodes, etc.
      // ...dispatch actions, localStorage, etc.
    } catch (error) {
      console.error('Error loading restaurant data:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load restaurant data' })
      toast.error('Failed to load restaurant data')
    }
  }

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (state.cart.length > 0) {
      const cartData = state.cart.map(item => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        customizations: item.customizations
      }))
      localStorage.setItem('restaurant-cart', JSON.stringify(cartData))
    } else {
      localStorage.removeItem('restaurant-cart')
    }
  }, [state.cart])

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (state.orders.length > 0) {
      localStorage.setItem('restaurant-orders', JSON.stringify(state.orders))
    }
  }, [state.orders])

  // Helper methods
  const addToCart = (menuItem: MenuItem) => {
    dispatch({ type: 'ADD_TO_CART', payload: menuItem })
    toast.success(`${menuItem.name} added to cart`)
  }
  const removeFromCart = (itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId })
    toast.success('Item removed from cart')
  }
  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
    } else {
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id: itemId, quantity } })
    }
  }
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    localStorage.removeItem('restaurant-cart')
  }
  const getCartTotal = () => {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    return subtotal - state.totalDiscount
  }
  const getCartItemCount = () => {
    return state.cart.reduce((sum, item) => sum + item.quantity, 0)
  }

  const value: RestaurantContextValue = {
    state,
    dispatch,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount
  }

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  )
}

// ==============================
// HOOK
// ==============================
export function useRestaurant() {
  const context = useContext(RestaurantContext)
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider')
  }
  return context
}

export { RestaurantContext }
