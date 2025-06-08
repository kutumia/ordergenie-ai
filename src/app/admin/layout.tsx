import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata = {
  title: 'Admin Dashboard - Royal Spice',
  description: 'Restaurant management dashboard for Royal Spice',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
