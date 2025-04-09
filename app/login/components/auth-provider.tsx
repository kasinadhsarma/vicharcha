"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (phoneNumber: string, username: string) => Promise<void>
  verifyOtp: (otp: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/forgot-password']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check authentication status on mount and handle mock state
  useEffect(() => {
    const initAuth = async () => {
      if (process.env.NODE_ENV === 'development') {
        try {
          const mockUser = await mockAuthState({
            phoneNumber: "1234567890",
            name: "Test User"
          })
          setUser(mockUser)
        } catch (error) {
          console.error('Mock auth failed:', error)
        }
      } else {
        await checkAuth()
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  // Protect routes
  useEffect(() => {
    if (!loading) {
      if (!user && !publicRoutes.includes(pathname)) {
        router.push('/login')
      } else if (user && publicRoutes.includes(pathname)) {
        router.push('/')
      }
    }
  }, [user, loading, pathname, router])

  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        const response = await fetch(`/api/login?phoneNumber=${userData.phoneNumber}`)
        if (response.ok) {
          const user = await response.json()
          setUser(user)
        } else {
          localStorage.removeItem('user')
          setUser(null)
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (phoneNumber: string, username: string): Promise<void> => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, username }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Login failed")
      }

      // For demo, we'll use mock OTP flow
      localStorage.setItem('pendingAuth', phoneNumber)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (otp: string): Promise<void> => {
    setLoading(true)
    try {
      const phoneNumber = localStorage.getItem('pendingAuth')
      if (!phoneNumber) throw new Error("No pending verification found")

      const response = await fetch("/api/auth/otp", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          otp
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Verification failed")
      }

      const { user: userData } = await response.json()
      // Ensure isAgeVerified has a default value
      const userWithDefaults: User = {
        ...userData,
        isAgeVerified: userData.isAgeVerified || false
      }
      setUser(userWithDefaults)
      localStorage.setItem('user', JSON.stringify(userWithDefaults))
      localStorage.removeItem('pendingAuth')
      
      router.push('/')
    } catch (error) {
      console.error('OTP verification error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, logout }}>
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

// Mock auth state helper for testing
export const mockAuthState = async (userData: Partial<User>) => {
  const mockUser: User = {
    id: "mock-user-id", // Add default id
    phoneNumber: "1234567890",
    name: "Test User",
    verificationStatus: "verified",
    isAgeVerified: false,
    isPremium: false,
    digiLockerVerified: false,
    joinedDate: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    ...userData
  }
  localStorage.setItem('user', JSON.stringify(mockUser))
  return mockUser
}
