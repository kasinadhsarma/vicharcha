"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@app/login/components/auth-provider"
import { DigiLockerVerification } from "@/app/login/components/digilocker-verification"

export default function VerifyPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    // If no user or already verified, redirect
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (user.digiLockerVerified) {
        router.push("/")
      }
    }
  }, [user, loading, router])

  // Show loading state while checking auth
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome to Vicharcha!</h1>
        <p className="text-muted-foreground">Complete your verification to access all features.</p>
      </div>
      <DigiLockerVerification 
        username={user.name || 'Guest'} 
        onVerificationComplete={() => router.push("/")}
      />
      <div className="mt-4">
        <button 
          className="text-sm text-muted-foreground hover:text-primary"
          onClick={() => router.push("/")}
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
