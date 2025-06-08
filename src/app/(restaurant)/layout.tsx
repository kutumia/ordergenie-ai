import { Inter, Playfair_Display } from 'next/font/google'
import { RestaurantProvider } from '@/contexts/RestaurantContext'
import { Toaster } from '@/components/ui/sonner'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata = {
  title: 'Royal Spice - Authentic Indian Fine Dining | Armagh',
  description: 'Experience royal Indian cuisine in the heart of Armagh, Northern Ireland. Authentic flavors, elegant atmosphere, exceptional service.',
  keywords: 'Indian restaurant, Armagh, Northern Ireland, royal cuisine, fine dining, authentic Indian food',
}

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-gradient-to-br from-royal-cream via-white to-royal-gold/5">
        <RestaurantProvider>
          {children}
          <WhatsAppFloat />
          <Toaster position="top-right" richColors />
        </RestaurantProvider>
      </body>
    </html>
  )
}
