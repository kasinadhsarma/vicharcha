"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Phone, Video, Mic, MicOff, VideoOff } from "lucide-react"

interface CallDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function CallDialog({ isOpen, onClose }: CallDialogProps) {
  const [isVideoCall, setIsVideoCall] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [callStatus, setCallStatus] = useState<"calling" | "connected" | "ended">("calling")

  useEffect(() => {
    if (isOpen) {
      // Simulate call connection after 3 seconds
      const timer = setTimeout(() => setCallStatus("connected"), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleEndCall = () => {
    setCallStatus("ended")
    setTimeout(onClose, 1000) // Close dialog after 1 second
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isVideoCall ? "Video Call" : "Voice Call"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Caller" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-semibold">John Doe</h2>
          <p className="text-muted-foreground">
            {callStatus === "calling" ? "Calling..." : callStatus === "connected" ? "Connected" : "Call Ended"}
          </p>
          {isVideoCall && callStatus === "connected" && (
            <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
              {isVideoOff ? (
                <VideoOff className="h-12 w-12 text-muted-foreground" />
              ) : (
                <Video className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
          )}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className={isMuted ? "bg-destructive text-destructive-foreground" : ""}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            {isVideoCall && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={isVideoOff ? "bg-destructive text-destructive-foreground" : ""}
              >
                {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </Button>
            )}
            <Button variant="destructive" size="icon" onClick={handleEndCall}>
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

