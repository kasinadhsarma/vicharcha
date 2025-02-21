"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/ui/loading"
import { ShieldCheck, Lock } from "lucide-react"

interface DigiLockerVerifyButtonProps {
  userId: string;
  onVerified?: () => void;
  size?: "sm" | "default" | "lg";
}

export function DigiLockerVerifyButton({
  userId,
  onVerified,
  size = "default"
}: DigiLockerVerifyButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const handleVerify = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/auth/digilocker/verify?userId=${userId}`, {
        method: "GET"
      })
      const data = await response.json()

      if (data.verified) {
        setIsVerified(true)
        toast.success("DigiLocker verification confirmed")
        onVerified?.()
        return
      }

      const verifyResponse = await fetch("/api/auth/digilocker/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId })
      })

      const verifyData = await verifyResponse.json()

      if (verifyData.success) {
        setIsVerified(true)
        toast.success("DigiLocker verification successful!")
        onVerified?.()
      } else {
        toast.error(verifyData.error || "Verification failed. Please try again.")
      }
    } catch (error) {
      console.error("DigiLocker verification error:", error)
      toast.error("Failed to verify with DigiLocker")
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerified) {
    return (
      <Button
        size={size}
        variant="outline"
        className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
        disabled
      >
        <ShieldCheck className="w-4 h-4 mr-2" />
        DigiLocker Verified
      </Button>
    )
  }

  return (
    <Button
      size={size}
      variant="outline"
      onClick={handleVerify}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <LoadingSpinner className="mr-2" />
          Verifying...
        </>
      ) : (
        <>
          <Lock className="w-4 h-4 mr-2" />
          Verify with DigiLocker
        </>
      )}
    </Button>
  )
}
