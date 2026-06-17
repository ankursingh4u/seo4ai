export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            SEO4AI
          </h1>
          <p className="text-slate-400 mt-2 text-sm">AI Visibility & Brand Intelligence</p>
        </div>
        {children}
      </div>
    </div>
  )
}
