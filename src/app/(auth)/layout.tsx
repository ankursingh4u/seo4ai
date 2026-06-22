import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF8F4] via-[#FBF8F4] to-violet-100 text-stone-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo.png" alt="SEO4AI — AI Visibility & Brand Intelligence" width={260} height={81} className="h-16 w-auto" priority />
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
