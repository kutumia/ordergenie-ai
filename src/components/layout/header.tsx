// src/components/layout/Header.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingBag, Crown, Phone, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRestaurant } from '@/contexts/RestaurantContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface HeaderProps {
  onNavigate: (sectionId: string) => void
  activeSection: string
}

export default function Header({ onNavigate, activeSection }: HeaderProps) {
  const { state, getCartItemCount } = useRestaurant()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const cartItemCount = getCartItemCount()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'menu', label: 'Menu' },
    { id: 'specials', label: 'Specials' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Contact' },
  ]

  return (
    <>
      {/* Top Bar */}
      <div className="bg-royal-burgundy text-white py-2">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <a href="tel:+442837522123" className="flex items-center hover:text-royal-gold transition-colors">
                <Phone className="h-3 w-3 mr-1" />
                +44 28 3752 2123
              </a>
              <div className="hidden sm:flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                15 Russell Street, Armagh
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Open: 5:00 PM - 10:00 PM
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-lg shadow-lg' 
            : 'bg-white/80 backdrop-blur-md'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div 
              className="flex items-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => onNavigate('home')}
            >
              <Crown className="h-8 w-8 text-royal-gold mr-2" />
              <div>
                <h1 className="text-2xl font-bold text-royal-burgundy font-serif">Royal Spice</h1>
                <p className="text-xs text-gray-600">Authentic Indian Cuisine</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={text-lg font-medium transition-colors relative ${
                    activeSection === item.id 
                      ? 'text-royal-gold' 
                      : 'text-gray-700 hover:text-royal-gold'
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <motion.div
                      layoutId="activeSection"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-royal-gold"
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/cart')}
                className="relative p-2"
              >
                <ShoppingBag className="h-6 w-6 text-royal-burgundy" />
                <AnimatePresence>
                  {cartItemCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1"
                    >
                      <Badge className="bg-royal-gold text-white border-0 h-5 w-5 p-0 flex items-center justify-center">
                        {cartItemCount}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Order Online Button */}
              <Button
                onClick={() => router.push('/menu')}
                className="hidden sm:flex bg-gradient-to-r from-royal-gold to-royal-copper hover:from-royal-copper hover:to-royal-gold text-white"
              >
                Order Online
              </Button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-royal-burgundy" />
                ) : (
                  <Menu className="h-6 w-6 text-royal-burgundy" />
                )}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-200"
            >
              <div className="container mx-auto px-4 py-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className={block w-full text-left py-3 text-lg font-medium transition-colors ${
                      activeSection === item.id 
                        ? 'text-royal-gold' 
                        : 'text-gray-700'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
                <Button
                  onClick={() => {
                    router.push('/menu')
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full mt-4 bg-gradient-to-r from-royal-gold to-royal-copper hover:from-royal-copper hover:to-royal-gold text-white"
                >
                  Order Online
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}