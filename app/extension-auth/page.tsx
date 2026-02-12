'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ExtensionAuth() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Syncing with extension...')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function syncAuth() {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          setStatus('error')
          setMessage('Not logged in. Please sign in first.')
          return
        }

        // Get profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        // Store auth data that extension can read
        const authData = {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          user: session.user,
          profile: profile
        }

        // Try to communicate with extension via localStorage
        // Extension content script can read this
        localStorage.setItem('webcrawl_auth', JSON.stringify(authData))
        
        // Also try postMessage for any listening extension
        window.postMessage({ 
          type: 'WEBCRAWL_AUTH', 
          auth: authData 
        }, '*')

        setStatus('success')
        setMessage('Auth synced! You can close this tab.')
        
        // Redirect to dashboard after delay
        setTimeout(() => {
          router.push('/')
        }, 2000)
        
      } catch (e) {
        console.error('Auth sync error:', e)
        setStatus('error')
        setMessage('Failed to sync auth. Please try again.')
      }
    }

    syncAuth()
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl
          ${status === 'loading' ? 'bg-amber-100 animate-pulse' : ''}
          ${status === 'success' ? 'bg-green-100' : ''}
          ${status === 'error' ? 'bg-red-100' : ''}
        `}>
          {status === 'loading' && '◈'}
          {status === 'success' && '✓'}
          {status === 'error' && '✗'}
        </div>
        
        <h1 className="text-xl font-bold mb-2">
          {status === 'loading' && 'Syncing...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Error'}
        </h1>
        
        <p className="text-gray-600 mb-4">{message}</p>
        
        {status === 'error' && (
          <button
            onClick={() => router.push('/login')}
            className="bg-amber-brand text-white px-6 py-2 rounded-lg font-medium hover:bg-[#a86b1d]"
          >
            Sign In
          </button>
        )}
        
        {status === 'success' && (
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        )}
      </div>
    </div>
  )
}
