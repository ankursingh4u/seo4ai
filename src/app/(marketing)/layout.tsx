import { Navbar } from '@/components/landing/navbar'
import Link from 'next/link'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#FBF8F4] text-stone-900">
      <Navbar />
      <main className="pt-16">{children}</main>
      <footer className="border-t border-stone-200 py-12 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            href="/"
            className="text-lg font-bold bg-gradient-to-r from-violet-700 to-violet-400 bg-clip-text text-transparent"
          >
            SEO4AI
          </Link>
          <div className="flex gap-8 text-sm text-stone-500">
            <Link href="/#features" className="hover:text-stone-900 transition-colors">Features</Link>
            <Link href="/#pricing" className="hover:text-stone-900 transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-stone-900 transition-colors">Blog</Link>
          </div>
          <p className="text-sm text-stone-400">&copy; 2025 SEO4AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
