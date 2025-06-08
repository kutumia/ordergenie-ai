// src/components/ReviewsSection.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function ReviewsSection() {
  const [currentReview, setCurrentReview] = useState(0)

  const reviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "SJ",
      rating: 5,
      date: "2 weeks ago",
      comment: "Absolutely fantastic! The Chicken Tikka Masala was the best I've ever had. The service was impeccable and the ambiance truly royal. Will definitely be returning!",
      verified: true
    },
    {
      id: 2,
      name: "Michael O'Connor",
      avatar: "MO",
      rating: 5,
      date: "1 month ago",
      comment: "Royal Spice never disappoints! The lamb biryani is a masterpiece, and the staff always makes you feel welcome. It's our go-to place for special occasions.",
      verified: true
    },
    {
      id: 3,
      name: "Emma Thompson",
      avatar: "ET",
      rating: 5,
      date: "1 month ago",
      comment: "As a vegetarian, I'm always impressed by the variety and quality of options here. The Paneer Makhani is divine! Great value for money too.",
      verified: true
    },
    {
      id: 4,
      name: "David Chen",
      avatar: "DC",
      rating: 5,
      date: "2 months ago",
      comment: "The online ordering system is so convenient! Food always arrives hot and fresh. The portions are generous and the flavors are authentic. Highly recommend!",
      verified: true
    }
  ]

  // Defensive: handle 0 reviews
  if (!reviews.length) {
    return null
  }

  const nextReview = () => setCurrentReview((prev) => (prev + 1) % reviews.length)
  const prevReview = () => setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length)

  return (
    <section id="reviews" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-royal-burgundy font-serif mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it – hear from our satisfied customers
          </p>
        </motion.div>

        {/* Reviews Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-12"
        >
          <div className="text-center">
            <div className="flex justify-center items-center mb-2">
              <Star className="h-6 w-6 text-royal-gold fill-current" />
              <span className="text-3xl font-bold text-royal-burgundy ml-2">4.8</span>
            </div>
            <p className="text-gray-600">Average Rating</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-royal-burgundy">500+</p>
            <p className="text-gray-600">Happy Customers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-royal-burgundy">98%</p>
            <p className="text-gray-600">Recommend Us</p>
          </div>
        </motion.div>

        {/* Review Carousel */}
        <div className="relative max-w-4xl mx-auto mt-8" role="region" aria-label="Customer testimonials" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentReview}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-royal-gold/20 shadow-xl">
                <CardContent className="p-8 md:p-12">
                  <Quote className="h-12 w-12 text-royal-gold/20 mb-6" />

                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < reviews[currentReview].rating ? 'text-royal-gold fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>

                  <p className="text-lg text-gray-700 mb-6 italic leading-relaxed">
                    "{reviews[currentReview].comment}"
                  </p>

                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${reviews[currentReview].name}`}
                        alt={reviews[currentReview].name}
                      />
                      <AvatarFallback>
                        {reviews[currentReview].avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-royal-burgundy">{reviews[currentReview].name}</p>
                      <p className="text-sm text-gray-500">
                        {reviews[currentReview].verified && "✓ Verified Customer • "}
                        {reviews[currentReview].date}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons: hide on small screens */}
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous review"
            onClick={prevReview}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-white hidden md:inline-flex"
            tabIndex={0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            aria-label="Next review"
            onClick={nextReview}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-white hidden md:inline-flex"
            tabIndex={0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Review Dots */}
        <div className="flex justify-center space-x-2 mt-8" aria-label="Review navigation dots">
          {reviews.map((_, index) => (
            <button
              key={index}
              aria-label={`Go to review ${index + 1}`}
              onClick={() => setCurrentReview(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-royal-gold ${
                index === currentReview
                  ? 'bg-royal-gold w-8'
                  : 'bg-gray-300 hover:bg-royal-gold/50'
              }`}
              tabIndex={0}
            />
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">Join hundreds of satisfied customers</p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-royal-gold to-royal-copper hover:from-royal-copper hover:to-royal-gold text-white"
            onClick={() => window.location.href = '/menu'}
            aria-label="Order now and experience excellence"
          >
            Order Now & Experience Excellence
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
