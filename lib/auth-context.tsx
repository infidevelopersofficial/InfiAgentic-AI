"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { apiClient } from './api-client'
import type { User } from './types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    email: string
    password: string
    first_name: string
    last_name: string
  }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(async () => {
    try {
      const token = apiClient.getAccessToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      const userData = await apiClient.getCurrentUser()
      
      // Map backend user to frontend User type
      setUser({
        id: userData.id || userData.user_id,
        email: userData.email,
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email,
        avatar: userData.avatar_url || undefined,
        role: userData.role || 'viewer',
        createdAt: new Date(userData.created_at || Date.now()),
      })
    } catch (error) {
      console.error('Failed to load user:', error)
      apiClient.clearTokens()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()

    // Listen for logout events
    const handleLogout = () => {
      setUser(null)
      apiClient.clearTokens()
    }

    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [loadUser])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.login(email, password)
      
      // Store tokens
      apiClient.setTokens(
        response.tokens.access_token,
        response.tokens.refresh_token
      )

      // Map backend user to frontend User type
      const userData = response.user
      setUser({
        id: userData.id || userData.user_id,
        email: userData.email,
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email,
        avatar: userData.avatar_url || undefined,
        role: userData.role || 'viewer',
        createdAt: new Date(userData.created_at || Date.now()),
      })
    } catch (error: any) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (userData: {
    email: string
    password: string
    first_name: string
    last_name: string
  }) => {
    setIsLoading(true)
    try {
      const response = await apiClient.register(userData)
      
      // Store tokens
      apiClient.setTokens(
        response.tokens.access_token,
        response.tokens.refresh_token
      )

      // Map backend user to frontend User type
      const backendUser = response.user
      setUser({
        id: backendUser.id || backendUser.user_id,
        email: backendUser.email,
        name: `${backendUser.first_name || ''} ${backendUser.last_name || ''}`.trim() || backendUser.email,
        avatar: backendUser.avatar_url || undefined,
        role: backendUser.role || 'viewer',
        createdAt: new Date(backendUser.created_at || Date.now()),
      })
    } catch (error: any) {
      console.error('Registration failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    apiClient.clearTokens()
    // Dispatch logout event for other components
    window.dispatchEvent(new CustomEvent('auth:logout'))
  }, [])

  const refreshUser = useCallback(async () => {
    await loadUser()
  }, [loadUser])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Higher-order component to protect routes
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        // Redirect to login
        window.location.href = '/login'
      }
    }, [isAuthenticated, isLoading])

    if (isLoading) {
      return <div>Loading...</div>
    }

    if (!isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }
}

