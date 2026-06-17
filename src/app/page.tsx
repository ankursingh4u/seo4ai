import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/landing/navbar'
import { FreeScan } from '@/components/landing/free-scan'
import {
  Search, BarChart3, Target, TrendingUp, Shield,
  ArrowRight, Check, Eye, Bot, Brain, Lightbulb, Sparkles
} from 'lucide-react'

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 mb-6 px-4 py-1.5">
            <Sparkles className="h-3 w-3 mr-1.5" />
            Google Search Console for AI Search
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Is AI Recommending{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Your Brand?
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            ChatGPT, Gemini, and Perplexity are replacing Google Search.
            When customers ask AI &ldquo;what&apos;s the best option?&rdquo; — are you in the answer?
            SEO4AI finds out, shows you who&apos;s winning, and tells you exactly what to fix.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="#free-scan">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 text-base w-full sm:w-auto">
                Check My Brand Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 px-8 h-12 text-base w-full sm:w-auto">
                See How It Works
              </Button>
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-indigo-400" />
              <span>AI-Powered Search Testing</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-indigo-400" />
              <span>20+ Customer Search Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-indigo-400" />
              <span>Personalized Fix Plans</span>
            </div>
          </div>

          {/* Free Scan */}
          <div id="free-scan" className="mt-12 scroll-mt-24">
            <p className="text-sm text-slate-400 mb-4">Try it now — no account needed</p>
            <FreeScan />
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">The Problem</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              AI is fundamentally changing how people discover products and services.
              Traditional SEO tools can&apos;t help you here.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-red-400 mb-3">Traditional Search (Declining)</h3>
                <p className="text-slate-400 text-sm mb-4">User searches Google, sees 10 blue links, clicks to your website.</p>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-slate-600" /> You can track rankings</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-slate-600" /> You can measure clicks</li>
                  <li className="flex items-center gap-2"><Check className="h-3 w-3 text-slate-600" /> You can optimize content</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-indigo-500/30 ring-1 ring-indigo-500/20">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-indigo-400 mb-3">AI Search (Growing Fast)</h3>
                <p className="text-slate-400 text-sm mb-4">User asks AI, gets a direct answer with brand recommendations. No clicks needed.</p>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li className="flex items-center gap-2"><XIcon className="h-3 w-3 text-red-500" /> No visibility into rankings</li>
                  <li className="flex items-center gap-2"><XIcon className="h-3 w-3 text-red-500" /> No idea why competitors chosen</li>
                  <li className="flex items-center gap-2"><XIcon className="h-3 w-3 text-red-500" /> No optimization strategy</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400">Four simple steps to AI visibility</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Set Up Your Brand', desc: 'Add your brand name, industry, and up to 3 competitors to track.', icon: Shield },
              { step: '02', title: 'AI Tests Your Visibility', desc: 'We ask AI the exact questions your customers ask — and record whether your brand appears.', icon: Search },
              { step: '03', title: 'Get Your Score', desc: 'See your AI Visibility Score out of 100 with detailed breakdown.', icon: BarChart3 },
              { step: '04', title: 'Follow Fix Plan', desc: 'Get actionable recommendations to improve your AI visibility.', icon: Lightbulb },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
                  <item.icon className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="text-xs text-indigo-400 font-mono mb-2">STEP {item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm text-slate-400 uppercase tracking-wide">Trusted by growing brands</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "We discovered we were invisible on ChatGPT. After following SEO4AI's fix plan, we went from 0 to mentioned in 8/10 prompts.",
                name: 'Sarah K.',
                role: 'SaaS Founder',
              },
              {
                quote: "Our competitor was getting all the AI recommendations. SEO4AI showed us exactly what to fix. Our visibility score went from 12 to 67 in 6 weeks.",
                name: 'Mike R.',
                role: 'Agency Owner',
              },
              {
                quote: "As a local restaurant, we had no idea AI was sending customers to our competitors. SEO4AI's regional targeting changed everything.",
                name: 'Priya M.',
                role: 'Restaurant Owner',
              },
            ].map((testimonial) => (
              <Card key={testimonial.name} className="bg-slate-900/50 border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="h-4 w-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div>
                    <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center gap-8 mt-12 text-slate-600 text-sm">
            <span>500+ brands tracked</span>
            <span>10,000+ AI scans</span>
            <span>4 AI models monitored</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-slate-400">Comprehensive AI visibility intelligence</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Eye, title: 'AI Visibility Score', desc: 'Get a clear score out of 100 showing how visible your brand is across AI models.' },
              { icon: Target, title: 'Competitor Gap Analysis', desc: 'See exactly how often competitors are mentioned vs your brand across all prompts.' },
              { icon: Search, title: 'Prompt Opportunity Detection', desc: 'Discover prompts where competitors appear but you don\'t — your biggest opportunities.' },
              { icon: Lightbulb, title: 'AI Fix Plan', desc: 'Get specific, actionable recommendations to improve your AI visibility with priority ratings.' },
              { icon: TrendingUp, title: 'Progress Tracking', desc: 'Monitor your AI visibility score over time and see the impact of your optimization efforts.' },
              { icon: Bot, title: 'Real Customer Questions', desc: 'We test the exact prompts your customers use — not generic queries. Real signal, real results.' },
            ].map((feature) => (
              <Card key={feature.title} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                <CardContent className="pt-6">
                  <feature.icon className="h-8 w-8 text-indigo-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-slate-400">Start free, upgrade when you need more</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto items-stretch">
            {[
              {
                name: 'Starter', price: 'Free', priceSuffix: 'forever',
                border: 'border-slate-800', btn: 'outline' as const, btnClass: 'border-slate-700 text-slate-300 hover:bg-slate-800', btnText: 'Get Started Free',
                features: [
                  { text: '1 brand', on: true },
                  { text: '3 scans per month', on: true },
                  { text: 'AI Visibility Score', on: true },
                  { text: 'Region targeting', on: true },
                  { text: 'Competitor scores', on: false },
                  { text: 'AI Fix Plan', on: false },
                  { text: 'Boost content generator', on: false },
                ],
              },
              {
                name: 'Pro', price: '$9', priceSuffix: '/month', badge: 'Most Popular', badgeClass: 'bg-indigo-600',
                border: 'border-indigo-500/50 ring-1 ring-indigo-500/20', btn: 'default' as const, btnClass: 'bg-indigo-600 hover:bg-indigo-700 text-white', btnText: 'Get Started',
                features: [
                  { text: '3 brands', on: true },
                  { text: '15 scans per month', on: true },
                  { text: 'AI Visibility Score', on: true },
                  { text: 'Competitor gap scores', on: true, highlight: true },
                  { text: 'Region targeting', on: true },
                  { text: 'Progress history', on: true },
                  { text: 'AI Fix Plan', on: false },
                ],
              },
              {
                name: 'Max', price: '$29', priceSuffix: '/month', badge: 'Best Value', badgeClass: 'bg-emerald-600',
                border: 'border-emerald-500/30 ring-1 ring-emerald-500/10', btn: 'default' as const, btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white', btnText: 'Get Started',
                features: [
                  { text: '10 brands', on: true },
                  { text: '60 scans per month', on: true },
                  { text: 'Competitor gap scores', on: true },
                  { text: 'AI Fix Plan', on: true, highlight: true },
                  { text: 'Boost content generator', on: true, highlight: true },
                  { text: 'Export reports', on: true },
                  { text: 'Priority support', on: true },
                ],
              },
            ].map((plan) => (
              <Card key={plan.name} className={`bg-slate-900/50 ${plan.border} flex flex-col`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {plan.badge && (
                      <Badge className={`${plan.badgeClass} text-white border-0 text-xs`}>{plan.badge}</Badge>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-slate-500"> {plan.priceSuffix}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <ul className="space-y-3 text-sm text-slate-400 flex-1 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        {f.on
                          ? <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                          : <XIcon className="h-4 w-4 text-slate-600 shrink-0" />}
                        <span className={f.on ? ('highlight' in f && f.highlight ? 'text-white font-medium' : 'text-slate-300') : 'text-slate-600'}>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="block mt-auto">
                    <Button variant={plan.btn} className={`w-full ${plan.btnClass}`}>
                      {plan.btnText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-indigo-950/80 to-violet-950/80 border border-indigo-500/20 rounded-2xl p-12">
            <Brain className="h-12 w-12 text-indigo-400 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Start Tracking Your AI Visibility Today
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Don&apos;t let competitors dominate AI recommendations. Discover your visibility score and get a personalized fix plan.
            </p>
            <Link href="/signup">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 text-base">
                Start Free Scan <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            SEO4AI
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          </div>
          <p className="text-sm text-slate-600">&copy; 2025 SEO4AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
