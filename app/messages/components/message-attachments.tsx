"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Gift, File, Image, Paperclip, Sticker, Mic } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

interface MessageAttachmentsProps {
  onFileSelect: (file: File) => void;
}

export function MessageAttachments({ onFileSelect }: MessageAttachmentsProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }

  const attachmentOptions = [
    { icon: File, label: "Document", accept: ".pdf,.doc,.docx,.txt" },
    { icon: Image, label: "Photos & Videos", accept: "image/*,video/*" },
    { icon: Gift, label: "Camera", accept: "image/*,video/*" },
  ]

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const audioUrl = URL.createObjectURL(audioBlob)
        console.log("Audio recorded:", audioUrl)
        // Here you would typically send this audio file to your server
        toast.success("Audio message recorded!")
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      toast.info("Recording started...")
    } catch (error) {
      console.error("Error accessing microphone:", error)
      toast.error("Unable to access microphone")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      audioChunksRef.current = []
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-80">
          <Tabs defaultValue="attachments">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
              <TabsTrigger value="gifs">GIFs</TabsTrigger>
              <TabsTrigger value="stickers">Stickers</TabsTrigger>
            </TabsList>
            <TabsContent value="attachments">
              <div className="grid gap-2">
                {attachmentOptions.map((option) => (
                  <Button
                    key={option.label}
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => document.getElementById(`file-upload-${option.label}`)?.click()}
                  >
                    <option.icon className="h-4 w-4" />
                    {option.label}
                    <input
                      id={`file-upload-${option.label}`}
                      type="file"
                      accept={option.accept}
                      className="hidden"
                      onChange={handleFileChange}
                      aria-label={`Upload ${option.label}`}
                      title={`Upload ${option.label}`}
                    />
                  </Button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="gifs">
              <ScrollArea className="h-[300px]">
                <div className="grid grid-cols-2 gap-2 p-2">
                  {/* Replace with actual GIF data */}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <Gift className="h-8 w-8 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="stickers">
              <ScrollArea className="h-[300px]">
                <div className="grid grid-cols-3 gap-2 p-2">
                  {/* Replace with actual sticker data */}
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <Sticker className="h-8 w-8 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-full ${isRecording ? "bg-red-500 text-white" : ""}`}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseLeave={stopRecording}
      >
        <Mic className="h-5 w-5" />
      </Button>
    </div>
  )
}
