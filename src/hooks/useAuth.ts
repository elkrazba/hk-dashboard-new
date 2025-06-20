import { useEffect, useState } from 'react'
import { User } from '@/types'
import { supabase } from '@/lib/supabase'
import { userService } from '@/services'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session and user data
    const initializeAuth = async () => {
      try {
        const user = await userService.getCurrentUser()
        setUser(user)
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await userService.getCurrentUser()
        setUser(user)
      } else {
        setUser(null)
        if (event === 'SIGNED_OUT') {
          router.push('/auth/login')
        }
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const logout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/auth/login')
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    logout,
  }
}

