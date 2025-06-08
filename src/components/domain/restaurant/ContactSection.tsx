// src/components/ContactSection.tsx
'use client'

import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, Crown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ContactSection() {
  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Visit Us",
      details: ["15 Russell Street", "Armagh BT61 9AA", "Northern Ireland"],
      action: "Get Directions",
      link: "https://maps.google.com/?q=15+Russell+Street+Armagh+BT61+9AA"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Call Us",
      details: ["+44 28 3752 2123", "For reservations & orders"],
      action: "Call Now",
      link: "tel:+442837522123"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Us",
      details: ["info@royalspice.co.uk", "We'll respond within 24 hours"],
      action: "Send Email",
      link: "mailto:info@royalspice.co.uk"
    }
  ]

  const openingHours = [
    { day: "Monday - Thursday", hours: "5:00 PM - 10:00 PM" },
    { day: "Friday - Saturday", hours: "5:00 PM - 10:30 PM" },
    { day: "Sunday", hours: "4:00 PM - 9:30 PM" },
  ]

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-white to-royal-cream/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-royal-burgundy font-serif mb-4">
            Visit Our Kingdom
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're located in the heart of Armagh, ready to serve you an unforgettable dining experience
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Cards & Opening Hours */}
          <div className="space-y-8">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid gap-6"
              aria-label="Contact information"
            >
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 10 }}
                  aria-label={info.title}
                >
                  <Card className="border-royal-gold/20 hover:border-royal-gold/40 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-royal-gold/10 rounded-lg text-royal-gold">
                          {info.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-royal-burgundy mb-2">{info.title}</h3>
                          {info.details.map((detail, i) => (
                            <p key={i} className="text-gray-600">{detail}</p>
                          ))}
                          <a
                            href={info.link}
                            target={info.link.startsWith('http') ? "_blank" : undefined}
                            rel={info.link.startsWith('http') ? "noopener noreferrer" : undefined}
                            className="inline-block mt-3"
                            aria-label={info.action}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-white"
                            >
                              {info.action}
                            </Button>
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Opening Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              aria-label="Opening hours"
            >
              <Card className="border-royal-gold/20 bg-gradient-to-br from-royal-burgundy to-royal-burgundy/90 text-white">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <Clock className="h-6 w-6 mr-3 text-royal-gold" />
                    <h3 className="text-2xl font-bold">Opening Hours</h3>
                  </div>
                  <div className="space-y-3">
                    {openingHours.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-white/20 last:border-0">
                        <span className="text-white/90">{schedule.day}</span>
                        <span className="font-semibold text-royal-gold">{schedule.hours}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-royal-gold/20 rounded-lg">
                    <p className="text-sm flex items-center">
                      <Crown className="h-4 w-4 mr-2 text-royal-gold" />
                      Reservations recommended for weekends
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="h-full min-h-[300px] md:min-h-[400px] lg:min-h-[500px]"
          >
            <Card className="h-full overflow-hidden border-royal-gold/20">
              <iframe
                title="Royal Spice Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2323.7849831015647!2d-6.655277684113!3d54.350189980207!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4860cd7c0f6c5c5f%3A0x1234567890abcdef!2s15%20Russell%20St%2C%20Armagh%20BT61%209AA%2C%20UK!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '300px', width: '100%' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale hover:grayscale-0 transition-all duration-300"
                aria-label="Google Map showing Royal Spice location"
              />
            </Card>
          </motion.div>
        </div>

        {/* Reservation CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16 p-8 bg-white rounded-2xl shadow-xl border border-royal-gold/20"
        >
          <h3 className="text-2xl font-bold text-royal-burgundy mb-4">
            Ready to Experience Royal Dining?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Whether you're planning a romantic dinner, family celebration, or business meeting, 
            we're here to make it memorable
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-royal-gold to-royal-copper hover:from-royal-copper hover:to-royal-gold text-white"
              onClick={() => window.location.href = 'tel:+442837522123'}
              aria-label="Call to reserve a table"
            >
              <Phone className="h-5 w-5 mr-2" />
              Make a Reservation
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-white"
              onClick={() => window.location.href = '/menu'}
              aria-label="Order online"
            >
              Order Online
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
