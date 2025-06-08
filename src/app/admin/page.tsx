// 10. src/app/admin/page.tsx - Admin Dashboard Home
// ============================================================================

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminDashboard from '@/components/AdminDashboard'
import { useRestaurant } from '@/contexts/RestaurantContext'

export default function AdminHomePage() {
  const { state } = useRestaurant()
  const router = useRouter()

  useEffect(() => {
    if (!state.isAdmin) {
      router.push('/auth/signin')
    }
  }, [state.isAdmin, router])

  if (!state.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-gold"></div>
      </div>
    )
  }

  return <AdminDashboard />
}

