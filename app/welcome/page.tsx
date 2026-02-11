'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

export default function WelcomePage() {
  const [user, setUser] = useState<User | null>(null)
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
        // Already has username, go to dashboard
        router.push('/')
        return
      }
      
      // Suggest username from email
      const suggested = user.email?.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '') || ''
      setUsername(suggested)
      
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
    
    // Try insert first, then update if that fails
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user?.id,
        username: username.toLowerCase(),
        tier: 'scout',
        finds_count: 0,
        drops_count: 0,
        ftc_count: 0
      })
    
    if (insertError) {
      // Try update instead (profile might exist without username)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: username.toLowerCase() })
        .eq('id', user?.id)
      
      if (updateError) {
        console.error('Save error:', insertError, updateError)
        setError('Failed to save username. Try again.')
        setSaving(false)
        return
      }
    }
    
    setSaving(false)
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
      <div className="w-full max-w-md">
        
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-amber-light rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl text-amber-brand">
            ◈
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to Webcrawl!</h1>
          <p className="text-gray-500 mb-6">Choose your crawler name. This is how others will see you.</p>
          
          <div className="mb-6">
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-amber-brand">
              <span className="px-4 text-gray-400 text-lg">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
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
            disabled={saving || !username.trim()}
            className="w-full bg-amber-brand text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#a86b1d] transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}
