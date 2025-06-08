// 13. src/app/api/menu/route.ts - Menu Management API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { MenuService } from '@/services/menu/menu.service'
import { createMenuItemSchema } from '@/lib/validation/schemas'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isAvailable = searchParams.get('isAvailable')
    const search = searchParams.get('search')

    const menuItems = await MenuService.getMenuItems(session.user.restaurantId, {
      category: category || undefined,
      isAvailable: isAvailable ? isAvailable === 'true' : undefined,
      search: search || undefined,
    })

    return NextResponse.json({ success: true, data: menuItems })
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
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
    const validatedData = createMenuItemSchema.parse(body)

    const menuItem = await MenuService.createMenuItem(
      session.user.restaurantId,
      validatedData,
      session.user.id
    )

    return NextResponse.json({ success: true, data: menuItem }, { status: 201 })
  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    )
  }
}

// ============================================================================
