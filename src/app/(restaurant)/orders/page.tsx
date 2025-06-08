// 6. src/app/(restaurant)/orders/page.tsx - Order History Page
// ============================================================================

'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Crown, Clock, CheckCircle, Package, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { useRouter } from 'next/navigation'

export default function OrderHistoryPage() {
  const { state } = useRestaurant()
  const router = useRouter()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'confirmed': return <CheckCircle className="h-4 w-4" />
      case 'preparing': return <Package className="h-4 w-4" />
      case 'ready': return <CheckCircle className="h-4 w-4" />
      case 'delivered': return <Truck className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-500'
      case 'confirmed': return 'bg-blue-500'
      case 'preparing': return 'bg-yellow-500'
      case 'ready': return 'bg-green-500'
      case 'delivered': return 'bg-emerald-500'
      default: return 'bg-gray-500'
    }
  }

  if (state.orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-royal-cream via-white to-royal-gold/5 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md mx-auto px-6"
        >
          <div className="text-8xl">📋</div>
          <h2 className="text-3xl font-bold text-royal-burgundy font-serif">No Orders Yet</h2>
          <p className="text-gray-600 text-lg">
            Your royal order history will appear here once you place your first order.
          </p>
          <Button
            onClick={() => router.push('/menu')}
            className="bg-gradient-to-r from-royal-gold to-royal-copper hover:from-royal-copper hover:to-royal-gold text-white px-8 py-3 text-lg"
          >
            <Crown className="h-5 w-5 mr-2" />
            Start Ordering
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-cream via-white to-royal-gold/5">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-royal-gold/20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-royal-burgundy hover:text-royal-gold"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </Button>
            
            <h1 className="text-2xl font-bold text-royal-burgundy font-serif flex items-center">
              <Crown className="h-6 w-6 mr-2 text-royal-gold" />
              Your Royal Orders
            </h1>
            
            <div className="w-20" />
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="space-y-6">
          {state.orders
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border border-royal-gold/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-royal-burgundy font-serif mb-1">
                        Order #{order.id}
                      </h3>
                      <p className="text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <Badge className={${getStatusColor(order.status)} text-white capitalize}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status}</span>
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between items-center text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-semibold">£{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-royal-gold/20">
                    <div className="text-sm text-gray-600">
                      {order.customerInfo.address === 'Collection Order' ? 'Collection' : 'Delivery'}
                      {order.promoCode && (
                        <Badge variant="secondary" className="ml-2">
                          {order.promoCode}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xl font-bold text-royal-gold">
                      £{order.total.toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}