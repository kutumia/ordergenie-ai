// src/components/SpecialOffersSection.tsx
'use client'

import { motion } from 'framer-motion'
import { Tag, Clock, Percent, Crown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRestaurant } from '@/contexts/RestaurantContext'

interface SpecialOffersSectionProps {
  onNavigate: (sectionId: string) => void
}

export default function SpecialOffersSection({ onNavigate }: SpecialOffersSectionProps) {
  const { state } = useRestaurant()

  const offers = [
    {
      id: 1,
      title: "Royal Feast Friday",
      description: "Get 20% off on all main courses every Friday evening",
      discount: "20% OFF",
      icon: <Crown className="h-8 w-8" />,
      color: "from-royal-gold to-royal-copper",
      validUntil: "Every Friday",
      code: "FRIDAY20"
    },
    {
      id: 2,
      title: "Family Bundle",
      description: "Order 4 main courses and get free starters & desserts",
      discount: "FREE EXTRAS",
      icon: <Tag className="h-8 w-8" />,
      color: "from-royal-emerald to-emerald-600",
      validUntil: "Limited Time",
      code: "FAMILY4"
    },
    {
      id: 3,
      title: "Lunch Special",
      description: "Enjoy our express lunch menu at special prices",
      discount: "£9.99",
      icon: <Clock className="h-8 w-8" />,
      color: "from-royal-burgundy to-pink-700",
      validUntil: "Mon-Fri 12-3PM",
      code: null
    }
  ]

  return (
    <section id="specials" className="py-20 bg-gradient-to-b from-royal-cream/20 to-white">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-royal-burgundy font-serif mb-4">
            Special Offers
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Take advantage of our exclusive deals and enjoy royal dining at special prices
          </p>
        </motion.div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              role="listitem"
            >
              <Card className="overflow-hidden h-full hover:shadow-2xl transition-all duration-300">
                <div className={`h-2 bg-gradient-to-r ${offer.color}`} />
                <CardContent className="p-8">
                  <div className={`inline-flex p-4 rounded-full bg-white shadow bg-gradient-to-r ${offer.color} bg-opacity-20 mb-6`}>
                    <div className="text-royal-gold">{offer.icon}</div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-royal-burgundy mb-3">
                    {offer.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6">
                    {offer.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-6">
                    <span className={`text-3xl font-bold bg-gradient-to-r ${offer.color} text-transparent bg-clip-text`}>
                      {offer.discount}
                    </span>
                    <Badge variant="secondary" className="text-sm">
                      {offer.validUntil}
                    </Badge>
                  </div>
                  
                  {offer.code && (
                    <div className="mb-6 p-3 bg-gray-100 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">Promo Code:</p>
                      <p className="text-lg font-mono font-bold text-royal-burgundy tracking-wider">{offer.code}</p>
                    </div>
                  )}
                  
                  <Button
                    aria-label={`Order Now - ${offer.title}`}
                    onClick={() => onNavigate('menu')}
                    className="w-full bg-gradient-to-r from-royal-gold to-royal-copper hover:from-royal-copper hover:to-royal-gold text-white"
                  >
                    Order Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Active Promo Codes from Database */}
        {state.promoCodes && state.promoCodes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <h3 className="text-2xl font-bold text-royal-burgundy mb-6">Active Promo Codes</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {state.promoCodes.map((promo) => (
                <motion.div
                  key={promo.id}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white p-4 rounded-lg shadow-lg border border-royal-gold/20 flex items-center gap-3"
                >
                  <Percent className="h-5 w-5 text-royal-gold" />
                  <div className="text-left">
                    <p className="font-mono font-bold text-royal-burgundy">{promo.code}</p>
                    <p className="text-sm text-gray-600">{promo.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
