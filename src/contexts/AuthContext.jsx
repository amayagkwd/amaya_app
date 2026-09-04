/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app.
 * Handles Supabase auth session management.
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

const AuthContext = createContext({})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, profile) => {
    // Step 1: Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: profile.name,
          dob: profile.dob,
          country: profile.country
        }
      }
    })
    
    if (error) throw error
    
    // Step 2: Check if we have an authenticated session
    // Note: If email confirmation is required, data.session will be null
    if (!data.session) {
      throw new Error('Please check your email to confirm your account before signing in.')
    }
    
    // Step 3: Session exists, user is authenticated - create profile
    if (data.user && data.session) {
      // Create profile with authenticated session
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          name: profile.name,
          dob: profile.dob,
          country: profile.country
        }])
      
      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw new Error('Failed to create profile: ' + profileError.message)
      }
      
      // Create default settings
      const { error: settingsError } = await supabase
        .from('settings')
        .insert([{
          user_id: data.user.id
        }])
      
      if (settingsError) {
        console.error('Settings creation warning:', settingsError)
        // Don't throw - settings can be created later
      }
    }
    
    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
