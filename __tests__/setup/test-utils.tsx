// __tests__/setup/test-utils.tsx
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock session for tests
const mockSession = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    restaurantId: '1',
  },
  expires: '2024-12-31',
}

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={mockSession}>
        {children}
      </SessionProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helper functions for tests
export const createMockRestaurant = () => ({
  id: '1',
  name: 'Test Restaurant',
  slug: 'test-restaurant',
  email: 'test@restaurant.com',
  phone: '+1234567890',
  address: '123 Test St',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const createMockMenu = () => ({
  id: '1',
  name: 'Test Menu Item',
  description: 'Test description',
  price: 1299, // $12.99 in cents
  category: 'Main',
  isAvailable: true,
  restaurantId: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const createMockOrder = () => ({
  id: '1',
  customerName: 'Test Customer',
  customerEmail: 'customer@test.com',
  customerPhone: '+1234567890',
  items: [
    {
      menuItemId: '1',
      quantity: 2,
      price: 1299,
    },
  ],
  total: 2598,
  status: 'pending' as const,
  restaurantId: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
})

---