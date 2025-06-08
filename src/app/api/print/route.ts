// 12. src/app/api/print/route.ts - Print Order Endpoint
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { printNodeService } from '@/lib/printing/printnode'
import { OrderService } from '@/services/orders/order.service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await request.json()

    // Get order details
    const order = await OrderService.getOrderById(orderId)
    
    if (!order || order.restaurantId !== session.user.restaurantId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Print order
    const result = await printNodeService.printOrder({
      orderId: order.id,
      orderNumber: order.orderNumber,
      items: order.items.map(item => ({
        name: item.menuItem.name,
        quantity: item.quantity,
        price: Number(item.unitPrice),
        customizations: item.customizations,
        notes: item.notes || undefined,
      })),
      customerInfo: {
        name: order.customerInfo.name,
        phone: order.customerInfo.phone,
        address: order.deliveryAddress?.street,
      },
      total: Number(order.total),
      orderType: order.type,
      specialInstructions: order.notes || undefined,
    })

    return NextResponse.json({ success: result.success, error: result.error })
  } catch (error) {
    console.error('Print API error:', error)
    return NextResponse.json(
      { error: 'Failed to print order' },
      { status: 500 }
    )
  }
}

// 
