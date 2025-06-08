// ============================================================================
// src/app/(restaurant)/orders/[orderId]/page.tsx - Royal Order Confirmation & Tracking
// ============================================================================

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Crown, Clock, CheckCircle, Package, Truck, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useRestaurant } from '@/contexts/RestaurantContext'

const ORDER_STATUS_STEPS = [
  { key: 'pending', label: 'Pending', icon: <Clock className="h-5 w-5" /> },
  { key: 'confirmed', label: 'Confirmed', icon: <CheckCircle className="h-5 w-5" /> },
  { key: 'preparing', label: 'Preparing', icon: <Package className="h-5 w-5" /> },
  { key: 'ready', label: 'Ready', icon: <CheckCircle className="h-5 w-5" /> },
  { key: 'delivered', label: 'Delivered', icon: <Truck className="h-5 w-5" /> },
]

function getStatusIndex(status: string) {
  return ORDER_STATUS_STEPS.findIndex((step) => step.key === status)
}

export default function OrderConfirmationPage() {
  const { state } = useRestaurant()
  const router = useRouter()
  const params = useParams()
  const orderId = params?.orderId as string

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Simulate fetch from API/context — replace with real API as needed
  useEffect(() => {
    if (!orderId) return
    setLoading(true)
    // Try to find in context first for demo
    const found = state.orders.find((o) => o.id === orderId)
    if (found) {
      setOrder(found)
      setLoading(false)
    } else {
      // Fallback: fetch from server (pseudo-code, replace as needed)
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          setOrder(data.data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
    // Optionally: setInterval to poll status every X seconds
  }, [orderId, state.orders])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-royal-gold"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-6">
        <div className="text-6xl">❓</div>
        <h2 className="text-2xl font-bold text-royal-burgundy">Order Not Found</h2>
        <p className="text-gray-500">We couldn't find that royal order.</p>
        <Button onClick={() => router.push('/orders')} className="bg-royal-gold text-white">
          Back to Order History
        </Button>
      </div>
    )
  }

  const statusIndex = getStatusIndex(order.status)
  const placedTime = new Date(order.createdAt).toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-cream via-white to-royal-gold/5 pb-16">
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-royal-gold/20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/orders')}
            className="flex items-center text-royal-burgundy hover:text-royal-gold"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Order History</span>
          </Button>
          <h1 className="text-2xl font-bold text-royal-burgundy font-serif flex items-center">
            <Crown className="h-6 w-6 mr-2 text-royal-gold" />
            Order #{order.id}
          </h1>
          <div className="w-24" /> {/* Spacer */}
        </div>
      </motion.header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white/95 backdrop-blur-md border border-royal-gold/20 shadow-2xl">
            <CardContent className="p-8 text-center space-y-4">
              <Crown className="mx-auto h-12 w-12 text-royal-gold animate-pulse" />
              <h2 className="text-2xl font-bold text-royal-burgundy font-serif">
                Thank you for your Royal Order!
              </h2>
              <p className="text-gray-600">
                Your order <span className="font-semibold">#{order.id}</span> has been received and is being processed.
              </p>
              <div className="flex justify-center gap-3 items-center">
                <Badge className="bg-royal-gold text-white capitalize px-4 py-2 text-lg">
                  {order.status}
                </Badge>
                <span className="text-gray-400 text-sm">Placed: {placedTime}</span>
              </div>
              <Separator className="my-4" />
              {/* Status Steps */}
              <div className="flex items-center justify-center gap-2 mt-2">
                {ORDER_STATUS_STEPS.map((step, idx) => (
                  <div key={step.key} className="flex flex-col items-center">
                    <div className={
                      `rounded-full h-10 w-10 flex items-center justify-center
                      ${idx < statusIndex ? 'bg-royal-gold text-white' :
                        idx === statusIndex ? 'bg-royal-burgundy text-white animate-pulse' : 'bg-gray-200 text-gray-400'}`
                    }>
                      {step.icon}
                    </div>
                    <span className="text-xs mt-1 text-gray-600">{step.label}</span>
                    {idx < ORDER_STATUS_STEPS.length - 1 && (
                      <div className={`h-2 w-8 ${idx < statusIndex ? 'bg-royal-gold' : 'bg-gray-200'} rounded`} />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white/80 backdrop-blur border border-royal-gold/10 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-royal-burgundy font-serif mb-4">Order Details</h3>
              <div className="space-y-3">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-gray-800">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-medium">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span className="text-royal-gold">£{order.total.toFixed(2)}</span>
              </div>
              {order.promoCode && (
                <div className="flex justify-between items-center text-base mt-2">
                  <span className="text-royal-burgundy">Promo Code</span>
                  <Badge variant="secondary">{order.promoCode}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Customer Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/80 border border-royal-gold/10 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-royal-burgundy font-serif mb-2">Contact & Delivery</h3>
              <div className="space-y-2 text-gray-700">
                <div><span className="font-medium">Name:</span> {order.customerInfo.name}</div>
                <div><span className="font-medium">Phone:</span> {order.customerInfo.phone}</div>
                <div><span className="font-medium">Email:</span> {order.customerInfo.email}</div>
                <div><span className="font-medium">Address:</span> {order.customerInfo.address}</div>
                {order.customerInfo.notes && (
                  <div><span className="font-medium">Notes:</span> {order.customerInfo.notes}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => router.push('/menu')}
            className="bg-royal-gold hover:bg-royal-copper text-white font-semibold">
            Order More Food
          </Button>
          <Button onClick={() => router.push('/orders')}
            className="bg-royal-burgundy hover:bg-royal-gold text-white font-semibold">
            View All Orders
          </Button>
        </div>
      </div>
    </div>
  )
}
