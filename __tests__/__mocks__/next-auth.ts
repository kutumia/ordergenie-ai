// __tests__/__mocks__/next-auth.ts
export const getServerSessionMock = jest.fn()

export const mockSession = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    restaurantId: '1',
  },
  expires: '2024-12-31',
}

// Mock NextAuth.js
jest.mock('next-auth/next', () => ({
  getServerSession: getServerSessionMock,
}))

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: mockSession,
    status: 'authenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

---