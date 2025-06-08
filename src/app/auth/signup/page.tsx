// src/app/auth/signup/page.tsx

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Mail, Lock, User, ArrowRight, Sparkles, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function RoyalSignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    restaurantName: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match')
        setIsLoading(false)
        return
      }
      // Simulate registration
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Welcome to Royal Spice! Your account has been created. 👑')
      router.push('/admin')
    } catch (error) {
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-burgundy via-royal-burgundy/90 to-royal-burgundy/80 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-royal-gold/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-white/95 backdrop-blur-lg border border-royal-gold/30 shadow-2xl">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-royal-gold to-royal-copper rounded-full mb-4"
              >
                <Crown className="h-8 w-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-royal-burgundy font-serif mb-2">
                Join Royal Spice
              </h1>
              <p className="text-gray-600">Create your restaurant account</p>
            </div>
            {/* Sign Up Form */}
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-royal-burgundy font-medium">
                  Full Name
                </Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-royal-gold h-4 w-4" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 border-royal-gold/30 focus:border-royal-gold"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="restaurantName" className="text-royal-burgundy font-medium">
                  Restaurant Name
                </Label>
                <div className="relative mt-1">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-royal-gold h-4 w-4" />
                  <Input
                    id="restaurantName"
                    value={formData.restaurantName}
                    onChange={e => setFormData({ ...formData, restaurantName: e.target.value })}
                    className="pl-10 border-royal-gold/30 focus:border-royal-gold"
                    placeholder="Your restaurant name"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-royal-burgundy font-medium">
                  Email Address
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-royal-gold h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 border-royal-gold/30 focus:border-royal-gold"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password" className="text-royal-burgundy font-medium">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-royal-gold h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 border-royal-gold/30 focus:border-royal-gold"
                    placeholder="Create a strong password"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-royal-burgundy font-medium">
                  Confirm Password
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-royal-gold h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 border-royal-gold/30 focus:border-royal-gold"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-royal-gold to-royal-copper hover:from-royal-copper hover:to-royal-gold text-white py-3 text-lg font-semibold shadow-lg mt-6"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <>
                      Create Royal Account
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
            <Separator className="my-6" />
            {/* Footer */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/signin" className="text-royal-gold hover:text-royal-copper font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-white/80 hover:text-white transition-colors flex items-center justify-center space-x-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Back to Royal Spice</span>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
