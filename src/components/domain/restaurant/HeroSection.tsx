// src/components/HeroSection.tsx
'use client'

import { motion } from 'framer-motion'
import { Crown, Star, Clock, ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  const router = useRouter()

  return (
    <section id="home" className="relative min-h-screen flex items-center">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(139, 21, 56, 0.7), rgba(139, 21, 56, 0.8)), url('https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
        aria-hidden="true"
      />

      {/* Decorative Elements */}
      <div className="absolute inset-0 z-10 pointer-events-none" aria-hidden="true">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-royal-gold/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-royal-copper/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            <Badge className="bg-royal-gold/20 text-royal-gold border-royal-gold/30 px-4 py-2">
              <Star className="h-4 w-4 mr-1 fill-current" />
              4.8 Rating
            </Badge>
            <Badge className="bg-royal-emerald/20 text-royal-emerald border-royal-emerald/30 px-4 py-2">
              <Clock className="h-4 w-4 mr-1" />
              35-45 min Delivery
            </Badge>
            <Badge className="bg-royal-copper/20 text-royal-copper border-royal-copper/30 px-4 py-2">
              <ChefHat className="h-4 w-4 mr-1" />
              Award Winning
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 font-serif leading-tight">
              Experience the
              <span className="block text-royal-gold">Royal Taste</span>
              of India
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto"
          >
            Authentic Indian cuisine crafted with passion, served with elegance in the heart of Armagh
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              aria-label="Order Online Now"
              onClick={() => router.push('/menu')}
              className="bg-gradient-to-r from-royal-gold to-royal-copper hover:from-royal-copper hover:to-royal-gold text-white px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <Crown className="h-5 w-5 mr-2" />
              Order Online Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              aria-label="View Our Menu"
              onClick={() => onNavigate('menu')}
              className="border-2 border-white text-white hover:bg-white hover:text-royal-burgundy px-8 py-6 text-lg font-semibold backdrop-blur-sm bg-white/10"
            >
              View Our Menu
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <h3 className="text-3xl font-bold text-royal-gold">500+</h3>
              <p className="text-white/80 mt-1">Happy Customers</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-bold text-royal-gold">15+</h3>
              <p className="text-white/80 mt-1">Years Experience</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-bold text-royal-gold">50+</h3>
              <p className="text-white/80 mt-1">Authentic Dishes</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <button
          aria-label="Scroll to About section"
          onClick={() => onNavigate('about')}
          className="text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </motion.div>
    </section>
  )
}
