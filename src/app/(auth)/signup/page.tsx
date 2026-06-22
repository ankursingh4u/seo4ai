'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { GoogleButton } from '@/components/auth/google-button'
import { Mail, Lock, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // window.location.origin is localhost:3000 in dev, your real domain in production — always correct
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      // Give friendly, user-readable error messages
      if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists') || error.message.toLowerCase().includes('email address is already')) {
        setError('An account with this email already exists. Try signing in instead.')
      } else if (error.message.toLowerCase().includes('invalid email')) {
        setError('Please enter a valid email address.')
      } else if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many')) {
        setError('Too many attempts. Please wait a minute and try again.')
      } else if (error.message.toLowerCase().includes('weak password') || error.message.toLowerCase().includes('password should')) {
        setError('Password is too weak. Use at least 8 characters with letters and numbers.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <Card className="border-stone-200 bg-white backdrop-blur">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-semibold text-stone-900">Almost there — check your email</h2>
            <div className="bg-stone-100 border border-stone-200 rounded-lg px-4 py-3">
              <p className="text-stone-900 font-medium text-sm">{email}</p>
            </div>
            <p className="text-stone-500 text-sm">
              We sent a confirmation link to that address. Click it to activate your account and start scanning.
            </p>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-left">
              <p className="text-amber-400 text-xs font-medium mb-1">Don&apos;t see the email?</p>
              <ul className="text-stone-500 text-xs space-y-1">
                <li>• Check your spam or junk folder</li>
                <li>• It can take up to 2 minutes to arrive</li>
                <li>• Make sure you typed your email correctly</li>
              </ul>
            </div>
            <Link href="/login">
              <Button variant="outline" className="border-stone-200 text-stone-700 hover:bg-stone-100">
                Go to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-stone-200 bg-white backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl text-stone-900 text-center">Create your account</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <GoogleButton label="Sign up with Google" />
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-stone-200" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-stone-400">or</span></div>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-stone-700">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-500" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9 bg-stone-100 border-stone-200 text-stone-900 placeholder:text-stone-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-stone-700">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-stone-500" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="pl-9 pr-9 bg-stone-100 border-stone-200 text-stone-900 placeholder:text-stone-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-stone-500 hover:text-stone-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-stone-700">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-stone-500" />
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pl-9 bg-stone-100 border-stone-200 text-stone-900 placeholder:text-stone-500"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-700 hover:bg-violet-800 text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Account
          </Button>
          <p className="text-sm text-stone-500">
            Already have an account?{' '}
            <Link href="/login" className="text-violet-700 hover:text-violet-700 font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
