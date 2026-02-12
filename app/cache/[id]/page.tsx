'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Cache, Find } from '@/lib/types'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'

export default function CacheDetail() {
  const params = useParams()
  const router = useRouter()
  const [cache, setCache] = useState<Cache | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [userFind, setUserFind] = useState<Find | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingFind, setLoggingFind] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Get cache
      const { data: cacheData } = await supabase
        .from('caches')
        .select('*')
        .eq('id', params.id)
        .single()
      setCache(cacheData)
      
      // Check if user found this cache
      if (user && cacheData) {
        const { data: findData } = await supabase
          .from('finds')
          .select('*')
          .eq('cache_id', cacheData.id)
          .eq('user_id', user.id)
          .single()
        setUserFind(findData)
      }
      
      setLoading(false)
    }
    
    load()
  }, [params.id])

  async function logFindManually() {
    if (!user || !cache) return
    
    setLoggingFind(true)
    
    try {
      const { data, error } = await supabase
        .from('finds')
        .insert({
          cache_id: cache.id,
          user_id: user.id,
          log_text: 'Logged from dashboard'
        })
        .select()
        .single()
      
      if (error) {
        if (error.code === '23505') {
          // Already found - reload to show
          window.location.reload()
        } else {
          console.error('Error logging find:', error)
          alert('Error logging find. Please try again.')
        }
      } else {
        // Success - update cache finds count
        await supabase
          .from('caches')
          .update({ finds_count: (cache.finds_count || 0) + 1 })
          .eq('id', cache.id)
        
        setUserFind(data)
        setCache({ ...cache, finds_count: (cache.finds_count || 0) + 1 })
      }
    } catch (e) {
      console.error('Error:', e)
      alert('Error logging find. Please try again.')
    }
    
    setLoggingFind(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!cache) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-xl text-gray-500">Cache not found</div>
      </div>
    )
  }

  const hasFound = !!userFind

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Cache Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
          {/* Header */}
          <div className={`p-6 text-white text-center ${hasFound ? 'bg-green-500' : 'bg-gradient-to-br from-[#C17F24] to-[#D4922E]'}`}>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              {hasFound ? '✓' : '◈'}
            </div>
            <div className="text-sm uppercase tracking-wide opacity-90">
              {hasFound ? 'Found!' : 'Cache'}
            </div>
            <h1 className="text-2xl font-bold mt-1">{cache.name}</h1>
          </div>
          
          {/* Body */}
          <div className="p-6">
            {/* Clue */}
            <div className="bg-amber-light rounded-xl p-4 mb-6">
              <div className="text-sm font-medium text-amber-brand mb-1">CLUE</div>
              <p className="text-gray-700 italic">"{cache.clue}"</p>
            </div>
            
            {/* Message - only show if found */}
            {hasFound && (
              <div className="mb-6">
                <div className="text-sm font-medium text-gray-500 mb-2">MESSAGE</div>
                <p className="text-gray-700 whitespace-pre-wrap">{cache.message}</p>
              </div>
            )}
            
            {/* Hint */}
            {cache.hint && !hasFound && (
              <div className="mb-6 text-sm text-gray-500">
                <strong className="text-amber-brand">Hint:</strong> {cache.hint}
              </div>
            )}
            
            {/* Stats */}
            <div className="flex gap-6 mb-6 text-sm text-gray-500">
              <div>👥 {cache.finds_count} finds</div>
              <div>{'★'.repeat(cache.difficulty)}{'☆'.repeat(5 - cache.difficulty)} difficulty</div>
              {cache.owner_display && <div>📍 by {cache.owner_display}</div>}
            </div>
            
            {/* Actions */}
            {!user ? (
              <div className="bg-gray-100 rounded-xl p-4 text-center text-gray-600">
                <Link href="/login" className="text-amber-brand hover:underline">Sign in</Link> to track your finds
              </div>
            ) : hasFound ? (
              <div className="bg-green-100 rounded-xl p-4 text-center text-green-700">
                ✓ You found this cache!
                {userFind?.is_ftc && <span className="block text-sm mt-1">🏆 First to Crawl!</span>}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-light rounded-xl p-4 text-center">
                  <p className="text-gray-700 mb-2">
                    Use the clue to find this page on the web.
                  </p>
                  <p className="text-sm text-gray-500">
                    Your extension will glow when you're close! 🔥
                  </p>
                </div>
                
                <button
                  onClick={logFindManually}
                  disabled={loggingFind}
                  className="w-full py-3 rounded-xl font-semibold bg-amber-brand text-white hover:bg-[#a86b1d] transition disabled:opacity-50"
                >
                  {loggingFind ? 'Logging...' : '✓ I found it!'}
                </button>
                <p className="text-xs text-center text-gray-400">
                  Click after you've found the cache with your extension
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Trail Link */}
        {cache.trail_id && (
          <div className="mt-6 text-center">
            <Link 
              href={`/trail/${cache.trail_id}`}
              className="text-amber-brand hover:underline"
            >
              ← Back to trail
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
