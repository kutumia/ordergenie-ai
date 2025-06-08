// src/app/auth/signin/page.tsx

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function RoyalSignInPage() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Demo credentials (replace with real auth logic)
      if (
        credentials.email === 'admin@royalspice.co.uk' &&
        credentials.password === 'royal123'
      ) {
        toast.success('Welcome back to Royal Spice! 👑')
        router.push('/admin')
      } else {
        toast.error('Invalid credentials. Try admin@royalspice.co.uk / royal123')
      }
    } catch (error) {
      toast.error('Sign in failed. Please try again.')
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
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-royal-gold/5 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
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
                Royal Sign In
              </h1>
              <p className="text-gray-600">
                Access your restaurant admin dashboard
              </p>
            </div>
            {/* Sign In Form */}
            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-royal-burgundy font-medium">
                  Email Address
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-royal-gold h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={credentials.email}
                    onChange={e =>
                      setCredentials({ ...credentials, email: e.target.value })
                    }
                    className="pl-10 border-royal-gold/30 focus:border-royal-gold"
                    placeholder="admin@royalspice.co.uk"
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
                    value={credentials.password}
                    onChange={e =>
                      setCredentials({ ...credentials, password: e.target.value })
                    }
                    className="pl-10 border-royal-gold/30 focus:border-royal-gold"
                    placeholder="royal123"
                    required
                  />
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-royal-gold to-royal-copper hover:from-royal-copper hover:to-royal-gold text-white py-3 text-lg font-semibold shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
            <Separator className="my-6" />
            {/* Demo Credentials */}
            <div className="text-center text-sm text-gray-600 bg-royal-gold/5 p-4 rounded-lg">
              <p className="font-medium text-royal-burgundy mb-1">
                Demo Credentials:
              </p>
              <p>Email: admin@royalspice.co.uk</p>
              <p>Password: royal123</p>
            </div>
            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/auth/signup"
                  className="text-royal-gold hover:text-royal-copper font-medium"
                >
                  Sign up here
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
