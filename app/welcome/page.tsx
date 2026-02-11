'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

export default function WelcomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [step, setStep] = useState<'username' | 'extension' | 'ready'>('username')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)
      
      // Check if user already has a profile with username
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
      
      if (profile?.username) {
        // Already has username, check if they've been here before
        const hasSeenWelcome = localStorage.getItem('webcrawl_welcomed')
        if (hasSeenWelcome) {
          router.push('/')
          return
        }
        setUsername(profile.username)
        setStep('extension')
      } else {
        // Suggest username from email
        const suggested = user.email?.split('@')[0] || ''
        setUsername(suggested)
      }
      
      setLoading(false)
    }
    
    checkUser()
  }, [])

  async function handleSaveUsername() {
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores')
      return
    }
    
    setSaving(true)
    setError('')
    
    // Check if username is taken
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .neq('id', user?.id || '')
      .single()
    
    if (existing) {
      setError('Username is already taken')
      setSaving(false)
      return
    }
    
    // Upsert profile
    const { error: saveError } = await supabase
      .from('profiles')
      .upsert({
        id: user?.id,
        username: username.toLowerCase(),
        tier: 'scout',
        finds_count: 0,
        drops_count: 0,
        ftc_count: 0
      })
    
    if (saveError) {
      setError('Failed to save username. Try again.')
      setSaving(false)
      return
    }
    
    setSaving(false)
    setStep('extension')
  }

  function handleContinue() {
    localStorage.setItem('webcrawl_welcomed', 'true')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        
        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            step === 'username' ? 'bg-amber-brand text-white' : 'bg-green-500 text-white'
          }`}>
            {step === 'username' ? '1' : '✓'}
          </div>
          <div className={`w-16 h-1 rounded ${step === 'username' ? 'bg-gray-200' : 'bg-green-500'}`} />
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            step === 'extension' ? 'bg-amber-brand text-white' : 
            step === 'ready' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
          }`}>
            {step === 'ready' ? '✓' : '2'}
          </div>
        </div>

        {/* Step 1: Username */}
        {step === 'username' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-amber-light rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl text-amber-brand">
              👤
            </div>
            <h1 className="text-2xl font-bold mb-2">Choose your crawler name</h1>
            <p className="text-gray-500 mb-6">This is how other crawlers will see you.</p>
            
            <div className="mb-6">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-amber-brand">
                <span className="px-4 text-gray-400 text-lg">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="flex-1 py-4 pr-4 text-lg focus:outline-none"
                  placeholder="username"
                  maxLength={20}
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>
            
            <button
              onClick={handleSaveUsername}
              disabled={saving}
              className="w-full bg-amber-brand text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#a86b1d] transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Continue'}
            </button>
          </div>
        )}

        {/* Step 2: Extension */}
        {step === 'extension' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-amber-light rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl text-amber-brand">
              ◈
            </div>
            <h1 className="text-2xl font-bold mb-2">Get the extension</h1>
            <p className="text-gray-500 mb-6">
              The extension is your beacon — it glows when you're near a cache.
            </p>
            
            <div className="bg-amber-light rounded-xl p-5 mb-6 text-left">
              <h3 className="font-bold text-amber-brand mb-3">How it works:</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li className="flex gap-2">
                  <span>🔍</span>
                  <span>Browse the web normally</span>
                </li>
                <li className="flex gap-2">
                  <span>✨</span>
                  <span>Extension glows amber when you're near a cache</span>
                </li>
                <li className="flex gap-2">
                  <span>🔥</span>
                  <span>Glow gets brighter as you get closer</span>
                </li>
                <li className="flex gap-2">
                  <span>🎉</span>
                  <span>Find the cache, read the message, log your discovery!</span>
                </li>
              </ul>
            </div>
            
            <a
              href="/extension"
              target="_blank"
              className="block w-full bg-amber-brand text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#a86b1d] transition mb-4"
            >
              📥 Download Extension
            </a>
            
            <button
              onClick={handleContinue}
              className="w-full text-gray-500 py-3 font-medium hover:text-gray-700 transition"
            >
              I'll do this later →
            </button>
          </div>
        )}

        {/* Welcome message */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Welcome to Webcrawl, @{username}! 🎉
        </p>
      </div>
    </div>
  )
}
