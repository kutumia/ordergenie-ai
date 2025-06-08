'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import AboutSection from '@/components/AboutSection'
import MenuSection from '@/components/MenuSection'
import SpecialOffersSection from '@/components/SpecialOffersSection'
import ReviewsSection from '@/components/ReviewsSection'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'
import AdminDashboard from '@/components/AdminDashboard'
import { useRestaurant } from '@/contexts/RestaurantContext'

export default function RoyalHomePage() {
  const { state } = useRestaurant()
  const [activeSection, setActiveSection] = useState('home')
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigateToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    if (sectionId === 'admin' && state.isAdmin) return
    const element = document.getElementById(sectionId)
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (state.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header onNavigate={navigateToSection} activeSection={activeSection} />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pt-16"
        >
          <AdminDashboard />
        </motion.main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Luxury Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-royal-gold/10 to-transparent rounded-full blur-3xl"
          animate={{
            y: scrollY * 0.3,
            rotate: scrollY * 0.1,
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-royal-burgundy/10 to-transparent rounded-full blur-3xl"
          animate={{
            y: scrollY * -0.2,
            rotate: scrollY * -0.1,
          }}
        />
      </div>

      <Header onNavigate={navigateToSection} activeSection={activeSection} />

      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <HeroSection onNavigate={navigateToSection} />
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
          <AboutSection />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}>
          <MenuSection />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}>
          <SpecialOffersSection onNavigate={navigateToSection} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }}>
          <ReviewsSection />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.6 }}>
          <ContactSection />
        </motion.div>
      </motion.main>

      <Footer />
    </div>
  )
}
