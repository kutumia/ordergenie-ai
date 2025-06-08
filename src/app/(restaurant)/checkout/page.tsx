'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CreditCard, Truck, Store, Lock, Crown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function RoyalCheckoutPage() {
  const { state, dispatch } = useRestaurant()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [orderType, setOrderType] = useState<'delivery' | 'collection'>('delivery')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card')
  const [isProcessing, setIsProcessing] = useState(false)

  const [customerInfo, setCustomerInfo] = useState({
    name: state.currentCustomer?.name || '',
    email: state.currentCustomer?.email || '',
    phone: state.currentCustomer?.phone || '',
    address: state.currentCustomer?.address || '',
    notes: '',
  })

  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  })

  useEffect(() => {
    if (state.cart.length === 0) {
      router.push('/menu')
    }
  }, [state.cart.length, router])

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = orderType === 'delivery' ? 2.50 : 0
  const total = subtotal - state.totalDiscount + deliveryFee

  const processOrder = async () => {
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const orderId = `ORD-${Date.now()}`
      const newOrder = {
        id: orderId,
        items: state.cart,
        total,
        customerInfo: {
          ...customerInfo,
          address: orderType === 'delivery' ? customerInfo.address : 'Collection Order',
        },
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        promoCode: state.currentPromoCode,
        discount: state.totalDiscount,
        customerId: state.currentCustomer?.id,
      }
      dispatch({ type: 'ADD_ORDER', payload: newOrder })
      dispatch({ type: 'CLEAR_CART' })
      toast.success('Your royal order has been placed successfully! 👑', {
        duration: 4000,
        icon: <Crown className="h-4 w-4" />,
      })
      router.push(`/orders/${orderId}`)
    } catch (error) {
      toast.error('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (state.cart.length === 0) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-cream via-white to-royal-gold/5">
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
              <span>Back to Cart</span>
            </Button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-royal-burgundy font-serif flex items-center">
                <Crown className="h-6 w-6 mr-2 text-royal-gold" />
                Royal Checkout
              </h1>
              <div className="flex items-center justify-center space-x-2 mt-1">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      step <= currentStep ? 'bg-royal-gold' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="w-32" />
          </div>
        </div>
      </motion.header>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            {/* Step 1: Order Type */}
            <Card className="bg-white/80 backdrop-blur-sm border border-royal-gold/20 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-royal-burgundy font-serif mb-6 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-royal-gold" />
                  Step 1: Order Type
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card
                      className={`cursor-pointer border-2 transition-all ${
                        orderType === 'delivery'
                          ? 'border-royal-gold bg-royal-gold/5'
                          : 'border-gray-200 hover:border-royal-gold/50'
                      }`}
                      onClick={() => setOrderType('delivery')}
                    >
                      <CardContent className="p-6 text-center">
                        <Truck className="h-8 w-8 mx-auto mb-3 text-royal-gold" />
                        <h3 className="font-bold text-royal-burgundy">Delivery</h3>
                        <p className="text-sm text-gray-600 mt-1">35-45 minutes</p>
                        <Badge className="mt-2 bg-royal-gold/10 text-royal-gold">£2.50</Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card
                      className={`cursor-pointer border-2 transition-all ${
                        orderType === 'collection'
                          ? 'border-royal-gold bg-royal-gold/5'
                          : 'border-gray-200 hover:border-royal-gold/50'
                      }`}
                      onClick={() => setOrderType('collection')}
                    >
                      <CardContent className="p-6 text-center">
                        <Store className="h-8 w-8 mx-auto mb-3 text-royal-gold" />
                        <h3 className="font-bold text-royal-burgundy">Collection</h3>
                        <p className="text-sm text-gray-600 mt-1">20-30 minutes</p>
                        <Badge className="mt-2 bg-royal-emerald/10 text-royal-emerald">Free</Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
            {/* Step 2: Customer Details */}
            <Card className="bg-white/80 backdrop-blur-sm border border-royal-gold/20 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-royal-burgundy font-serif mb-6 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-royal-gold" />
                  Step 2: Your Details
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="name" className="text-royal-burgundy font-medium">Full Name *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="mt-1 border-royal-gold/30 focus:border-royal-gold"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-royal-burgundy font-medium">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="mt-1 border-royal-gold/30 focus:border-royal-gold"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <Label htmlFor="email" className="text-royal-burgundy font-medium">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="mt-1 border-royal-gold/30 focus:border-royal-gold"
                    required
                  />
                </div>
                {orderType === 'delivery' && (
                  <div className="mb-4">
                    <Label htmlFor="address" className="text-royal-burgundy font-medium">Delivery Address *</Label>
                    <Textarea
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      placeholder="Please include your full address with postcode"
                      className="mt-1 border-royal-gold/30 focus:border-royal-gold"
                      required
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="notes" className="text-royal-burgundy font-medium">Special Instructions</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    placeholder="Any special requests or dietary requirements?"
                    className="mt-1 border-royal-gold/30 focus:border-royal-gold"
                  />
                </div>
              </CardContent>
            </Card>
            {/* Step 3: Payment */}
            <Card className="bg-white/80 backdrop-blur-sm border border-royal-gold/20 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-royal-burgundy font-serif flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-royal-gold" />
                    Step 3: Payment
                  </h2>
                  <div className="flex items-center text-sm text-gray-600">
                    <Lock className="h-4 w-4 mr-1" />
                    Secure Payment
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card
                      className={`cursor-pointer border-2 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-royal-gold bg-royal-gold/5'
                          : 'border-gray-200 hover:border-royal-gold/50'
                      }`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <CardContent className="p-4 text-center">
                        <CreditCard className="h-6 w-6 mx-auto mb-2 text-royal-gold" />
                        <h3 className="font-semibold text-royal-burgundy">Card</h3>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card
                      className={`cursor-pointer border-2 transition-all ${
                        paymentMethod === 'paypal'
                          ? 'border-royal-gold bg-royal-gold/5'
                          : 'border-gray-200 hover:border-royal-gold/50'
                      }`}
                      onClick={() => setPaymentMethod('paypal')}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="h-6 w-6 mx-auto mb-2 bg-blue-600 text-white rounded flex items-center justify-center text-xs font-bold">
                          PP
                        </div>
                        <h3 className="font-semibold text-royal-burgundy">PayPal</h3>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardName" className="text-royal-burgundy font-medium">Cardholder Name *</Label>
                      <Input
                        id="cardName"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        className="mt-1 border-royal-gold/30 focus:border-royal-gold"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardNumber" className="text-royal-burgundy font-medium">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="mt-1 border-royal-gold/30 focus:border-royal-gold"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry" className="text-royal-burgundy font-medium">Expiry Date *</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          className="mt-1 border-royal-gold/30 focus:border-royal-gold"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv" className="text-royal-burgundy font-medium">CVV *</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          className="mt-1 border-royal-gold/30 focus:border-royal-gold"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={processOrder}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-royal-gold to-royal-copper hover:from-royal-copper hover:to-royal-gold text-white py-4 text-lg font-semibold shadow-lg"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing Royal Order...</span>
                  </div>
                ) : (
                  <>
                    <Crown className="h-5 w-5 mr-2" />
                    Place Royal Order - £{total.toFixed(2)}
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
          {/* Order Summary */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="lg:sticky lg:top-24 lg:h-fit">
            <Card className="bg-gradient-to-br from-royal-burgundy to-royal-burgundy/90 text-white border border-royal-gold/30 shadow-xl">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold font-serif mb-6 flex items-center">
                  <Crown className="h-5 w-5 mr-2 text-royal-gold" />
                  Order Summary
                </h2>
                <div className="space-y-3 mb-6">
                  {state.cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-white/70 ml-2">x{item.quantity}</span>
                      </div>
                      <span>£{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="bg-white/20 mb-6" />
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>£{subtotal.toFixed(2)}</span>
                  </div>
                  {orderType === 'delivery' && (
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>£{deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {state.totalDiscount > 0 && (
                    <div className="flex justify-between text-royal-gold">
                      <span>Discount ({state.currentPromoCode})</span>
                      <span>-£{state.totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="bg-white/20" />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>£{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
