// ============================================================================
// 1. src/lib/auth/config.ts - NextAuth Configuration
// ============================================================================

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { db } from '@/lib/db'
import { compare } from 'bcryptjs'
import { UserRole } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { restaurant: true },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)
        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          restaurantId: user.restaurantId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.restaurantId = user.restaurantId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.restaurantId = token.restaurantId as string
      }
      return session
    },
  },
}

// ============================================================================
// 2. src/lib/auth/middleware.ts - Auth Middleware
// ============================================================================

import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function authMiddleware(request: NextRequest) {
  const token = await getToken({ req: request })
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')
  const isApiAuthRoute = request.nextUrl.pathname.startsWith('/api/auth')

  // Allow auth API routes
  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  // Redirect to signin if not authenticated and trying to access protected routes
  if (!token && (isAdminPage)) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect to admin if authenticated and on auth page
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Check admin role for admin routes
  if (isAdminPage && token?.role !== 'ADMIN' && token?.role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return NextResponse.next()
}

// ============================================================================
// 3. src/lib/payments/stripe.ts - Stripe Payment Integration
// ============================================================================

import Stripe from 'stripe'
import { db } from '@/lib/db'
import { PaymentStatus } from '@prisma/client'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export interface CreatePaymentIntentParams {
  amount: number
  currency?: string
  orderId: string
  customerId?: string
  metadata?: Record<string, string>
}

export interface PaymentResult {
  success: boolean
  paymentIntentId?: string
  clientSecret?: string
  error?: string
}

export class StripeService {
  /**
   * Create payment intent for order
   */
  static async createPaymentIntent({
    amount,
    currency = 'gbp',
    orderId,
    customerId,
    metadata = {},
  }: CreatePaymentIntentParams): Promise<PaymentResult> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to pence
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          orderId,
          customerId: customerId || 'guest',
          ...metadata,
        },
      })

      // Update order with payment intent ID
      await db.order.update({
        where: { id: orderId },
        data: {
          paymentId: paymentIntent.id,
          paymentStatus: 'PROCESSING',
        },
      })

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
      }
    } catch (error) {
      console.error('Error creating payment intent:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed',
      }
    }
  }

  /**
   * Handle successful payment
   */
  static async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      
      if (paymentIntent.status === 'succeeded') {
        await db.order.update({
          where: { paymentId: paymentIntentId },
          data: {
            paymentStatus: 'COMPLETED',
            status: 'CONFIRMED',
          },
        })
      }
    } catch (error) {
      console.error('Error handling payment success:', error)
      throw error
    }
  }

  /**
   * Create refund for order
   */
  static async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<PaymentResult> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: reason || 'requested_by_customer',
      })

      // Update order status
      await db.order.update({
        where: { paymentId: paymentIntentId },
        data: {
          paymentStatus: amount ? 'PARTIAL_REFUND' : 'REFUNDED',
          status: 'REFUNDED',
        },
      })

      return {
        success: true,
        paymentIntentId: refund.payment_intent as string,
      }
    } catch (error) {
      console.error('Error creating refund:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund failed',
      }
    }
  }
}

// ============================================================================
// 4. src/lib/printing/printnode.ts - Kitchen Printer Integration
// ============================================================================

interface PrintNodeConfig {
  apiKey: string
  printerId?: number
}

interface PrintJob {
  orderId: string
  orderNumber: string
  items: Array<{
    name: string
    quantity: number
    price: number
    customizations?: Record<string, any>
    notes?: string
  }>
  customerInfo: {
    name: string
    phone: string
    address?: string
  }
  total: number
  orderType: 'DELIVERY' | 'PICKUP'
  specialInstructions?: string
}

export class PrintNodeService {
  private config: PrintNodeConfig

  constructor(config: PrintNodeConfig) {
    this.config = config
  }

