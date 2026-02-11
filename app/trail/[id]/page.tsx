'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Cache, Trail, Find } from '@/lib/types'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'

export default function TrailDetail() {
  const params = useParams()
  const [trail, setTrail] = useState<Trail | null>(null)
  const [caches, setCaches] = useState<Cache[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [userFinds, setUserFinds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Get trail
      const { data: trailData } = await supabase
        .from('trails')
        .select('*')
        .eq('id', params.id)
        .single()
      setTrail(trailData)
      
      // Get caches in trail
      const { data: cachesData } = await supabase
        .from('caches')
        .select('*')
        .eq('trail_id', params.id)
        .order('trail_order', { ascending: true })
      setCaches(cachesData || [])
      
      // Get user's finds for these caches
      if (user && cachesData) {
        const cacheIds = cachesData.map(c => c.id)
        const { data: findsData } = await supabase
          .from('finds')
          .select('cache_id')
          .eq('user_id', user.id)
          .in('cache_id', cacheIds)
        
        if (findsData) {
          setUserFinds(new Set(findsData.map(f => f.cache_id)))
        }
      }
      
      setLoading(false)
    }
    
    load()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!trail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">Trail not found</div>
      </div>
    )
  }

  const foundCount = caches.filter(c => userFinds.has(c.id)).length
  const progress = caches.length > 0 ? (foundCount / caches.length) * 100 : 0
  const isComplete = foundCount === caches.length && caches.length > 0

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
        {/* Trail Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-amber-brand mb-2">
            <span>🗺️</span>
            <span className="text-sm font-medium uppercase tracking-wide">Trail</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{trail.name}</h1>
          <p className="text-gray-600">{trail.description}</p>
          
          {/* Progress */}
          {user && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{foundCount}/{caches.length} found</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${isComplete ? 'bg-green-500' : 'bg-amber-brand'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {isComplete && (
                <div className="mt-3 text-green-600 font-medium">
                  🏆 Trail complete!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Caches */}
        <div className="space-y-4">
          {caches.map((cache, index) => {
            const found = userFinds.has(cache.id)
            const prevFound = index === 0 || userFinds.has(caches[index - 1].id)
            const isLocked = !found && !prevFound && user
            
            return (
              <div 
                key={cache.id}
                className={`bg-white rounded-xl border overflow-hidden ${
                  found ? 'border-green-300' : isLocked ? 'border-gray-200 opacity-60' : 'border-gray-200'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Step number */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      found ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {found ? '✓' : index + 1}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {isLocked ? '🔒 ' : ''}{cache.name}
                      </h3>
                      
                      {!isLocked && (
                        <p className="text-gray-600 text-sm mt-1 italic">
                          "{cache.clue}"
                        </p>
                      )}
                      
                      {found && (
                        <p className="text-gray-500 text-sm mt-2">
                          Found!
                        </p>
                      )}
                    </div>
                    
                    {/* Action */}
                    {!isLocked && (
                      <Link
                        href={`/cache/${cache.id}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          found 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-light text-amber-brand hover:bg-[#f5e6d3]'
                        }`}
                      >
                        {found ? 'View' : 'Hunt →'}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
