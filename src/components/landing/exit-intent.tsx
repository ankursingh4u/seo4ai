'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { X, Eye } from 'lucide-react'

export function ExitIntent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem('exit-intent-shown')) return

    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0 && !show) {
        setShow(true)
        sessionStorage.setItem('exit-intent-shown', '1')
        document.removeEventListener('mouseout', handleMouseLeave)
      }
    }

    // Delay activation by 5 seconds
    const timer = setTimeout(() => {
      document.addEventListener('mouseout', handleMouseLeave)
    }, 5000)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseout', handleMouseLeave)
    }
  }, [show])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={() => setShow(false)}>
      <div className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-8 relative shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <button onClick={() => setShow(false)} className="absolute top-4 right-4 text-stone-500 hover:text-stone-900">
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <Eye className="h-10 w-10 text-violet-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-stone-900 mb-2">Wait! Is AI Ignoring Your Brand?</h2>
          <p className="text-sm text-stone-500 mb-6">
            90% of businesses are invisible to AI search. Get a free visibility check in 10 seconds, no signup required.
          </p>
          <Link href="#free-scan">
            <Button className="w-full bg-violet-700 hover:bg-violet-800 text-white h-11 text-base" onClick={() => setShow(false)}>
              Check My Brand Free
            </Button>
          </Link>
          <button onClick={() => setShow(false)} className="text-xs text-stone-400 hover:text-stone-500 mt-4 block mx-auto">
            No thanks, I&apos;ll miss out
          </button>
        </div>
      </div>
    </div>
  )
}
