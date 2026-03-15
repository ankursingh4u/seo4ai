import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'AuraRank - AI Visibility & Brand Intelligence',
    template: '%s | AuraRank',
  },
  description: 'Discover if AI models like ChatGPT, Perplexity, Claude, and Gemini recommend your brand. Get actionable insights to improve your AI visibility.',
  keywords: ['AI SEO', 'AI visibility', 'brand intelligence', 'ChatGPT ranking', 'AI search optimization', 'AI search', 'brand monitoring', 'ChatGPT SEO'],
  alternates: {
    canonical: appUrl,
  },
  openGraph: {
    title: 'AuraRank - AI Visibility & Brand Intelligence',
    description: 'Discover if AI models like ChatGPT, Perplexity, Claude, and Gemini recommend your brand. Get actionable insights to improve your AI visibility.',
    url: appUrl,
    siteName: 'AuraRank',
    type: 'website',
    images: [
      {
        url: `${appUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'AuraRank - AI Visibility & Brand Intelligence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AuraRank - AI Visibility & Brand Intelligence',
    description: 'Discover if AI models like ChatGPT, Perplexity, Claude, and Gemini recommend your brand. Get actionable insights to improve your AI visibility.',
    images: [`${appUrl}/og-image.png`],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-slate-950 text-white`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
