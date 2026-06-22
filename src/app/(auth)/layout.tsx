export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF8F4] via-[#FBF8F4] to-violet-100 text-stone-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-700 to-violet-400 bg-clip-text text-transparent">
            SEO4AI
          </h1>
          <p className="text-stone-500 mt-2 text-sm">AI Visibility & Brand Intelligence</p>
        </div>
        {children}
      </div>
    </div>
  )
}
