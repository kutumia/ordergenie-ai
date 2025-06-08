// 9. src/app/api/orders/[orderId]/route.ts - Individual Order Management
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { OrderService } from '@/services/orders/order.service'
import { EmailService } from '@/lib/email/sender'

interface Params {
  params: { orderId: string }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await OrderService.getOrderById(params.orderId)
    
    if (!order || order.restaurantId !== session.user.restaurantId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, estimatedTime, kitchenNotes } = body

    const updatedOrder = await OrderService.updateOrderStatus(
      params.orderId,
      { status, estimatedTime, kitchenNotes },
      session.user.id
    )

    // Send status update email
    if (status) {
      try {
        await EmailService.sendOrderStatusUpdate(updatedOrder)
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
      }
    }

    return NextResponse.json({ success: true, data: updatedOrder })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

// 
