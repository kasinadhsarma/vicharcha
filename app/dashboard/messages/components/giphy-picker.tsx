"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"

const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY

interface GiphyPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (gif: { url: string; title: string }) => void
}

export function GiphyPicker({ isOpen, onClose, onSelect }: GiphyPickerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [gifs, setGifs] = useState<any[]>([])
  const [stickers, setStickers] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchTrending()
    }
  }, [isOpen])

  const fetchTrending = async () => {
    try {
      const [gifsResponse, stickersResponse] = await Promise.all([
        fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20`),
        fetch(`https://api.giphy.com/v1/stickers/trending?api_key=${GIPHY_API_KEY}&limit=20`),
      ])
      const gifsData = await gifsResponse.json()
      const stickersData = await stickersResponse.json()
      setGifs(gifsData.data)
      setStickers(stickersData.data)
    } catch (error) {
      console.error("Error fetching trending GIFs and stickers:", error)
    }
  }

  const handleSearch = async () => {
    try {
      const [gifsResponse, stickersResponse] = await Promise.all([
        fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${searchTerm}&limit=20`),
        fetch(`https://api.giphy.com/v1/stickers/search?api_key=${GIPHY_API_KEY}&q=${searchTerm}&limit=20`),
      ])
      const gifsData = await gifsResponse.json()
      const stickersData = await stickersResponse.json()
      setGifs(gifsData.data)
      setStickers(stickersData.data)
    } catch (error) {
      console.error("Error searching GIFs and stickers:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select a GIF or Sticker</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search GIFs and stickers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Tabs defaultValue="gifs">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gifs">GIFs</TabsTrigger>
            <TabsTrigger value="stickers">Stickers</TabsTrigger>
          </TabsList>
          <TabsContent value="gifs">
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-2 gap-2">
                {gifs.map((gif) => (
                  <img
                    key={gif.id}
                    src={gif.images.fixed_height.url || "/placeholder.svg"}
                    alt={gif.title}
                    className="w-full h-auto object-cover cursor-pointer rounded-md"
                    onClick={() => onSelect({ url: gif.images.original.url, title: gif.title })}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="stickers">
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-2 gap-2">
                {stickers.map((sticker) => (
                  <img
                    key={sticker.id}
                    src={sticker.images.fixed_height.url || "/placeholder.svg"}
                    alt={sticker.title}
                    className="w-full h-auto object-cover cursor-pointer rounded-md"
                    onClick={() => onSelect({ url: sticker.images.original.url, title: sticker.title })}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

