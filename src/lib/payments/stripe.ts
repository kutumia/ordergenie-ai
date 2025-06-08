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