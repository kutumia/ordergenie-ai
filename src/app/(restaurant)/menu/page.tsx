// 3. src/app/(restaurant)/menu/page.tsx - Dedicated Menu Page
// ============================================================================

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Filter, Search, Star, Leaf, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function RoyalMenuPage() {
  const { state, dispatch } = useRestaurant()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  const categories = ['All', 'Appetizers', 'Main Course', 'Sides', 'Desserts']

  const filteredItems = state.menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (item: any) => {
    dispatch({ type: 'ADD_TO_CART', payload: item })
    toast.success(${item.name} added to cart!, { 
      duration: 2000,
      icon: '👑'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-cream via-white to-royal-gold/5">
      {/* Luxury Header */}
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
            
            <h1 className="text-2xl font-bold text-royal-burgundy font-serif">Royal Menu</h1>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-white"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-royal-gold h-4 w-4" />
            <Input
              placeholder="Search our royal menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-royal-gold/30 focus:border-royal-gold"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className={${
                  activeCategory === category
                    ? 'bg-royal-gold hover:bg-royal-copper text-white'
                    : 'border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-white'
                } transition-all duration-300}
              >
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Menu Grid */}
        <motion.div
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="group overflow-hidden bg-white/80 backdrop-blur-sm border border-royal-gold/20 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105">
                <div className="relative overflow-hidden">
                  <motion.img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                    whileHover={{ scale: 1.1 }}
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
                      £{item.price.toFixed(2)}
                    </Badge>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-royal-burgundy font-serif mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => addToCart(item)}
                      className="w-full bg-gradient-to-r from-royal-gold to-royal-copper hover:from-royal-copper hover:to-royal-gold text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Add to Cart
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-bold text-gray-500 mb-2">No dishes found</h3>
            <p className="text-gray-400">Try adjusting your search or category filter.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

