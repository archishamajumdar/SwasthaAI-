'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiRequest } from '@/lib/api'

interface User {
  id: string
  email: string
  full_name: string
  age?: number
  gender?: string
  health_history: string[]
  medicines: string[]
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const userData = await apiRequest('/auth/me')
      setUser(userData)
    } catch (error: any) {
      console.error('Failed to fetch user:', error)
      // If it's a 401 or similar, clear the token
      if (error.message.includes('401') || error.message.includes('credentials')) {
        localStorage.removeItem('access_token')
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (token: string) => {
    localStorage.setItem('access_token', token)
    await refreshUser()
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
