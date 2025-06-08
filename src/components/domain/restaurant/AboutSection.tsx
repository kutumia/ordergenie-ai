// src/components/AboutSection.tsx
'use client'

import { motion } from 'framer-motion'
import { Crown, Award, Users, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function AboutSection() {
  const features = [
    {
      icon: <Crown className="h-8 w-8 select-none" />,
      title: "Royal Experience",
      description: "Every dish is prepared with the finest ingredients and served with royal hospitality"
    },
    {
      icon: <Award className="h-8 w-8 select-none" />,
      title: "Award Winning",
      description: "Recognized for excellence in authentic Indian cuisine and exceptional service"
    },
    {
      icon: <Users className="h-8 w-8 select-none" />,
      title: "Family Tradition",
      description: "Three generations of culinary expertise bringing you the true taste of India"
    },
    {
      icon: <Clock className="h-8 w-8 select-none" />,
      title: "Fresh Daily",
      description: "All our ingredients are sourced fresh daily and spices are ground in-house"
    }
  ]

  return (
    <section id="about" aria-label="About Royal Spice" className="py-24 bg-gradient-to-b from-white to-royal-cream/20">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-royal-burgundy font-serif mb-6">
              Welcome to
              <span className="text-royal-gold block">Royal Spice</span>
            </h2>

            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Nestled in the heart of Armagh, Royal Spice has been serving authentic Indian cuisine
              for over 15 years. Our journey began with a simple mission: to bring the rich,
              diverse flavors of India to Northern Ireland.
            </p>

            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Every dish tells a story of tradition, crafted with recipes passed down through
              generations and enhanced with our chef's innovative touch. From the aromatic
              biryanis to the creamy kormas, each meal is a celebration of Indian culinary heritage.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  role="listitem"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border-royal-gold/20 hover:border-royal-gold/40 transition-all duration-300">
                    <div className="text-royal-gold mb-3">{feature.icon}</div>
                    <h3 className="font-bold text-royal-burgundy mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className="space-y-4"
                initial={{ y: 0 }}
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <img
                  src="https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Colorful Indian spices in bowls"
                  className="rounded-lg shadow-lg w-full h-48 object-cover"
                />
                <img
                  src="https://images.pexels.com/photos/3928854/pexels-photo-3928854.png?auto=compress&cs=tinysrgb&w=600"
                  alt="Traditional Indian cooking at Royal Spice"
                  className="rounded-lg shadow-lg w-full h-64 object-cover"
                />
              </motion.div>
              <motion.div
                className="space-y-4 pt-8"
                initial={{ y: 0 }}
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <img
                  src="https://images.pexels.com/photos/9609835/pexels-photo-9609835.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Elegant Royal Spice restaurant ambiance"
                  className="rounded-lg shadow-lg w-full h-64 object-cover"
                />
                <img
                  src="https://images.pexels.com/photos/6363741/pexels-photo-6363741.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Chef preparing Indian food at Royal Spice"
                  className="rounded-lg shadow-lg w-full h-48 object-cover"
                />
              </motion.div>
            </div>

            {/* Decorative Element */}
            <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-royal-gold/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
