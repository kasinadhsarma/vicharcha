"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Image as ImageIcon, FileText, Music, Video } from "lucide-react"
import Image from "next/image"
import type { Message } from "@/lib/types"
import { format } from "date-fns"

interface MediaGalleryProps {
  isOpen: boolean
  onClose: () => void
  messages?: Message[]
  chatName?: string
}

// Media type definitions
export type ImageExtension = 'jpg' | 'jpeg' | 'png' | 'gif' | 'webp'
export type VideoExtension = 'mp4' | 'webm' | 'ogg'
export type AudioExtension = 'mp3' | 'wav' | 'ogg'
export type DocumentExtension = 'pdf' | 'doc' | 'docx' | 'txt' | 'xls' | 'xlsx'

export const MediaTypes = {
  IMAGE: new Set<ImageExtension>(['jpg', 'jpeg', 'png', 'gif', 'webp']),
  VIDEO: new Set<VideoExtension>(['mp4', 'webm', 'ogg']),
  AUDIO: new Set<AudioExtension>(['mp3', 'wav', 'ogg']),
  DOCUMENT: new Set<DocumentExtension>(['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'])
} as const

export type MediaType = 'image' | 'video' | 'audio' | 'document'

interface MediaItemInfo {
  url: string
  type: MediaType
  date: Date
  message: Message
}

function getMediaType(url: string): MediaType {
  const extension = url.split('.').pop()?.toLowerCase() || ''
  
  if (MediaTypes.IMAGE.has(extension as ImageExtension)) return 'image'
  if (MediaTypes.VIDEO.has(extension as VideoExtension)) return 'video'
  if (MediaTypes.AUDIO.has(extension as AudioExtension)) return 'audio'
  return 'document'
}

export function MediaGallery({ isOpen, onClose, messages = [], chatName }: MediaGalleryProps) {
  // Process messages to extract media items
  const mediaItems: MediaItemInfo[] = messages
    .filter(msg => msg.mediaUrls && msg.mediaUrls.length > 0)
    .flatMap(msg => 
      msg.mediaUrls!.map(url => ({
        url,
        type: getMediaType(url),
        date: msg.createdAt,
        message: msg
      }))
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  const stats = {
    images: mediaItems.filter(item => item.type === 'image').length,
    videos: mediaItems.filter(item => item.type === 'video').length,
    documents: mediaItems.filter(item => item.type === 'document').length,
    audio: mediaItems.filter(item => item.type === 'audio').length,
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>{chatName ? `${chatName} - Media & Files` : 'Media & Files'}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              All
              <span className="ml-2 text-xs text-muted-foreground">
                {mediaItems.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="images">
              Images
              <span className="ml-2 text-xs text-muted-foreground">
                {stats.images}
              </span>
            </TabsTrigger>
            <TabsTrigger value="videos">
              Videos
              <span className="ml-2 text-xs text-muted-foreground">
                {stats.videos}
              </span>
            </TabsTrigger>
            <TabsTrigger value="documents">
              Docs
              <span className="ml-2 text-xs text-muted-foreground">
                {stats.documents}
              </span>
            </TabsTrigger>
            <TabsTrigger value="audio">
              Audio
              <span className="ml-2 text-xs text-muted-foreground">
                {stats.audio}
              </span>
            </TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[400px] mt-4">
            <TabsContent value="all" className="grid grid-cols-3 gap-4">
              {mediaItems.map((item, index) => (
                <MediaItem key={`${item.url}-${index}`} item={item} />
              ))}
            </TabsContent>
            <TabsContent value="images" className="grid grid-cols-3 gap-4">
              {mediaItems
                .filter(item => item.type === 'image')
                .map((item, index) => (
                  <MediaItem key={`${item.url}-${index}`} item={item} />
                ))}
            </TabsContent>
            <TabsContent value="videos" className="grid grid-cols-3 gap-4">
              {mediaItems
                .filter(item => item.type === 'video')
                .map((item, index) => (
                  <MediaItem key={`${item.url}-${index}`} item={item} />
                ))}
            </TabsContent>
            <TabsContent value="documents" className="grid grid-cols-3 gap-4">
              {mediaItems
                .filter(item => item.type === 'document')
                .map((item, index) => (
                  <MediaItem key={`${item.url}-${index}`} item={item} />
                ))}
            </TabsContent>
            <TabsContent value="audio" className="grid grid-cols-3 gap-4">
              {mediaItems
                .filter(item => item.type === 'audio')
                .map((item, index) => (
                  <MediaItem key={`${item.url}-${index}`} item={item} />
                ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

interface MediaItemProps {
  item: MediaItemInfo
}

function MediaItem({ item }: MediaItemProps) {
  const date = format(item.date, "MMM d, yyyy")

  switch (item.type) {
    case "image":
      return (
        <button className="group relative aspect-square" onClick={() => window.open(item.url, '_blank')}>
          <Image 
            src={item.url} 
            alt={item.message.content || 'Image'} 
            className="object-cover rounded-md transition-transform group-hover:scale-105" 
            fill
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
            <span className="text-xs text-white">{date}</span>
          </div>
        </button>
      )
    case "video":
      return (
        <button 
          className="group relative aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden"
          onClick={() => window.open(item.url, '_blank')}
        >
          <Video className="h-8 w-8 transition-transform group-hover:scale-125" strokeWidth={1.5} />
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
            <span className="text-xs text-white">{date}</span>
          </div>
        </button>
      )
    case "document":
      return (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer" 
          className="aspect-square bg-muted rounded-md flex flex-col items-center justify-center p-4 hover:bg-muted/80 transition-colors"
        >
          <FileText className="h-8 w-8 mb-2" strokeWidth={1.5} />
          <span className="text-xs text-muted-foreground text-center break-all mb-1">
            {item.url.split('/').pop()}
          </span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </a>
      )
    case "audio":
      return (
        <div className="aspect-square bg-muted rounded-md flex flex-col items-center justify-center p-4">
          <Music className="h-8 w-8 mb-2" strokeWidth={1.5} />
          <audio src={item.url} controls className="w-full mt-2" />
          <span className="text-xs text-muted-foreground mt-2">{date}</span>
        </div>
      )
    default:
      return null
  }
}
