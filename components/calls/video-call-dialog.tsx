"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Video, Mic, MicOff, VideoOff, Phone } from "lucide-react"

interface VideoCallDialogProps {
  isOpen: boolean
  onClose: () => void
  callerName: string
  callerImage?: string
  callId: string
  userId: string
  onCallStatusChange?: (status: string) => void
}

export function VideoCallDialog({ 
  isOpen, 
  onClose, 
  callerName, 
  callerImage, 
  callId, 
  userId,
  onCallStatusChange 
}: VideoCallDialogProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const localVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (isOpen) {
      startLocalStream()
    } else {
      stopLocalStream()
    }
  }, [isOpen])

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Error accessing media devices:", error)
    }
  }

  const stopLocalStream = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled
      })
      setIsVideoEnabled(!isVideoEnabled)
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled
      })
      setIsAudioEnabled(!isAudioEnabled)
    }
  }

  const handleEndCall = async () => {
    try {
      await fetch("/api/calls", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          callId,
          status: "ended",
        }),
      })
      onCallStatusChange?.("ended")
    } catch (error) {
      console.error("Error ending call:", error)
    } finally {
      stopLocalStream()
      onClose()
    }
  }

  useEffect(() => {
    const updateCallStatus = async () => {
      if (!isOpen) return
      try {
        await fetch("/api/calls", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            callId,
            status: "ongoing",
          }),
        })
        onCallStatusChange?.("ongoing")
      } catch (error) {
        console.error("Error updating call status:", error)
      }
    }

    if (localStream) {
      updateCallStatus()
    }
  }, [localStream, isOpen, callId])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-center">Video Call</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {/* Local video */}
          <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4">
              <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">You</span>
            </div>
          </div>

          {/* Remote participant */}
          <div className="relative rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={callerImage} />
              <AvatarFallback>{callerName[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-4 left-4">
              <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">{callerName}</span>
            </div>
          </div>
        </div>

        {/* Call controls */}
        <div className="flex justify-center space-x-4 mt-4">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleVideo}
          >
            {isVideoEnabled ? (
              <Video className="h-6 w-6" />
            ) : (
              <VideoOff className="h-6 w-6" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleAudio}
          >
            {isAudioEnabled ? (
              <Mic className="h-6 w-6" />
            ) : (
              <MicOff className="h-6 w-6" />
            )}
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={handleEndCall}
          >
            <Phone className="h-6 w-6 rotate-[135deg]" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
