'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Auth error:', error)
        router.push('/login')
        return
      }
      
      if (session?.user) {
        // Check if user has a profile with username
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        // Store auth data for extension to pick up
        // The extension's content script can read this from localStorage
        const authData = {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          user: session.user,
          profile: profile
        }
        localStorage.setItem('webcrawl_extension_auth', JSON.stringify(authData))
        
        // Also dispatch a custom event the extension can listen for
        window.dispatchEvent(new CustomEvent('webcrawl_auth_ready', { detail: authData }))
        
        if (!profile?.username) {
          // New user - send to welcome page
          router.push('/welcome')
        } else {
          // Existing user - send to dashboard
          router.push('/')
        }
      } else {
        router.push('/login')
      }
    }

    handleCallback()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
      <div className="text-center">
        <div className="text-4xl mb-4 text-amber-brand">◈</div>
        <div className="text-xl text-gray-500">Signing you in...</div>
      </div>
    </div>
  )
}
