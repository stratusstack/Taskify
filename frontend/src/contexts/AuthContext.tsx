import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types'
import { apiService } from '@/services/api'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('taskify-token')
    if (storedToken) {
      setToken(storedToken)
      // Verify token and get user profile
      apiService.getProfile()
        .then(userProfile => {
          setUser(userProfile)
        })
        .catch(() => {
          // Token is invalid, remove it
          localStorage.removeItem('taskify-token')
          setToken(null)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(username, password)
      setToken(response.token)
      setUser(response.user)
      localStorage.setItem('taskify-token', response.token)
      toast.success('Welcome back!')
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed')
      return false
    }
  }

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.register(username, email, password)
      setToken(response.token)
      setUser(response.user)
      localStorage.setItem('taskify-token', response.token)
      toast.success('Account created successfully!')
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('taskify-token')
    toast.success('Logged out successfully')
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}