  /**
   * Print order receipt to kitchen printer
   */
  async printOrder(printJob: PrintJob): Promise<{ success: boolean; error?: string }> {
    try {
      const receipt = this.formatReceipt(printJob)
      
      if (!this.config.printerId) {
        // Fallback to email if no printer configured
        await this.sendEmailFallback(printJob, receipt)
        return { success: true }
      }

      const response = await fetch('https://api.printnode.com/printjobs', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.config.apiKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          printerId: this.config.printerId,
          title: `Order ${printJob.orderNumber}`,
          contentType: 'raw_base64',
          content: Buffer.from(receipt).toString('base64'),
          source: 'OrderGenie AI',
        }),
      })

      if (!response.ok) {
        throw new Error(`PrintNode API error: ${response.statusText}`)
      }

      return { success: true }
    } catch (error) {
      console.error('Printing error:', error)
      
      // Fallback to email
      try {
        const receipt = this.formatReceipt(printJob)
        await this.sendEmailFallback(printJob, receipt)
        return { success: true }
      } catch (emailError) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Printing failed' 
        }
      }
    }
  }

  /**
   * Format order for thermal printer
   */
  private formatReceipt(printJob: PrintJob): string {
    const { orderNumber, items, customerInfo, total, orderType, specialInstructions } = printJob
    
    let receipt = ''
    receipt += '================================\n'
    receipt += '       ROYAL SPICE KITCHEN      \n'
    receipt += '================================\n'
    receipt += `Order: ${orderNumber}\n`
    receipt += `Type: ${orderType}\n`
    receipt += `Time: ${new Date().toLocaleString()}\n`
    receipt += '--------------------------------\n'
    receipt += `Customer: ${customerInfo.name}\n`
    receipt += `Phone: ${customerInfo.phone}\n`
    
    if (orderType === 'DELIVERY' && customerInfo.address) {
      receipt += `Address: ${customerInfo.address}\n`
    }
    
    receipt += '--------------------------------\n'
    receipt += 'ITEMS:\n'
    receipt += '--------------------------------\n'
    
    items.forEach(item => {
      receipt += `${item.quantity}x ${item.name}\n`
      if (item.customizations && Object.keys(item.customizations).length > 0) {
        receipt += `   Mods: ${JSON.stringify(item.customizations)}\n`
      }
      if (item.notes) {
        receipt += `   Notes: ${item.notes}\n`
      }
      receipt += `   £${(item.price * item.quantity).toFixed(2)}\n`
      receipt += '\n'
    })
    
    receipt += '--------------------------------\n'
    receipt += `TOTAL: £${total.toFixed(2)}\n`
    receipt += '================================\n'
    
    if (specialInstructions) {
      receipt += 'SPECIAL INSTRUCTIONS:\n'
      receipt += specialInstructions + '\n'
      receipt += '================================\n'
    }
    
    receipt += '\n\n\n' // Feed paper
    
    return receipt
  }

  /**
   * Email fallback when printer fails
   */
  private async sendEmailFallback(printJob: PrintJob, receipt: string): Promise<void> {
    // Import email service
    const { EmailService } = await import('@/lib/email/sender')
    
    await EmailService.sendEmail({
      to: process.env.KITCHEN_EMAIL || 'kitchen@restaurant.com',
      subject: `Kitchen Order ${printJob.orderNumber}`,
      text: receipt,
      html: `<pre style="font-family: monospace; white-space: pre-wrap;">${receipt}</pre>`,
    })
  }

  /**
   * Get available printers
   */
  async getPrinters(): Promise<any[]> {
    try {
      const response = await fetch('https://api.printnode.com/printers', {
        headers: {
          'Authorization': `Basic ${Buffer.from(this.config.apiKey + ':').toString('base64')}`,
        },
      })

      if (!response.ok) {
        throw new Error(`PrintNode API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching printers:', error)
      return []
    }
  }
}

// Singleton instance
export const printNodeService = new PrintNodeService({
  apiKey: process.env.PRINTNODE_API_KEY || '',
  printerId: process.env.PRINTNODE_PRINTER_ID ? parseInt(process.env.PRINTNODE_PRINTER_ID) : undefined,
})

// 