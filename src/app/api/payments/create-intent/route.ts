import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '@/lib/payments/stripe'
import { createPaymentIntentSchema } from '@/lib/validation/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, currency } = createPaymentIntentSchema.parse(body)

    const result = await StripeService.createPaymentIntent({
      orderId,
      amount,
      currency,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
