'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent shrink-0">
            AuraRank
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</a>
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Sign Up Free
              </Button>
            </Link>
          </div>

          {/* Mobile: always show Sign Up + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/signup">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 h-8">
                Sign Up
              </Button>
            </Link>
            <button
              className="text-slate-400 hover:text-white p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-1">
            <a href="#features" className="block text-slate-400 hover:text-white px-2 py-2.5 rounded-lg hover:bg-slate-800/50 transition-colors" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#how-it-works" className="block text-slate-400 hover:text-white px-2 py-2.5 rounded-lg hover:bg-slate-800/50 transition-colors" onClick={() => setMobileOpen(false)}>How It Works</a>
            <a href="#pricing" className="block text-slate-400 hover:text-white px-2 py-2.5 rounded-lg hover:bg-slate-800/50 transition-colors" onClick={() => setMobileOpen(false)}>Pricing</a>
            <div className="pt-2 border-t border-slate-800 mt-2">
              <Link href="/login" className="block text-slate-300 px-2 py-2.5 hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>
                Log in
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
