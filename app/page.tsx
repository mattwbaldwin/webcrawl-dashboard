'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Profile, Cache, Trail } from '@/lib/types'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [caches, setCaches] = useState<Cache[]>([])
  const [trails, setTrails] = useState<Trail[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      // Check auth
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Get profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profile)
        
        // Sync auth to extension
        syncToExtension(user, profile)
      }
      
      // Get caches (public)
      const { data: cachesData } = await supabase
        .from('caches')
        .select('*')
        .eq('is_active', true)
        .is('trail_id', null)
        .order('created_at', { ascending: false })
        .limit(10)
      setCaches(cachesData || [])
      
      // Get trails (public)
      const { data: trailsData } = await supabase
        .from('trails')
        .select('*')
        .eq('is_active', true)
      setTrails(trailsData || [])
      
      setLoading(false)
    }
    
    init()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        syncToExtension(session.user, profile)
      }
    })
    
    return () => subscription.unsubscribe()
  }, [])

  function syncToExtension(user: User, profile: Profile | null) {
    // Try to send auth to extension
    const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID
    if (extensionId && typeof window !== 'undefined' && (window as any).chrome?.runtime) {
      try {
        (window as any).chrome.runtime.sendMessage(extensionId, {
          type: 'AUTH_TOKEN',
          token: null, // We'll use the session
          user: {
            id: user.id,
            email: user.email,
            username: profile?.username || user.email?.split('@')[0],
            tier: profile?.tier || 'scout'
          }
        })
      } catch (e) {
        // Extension not installed
      }
    }
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-light rounded-xl flex items-center justify-center text-amber-brand text-xl">
              ◈
            </div>
            <span className="text-xl font-bold">Webcrawl</span>
          </div>
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">@{profile?.username}</span>
              <button
                onClick={signOut}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="bg-[#C17F24] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#a86b1d] transition"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Welcome / Stats */}
        {user && profile && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-4">
              Welcome back, @{profile.username}
            </h1>
            
            <div className="grid grid-cols-3 gap-4 max-w-md">
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                <div className="text-3xl font-bold text-amber-brand">{profile.finds_count}</div>
                <div className="text-sm text-gray-500">Found</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                <div className="text-3xl font-bold text-amber-brand">{profile.drops_count}</div>
                <div className="text-sm text-gray-500">Dropped</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
                <div className="text-3xl font-bold text-amber-brand">{profile.ftc_count}</div>
                <div className="text-sm text-gray-500">FTCs</div>
              </div>
            </div>
          </div>
        )}

        {/* Not logged in prompt */}
        {!user && (
          <div className="bg-amber-light border border-amber-border rounded-2xl p-8 mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">The internet is an open world.</h1>
            <p className="text-gray-600 mb-6">Sign in to start finding and dropping caches.</p>
            <button
              onClick={signInWithGoogle}
              className="bg-[#C17F24] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#a86b1d] transition"
            >
              🔑 Sign in with Google
            </button>
          </div>
        )}

        {/* Trails Section */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🗺️ Trails
          </h2>
          
          <div className="grid gap-4">
            {trails.map(trail => (
              <Link 
                key={trail.id} 
                href={`/trail/${trail.id}`}
                className="bg-white rounded-xl p-5 border border-gray-100 hover:border-amber-brand hover:shadow-md transition block"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{trail.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{trail.description}</p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-500">
                      <span>{trail.cache_count} caches</span>
                      <span>{trail.estimated_time}</span>
                      <span>{'★'.repeat(trail.difficulty)}{'☆'.repeat(5 - trail.difficulty)}</span>
                    </div>
                  </div>
                  <div className="text-amber-brand text-2xl">→</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Caches Section */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🔥 Ready to Find
          </h2>
          
          <div className="grid gap-4">
            {caches.map(cache => (
              <Link
                key={cache.id}
                href={`/cache/${cache.id}`}
                className="bg-white rounded-xl p-5 border border-gray-100 hover:border-amber-brand hover:shadow-md transition block"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-brand">◈</span>
                      <h3 className="font-bold">{cache.name}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mt-1 italic">"{cache.clue}"</p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-500">
                      <span>👥 {cache.finds_count} finds</span>
                      <span>{'★'.repeat(cache.difficulty)}{'☆'.repeat(5 - cache.difficulty)}</span>
                      {cache.category && <span className="text-amber-brand">#{cache.category}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
