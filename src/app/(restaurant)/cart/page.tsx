// 4. src/app/(restaurant)/cart/page.tsx - Royal Cart Page
// ============================================================================

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, Tag, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function RoyalCartPage() {
  const { state, dispatch } = useRestaurant()
  const router = useRouter()
  const [promoCode, setPromoCode] = useState('')

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: id })
      toast.success('Item removed from cart', { duration: 2000 })
    } else {
      dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id, quantity } })
    }
  }

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id })
    toast.success('Item removed from cart', { duration: 2000 })
  }

  const applyPromoCode = () => {
    const validCode = state.promoCodes.find(
      code => code.code === promoCode.toUpperCase() && 
               code.isActive && 
               new Date(code.validUntil) > new Date()
    )

    if (validCode) {
      const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const discount = validCode.type === 'percentage' 
        ? (subtotal * validCode.discount) / 100
        : validCode.discount
      
      dispatch({ 
        type: 'APPLY_PROMO_CODE', 
        payload: { code: validCode.code, discount } 
      })
      toast.success(Royal discount applied! You saved £${discount.toFixed(2)}, { 
        duration: 3000,
        icon: '👑'
      })
      setPromoCode('')
    } else {
      toast.error('Invalid or expired promo code', { duration: 3000 })
    }
  }

  const removePromoCode = () => {
    dispatch({ type: 'REMOVE_PROMO_CODE' })
    toast.success('Promo code removed', { duration: 2000 })
  }

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const total = subtotal - state.totalDiscount

  if (state.cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-royal-cream via-white to-royal-gold/5 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md mx-auto px-6"
        >
          <div className="text-8xl">🛒</div>
          <h2 className="text-3xl font-bold text-royal-burgundy font-serif">Your Royal Cart is Empty</h2>
          <p className="text-gray-600 text-lg">
            Discover our exquisite royal Indian cuisine and add some delicious items to get started!
          </p>
          <Button
            onClick={() => router.push('/menu')}
            className="bg-gradient-to-r from-royal-gold to-royal-copper hover:from-royal-copper hover:to-royal-gold text-white px-8 py-3 text-lg"
          >
            <Crown className="h-5 w-5 mr-2" />
            Explore Menu
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-cream via-white to-royal-gold/5">
      {/* Royal Header */}
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
              <span>Continue Shopping</span>
            </Button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-royal-burgundy font-serif">Royal Cart</h1>
              <Badge variant="secondary" className="mt-1">
                {state.cart.reduce((sum, item) => sum + item.quantity, 0)} items
              </Badge>
            </div>
            
            <div className="w-32" /> {/* Spacer for center alignment */}
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {state.cart.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border border-royal-gold/20 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <motion.img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-royal-gold/20"
                          whileHover={{ scale: 1.1 }}
                        />
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-royal-burgundy font-serif">{item.name}</h3>
                          <p className="text-royal-gold font-semibold">£{item.price.toFixed(2)} each</p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-3 mt-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-royal-gold/10 border border-royal-gold/30 flex items-center justify-center hover:bg-royal-gold hover:text-white transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </motion.button>
                            
                            <span className="text-lg font-semibold w-8 text-center">{item.quantity}</span>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-royal-gold/10 border border-royal-gold/30 flex items-center justify-center hover:bg-royal-gold hover:text-white transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xl font-bold text-royal-burgundy">
                            £{(item.price * item.quantity).toFixed(2)}
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeItem(item.id)}
                            className="mt-2 text-red-500 hover:text-red-700 p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="sticky top-24 bg-gradient-to-br from-royal-burgundy to-royal-burgundy/90 text-white border border-royal-gold/30 shadow-xl">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-xl font-bold font-serif flex items-center">
                  <Crown className="h-5 w-5 mr-2 text-royal-gold" />
                  Order Summary
                </h2>

                {/* Promo Code Section */}
                {!state.currentPromoCode ? (
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      />
                      <Button 
                        onClick={applyPromoCode} 
                        disabled={!promoCode.trim()}
                        className="bg-royal-gold hover:bg-royal-copper shrink-0"
                      >
                        <Tag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-royal-gold/20 border border-royal-gold/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-royal-gold" />
                      <span className="font-medium">{state.currentPromoCode}</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={removePromoCode} className="text-white/80 hover:text-white">
                      Remove
                    </Button>
                  </div>
                )}

                <Separator className="bg-white/20" />

                {/* Pricing */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>£{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {state.totalDiscount > 0 && (
                    <div className="flex justify-between text-royal-gold">
                      <span>Royal Discount</span>
                      <span>-£{state.totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <Separator className="bg-white/20" />
                  
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>£{total.toFixed(2)}</span>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={() => router.push('/checkout')}
                    className="w-full bg-gradient-to-r from-royal-gold to-royal-copper hover:from-royal-copper hover:to-royal-gold text-white py-4 text-lg font-semibold shadow-lg"
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Proceed to Checkout
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}