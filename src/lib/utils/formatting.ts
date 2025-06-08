// 18. src/lib/utils/formatting.ts - Utility Functions
// ============================================================================

export function formatCurrency(
  amount: number,
  currency: string = 'GBP',
  locale: string = 'en-GB'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  return new Intl.DateTimeFormat('en-GB', options).format(new Date(date))
}

export function formatTime(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  return new Intl.DateTimeFormat('en-GB', options).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function generateOrderNumber(): string {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${dateStr}-${randomStr}`
}Response.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Send to kitchen printer
    try {
      await printNodeService.printOrder({
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
    } catch (printError) {
      console.error('Printing failed:', printError)
      // Continue - don't fail order creation due to printing issues
    }

    // Send confirmation email
    try {
      await EmailService.sendOrderConfirmation(order)
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Continue - don't fail order creation due to email issues
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

// 
