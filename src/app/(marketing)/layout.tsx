import { Navbar } from '@/components/landing/navbar'
import Link from 'next/link'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="pt-16">{children}</main>
      <footer className="border-t border-slate-800 py-12 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            href="/"
            className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent"
          >
            AuraRank
          </Link>
          <div className="flex gap-8 text-sm text-slate-500">
            <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          </div>
          <p className="text-sm text-slate-600">&copy; 2025 AuraRank. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
