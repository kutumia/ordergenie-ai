// src/components/MenuSection.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Flame, Leaf, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { useRouter } from 'next/navigation'

export default function MenuSection() {
  const { state, addToCart } = useRestaurant()
  const [activeCategory, setActiveCategory] = useState('All')
  const router = useRouter()

  const categories = ['All', ...state.categories]

  const filteredItems = activeCategory === 'All'
    ? state.menuItems.slice(0, 6) // Show only 6 items on homepage
    : state.menuItems.filter(item => item.category === activeCategory).slice(0, 6)

  return (
    <section id="menu" className="py-20 bg-white">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-royal-burgundy font-serif mb-4">
            Our Royal Menu
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our carefully curated selection of authentic Indian dishes,
            each prepared with the finest ingredients and traditional spices.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full font-medium transition-all duration-300 border ${
                activeCategory === category
                  ? 'bg-royal-gold text-white border-royal-gold shadow'
                  : 'bg-white border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12" role="list">
          <AnimatePresence mode="wait">
            {filteredItems.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full text-center text-gray-400 py-20"
              >
                No dishes found in this category. Please select another.
              </motion.div>
            ) : (
              filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layoutId={item.id}
                  role="listitem"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
                    <div className="relative h-48 overflow-hidden group">
                      <img
                        src={item.image || 'https://via.placeholder.com/300x200'}
                        alt={item.name + ' - Royal Spice dish'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />

                      {/* Overlay Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {item.isPopular && (
                          <Badge className="bg-royal-gold text-white">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Popular
                          </Badge>
                        )}
                        {item.isVegan && (
                          <Badge className="bg-royal-emerald text-white">
                            <Leaf className="h-3 w-3 mr-1" />
                            Vegan
                          </Badge>
                        )}
                        {item.isSpicy && (
                          <Badge className="bg-red-500 text-white">
                            <Flame className="h-3 w-3 mr-1" />
                            Spicy
                          </Badge>
                        )}
                      </div>

                      {/* Price Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-royal-burgundy text-white text-lg px-3 py-1">
                          £{Number(item.price).toFixed(2)}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-royal-burgundy mb-2">{item.name}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                      <Button
                        onClick={() => addToCart(item)}
                        className="w-full bg-gradient-to-r from-royal-gold to-royal-copper hover:from-royal-copper hover:to-royal-gold text-white group"
                        aria-label={`Add to Cart for ${item.name}`}
                      >
                        <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={() => router.push('/menu')}
            className="bg-royal-burgundy hover:bg-royal-burgundy/90 text-white px-8"
          >
            View Complete Menu
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
