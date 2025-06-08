import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { OrderService } from '@/services/orders/order.service'
import { createOrderSchema } from '@/lib/validation/schemas'
import { printNodeService } from '@/lib/printing/printnode'
import { EmailService } from '@/lib/email/sender'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const orders = await OrderService.getOrdersByRestaurant(
      session.user.restaurantId,
      {
        status: status ? [status as any] : undefined,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      },
      { skip: (page - 1) * limit, take: limit }
    )

    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createOrderSchema.parse(body)

    // Create order
    const order = await OrderService.createOrder(
      session.user.restaurantId,
      validatedData,
      session.user.id
    )

    // Send to kitchen printer (non-blocking)
    printNodeService.printOrder({
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
    }).catch(printError => console.error('Printing failed:', printError))

    // Send confirmation email (non-blocking)
    EmailService.sendOrderConfirmation(order)
      .catch(emailError => console.error('Email sending failed:', emailError))

    return NextResponse.json({ success: true, data: order }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
