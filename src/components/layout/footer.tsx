// src/components/Footer.tsx
'use client'

import { Crown, Facebook, Instagram, Twitter, Heart } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    'Quick Links': [
      { name: 'Home', href: '/' },
      { name: 'Menu', href: '/menu' },
      { name: 'Order Online', href: '/menu' },
      { name: 'Reservations', href: '#contact' },
    ],
    'Information': [
      { name: 'About Us', href: '#about' },
      { name: 'Special Offers', href: '#specials' },
      { name: 'Delivery Info', href: '/menu' },
      { name: 'Contact', href: '#contact' },
    ],
    'Legal': [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'Allergen Info', href: '#' },
    ],
  }

  const socialLinks = [
    { name: 'Facebook', icon: <Facebook className="h-5 w-5" />, href: 'https://facebook.com' },
    { name: 'Instagram', icon: <Instagram className="h-5 w-5" />, href: 'https://instagram.com' },
    { name: 'Twitter', icon: <Twitter className="h-5 w-5" />, href: 'https://twitter.com' },
  ]

  return (
    <footer className="bg-royal-burgundy text-white" aria-labelledby="footer-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <Crown className="h-8 w-8 text-royal-gold mr-3" />
              <div>
                <h3 className="text-2xl font-bold font-serif">Royal Spice</h3>
                <p className="text-xs text-royal-gold">Authentic Indian Cuisine</p>
              </div>
            </div>
            <p className="text-white/80 mb-6 max-w-sm">
              Experience the royal taste of India with our authentic dishes, 
              prepared with love and served with pride in Armagh.
            </p>
            <nav aria-label="Social media links" className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/10 rounded-full hover:bg-royal-gold hover:text-royal-burgundy transition-all duration-300"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </nav>
          </div>
          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <nav key={title} aria-label={title}>
              <h4 className="text-lg font-semibold mb-4 text-royal-gold">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white/80 hover:text-royal-gold transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/60 text-sm text-center md:text-left">
              © {currentYear} Royal Spice. All rights reserved.
            </p>
            <p className="text-white/60 text-sm flex items-center">
              Made with <Heart className="h-4 w-4 mx-1 text-royal-gold fill-current" /> by 
              <a 
                href="https://ordergenie.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1 text-royal-gold hover:text-white transition-colors"
              >
                OrderGenie AI
              </a>
            </p>
          </div>
        </div>
      </div>
      {/* Decorative Element */}
      <div className="h-1 bg-gradient-to-r from-royal-gold via-royal-copper to-royal-gold" />
    </footer>
  )
}
