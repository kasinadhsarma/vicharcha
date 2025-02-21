"use client"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth/auth-provider"
import { FileUpload } from "@/components/file-upload"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Image as ImageIcon, X, Sparkles, Loader2, Music, Hash } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PostCategories, Post } from "../lib/types"
import { cn } from "../lib/utils"
import Image from "next/image"
import { useSettings } from "@/hooks/use-settings"

const TOKEN_LIMIT = 500;

interface CreatePostProps {
  onPostCreated: (post: Post) => Promise<void>;
  initialCategory?: string;
}

interface Tag {
  id: string;
  name: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt?: string;
}

export function CreatePost({ onPostCreated, initialCategory }: CreatePostProps) {
  const { user } = useAuth()
  const { settings } = useSettings()
  const { toast } = useToast()
  const [content, setContent] = useState("")
  const [category, setCategory] = useState<string>(initialCategory || PostCategories.NEWS)
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([])
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Mock data for demonstration
  const suggestedTags: Tag[] = [
    { id: "1", name: "trending" },
    { id: "2", name: "music" },
    { id: "3", name: "lifestyle" },
    // Add more tags as needed
  ]

  const suggestedSongs: Song[] = [
    { id: "1", title: "Shape of You", artist: "Ed Sheeran", albumArt: "/placeholder-album.jpg" },
    { id: "2", title: "Blinding Lights", artist: "The Weeknd", albumArt: "/placeholder-album.jpg" },
    // Add more songs as needed
  ]

  const handleExpandClick = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please login to create a post",
      });
      return;
    }
    setIsExpanded(true)
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Extract mentions
    const mentionRegex = /@(\w+)/g;
    const mentions = [...newContent.matchAll(mentionRegex)].map(match => match[1]);
    setMentionedUsers(mentions);

    // Extract hashtags
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [...newContent.matchAll(hashtagRegex)].map(match => ({
      id: match[1],
      name: match[1]
    }));
    setTags(hashtags);
  }

  const handleAddTag = (tag: Tag) => {
    if (!tags.find(t => t.id === tag.id)) {
      setTags([...tags, tag]);
      setContent(prev => `${prev} #${tag.name}`);
    }
  }

  const handleRemoveTag = (tagId: string) => {
    setTags(tags.filter(tag => tag.id !== tagId));
    setContent(prev => prev.replace(`#${tags.find(t => t.id === tagId)?.name}`, ''));
  }

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    setContent(prev => `${prev}\n🎵 Listening to: ${song.title} by ${song.artist}`);
  }

  const handleFileSelect = (file: File) => {
    if (mediaUrls.length >= 5) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Maximum 5 files allowed",
      });
      return;
    }
    // Create a temporary URL for the uploaded file
    const url = URL.createObjectURL(file)
    setMediaUrls([...mediaUrls, url])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please login to create a post",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Post content cannot be empty",
      });
      return;
    }

    if (content.length > TOKEN_LIMIT) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Content exceeds ${TOKEN_LIMIT} token limit`,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          category,
          mediaUrls,
          userId: user.phoneNumber,
          username: user.name || "User",
          userImage: user.image || "/placeholder-user.jpg",
          tokens: content.length,
          tags: tags.map(tag => tag.name),
          mentionedUsers,
          song: selectedSong,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create post')
      }

      toast({
        title: "Success",
        description: "Post created successfully",
      });

      // Reset form
      setContent("")
      setCategory(PostCategories.GENERAL)
      setMediaUrls([])
      setTags([])
      setMentionedUsers([])
      setSelectedSong(null)
      setIsExpanded(false)
      const newPost = await response.json()
      await onPostCreated(newPost)
    } catch (error) {
      console.error('Error creating post:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create post",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const remainingTokens = TOKEN_LIMIT - content.length;
  const isOverLimit = remainingTokens < 0;

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-violet-500/10 rounded-xl blur-xl" />
      <Card className="relative border bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex items-center justify-between">
          <div className="flex gap-4">
            <Avatar className="w-10 h-10 border-2 border-background">
              <AvatarImage src={`/placeholder.svg?text=${user?.name?.[0] || "U"}`} alt={user?.name} />
              <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">Create Post</h3>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-4">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={handleContentChange}
                  onClick={handleExpandClick}
                  className={cn(
                    "min-h-[60px] bg-background/50 resize-none border-none focus-visible:ring-1",
                    isOverLimit && "border-red-500 focus-visible:ring-red-500"
                  )}
                  disabled={isLoading}
                />
                <span className={cn(
                  "absolute bottom-2 right-2 text-xs",
                  isOverLimit ? "text-red-500" : "text-muted-foreground"
                )}>
                  {remainingTokens} tokens remaining
                </span>
              </div>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-4 mb-4">
                      <Select 
                        value={category} 
                        onValueChange={(value: string) => setCategory(value)} 
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={PostCategories.GENERAL}>General</SelectItem>
                          <SelectItem value={PostCategories.NEWS}>News</SelectItem>
                          <SelectItem value={PostCategories.ENTERTAINMENT}>Entertainment</SelectItem>
                          <SelectItem value={PostCategories.SPORTS}>Sports</SelectItem>
                          <SelectItem value={PostCategories.TECHNOLOGY}>Technology</SelectItem>
                          <SelectItem value={PostCategories.POLITICS}>Politics</SelectItem>
                          {settings?.privacy?.adultContent && (
                            <SelectItem value={PostCategories.ADULT}>Adult Content (18+)</SelectItem>
                          )}
                        </SelectContent>
                      </Select>

                      {/* Tags Section */}
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge 
                            key={tag.id}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Hash className="h-3 w-3" />
                            {tag.name}
                            <button
                              onClick={() => handleRemoveTag(tag.id)}
                              className="ml-1 hover:text-destructive"
                              disabled={isLoading}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      {/* Song Selection */}
                      {selectedSong && (
                        <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                          <Music className="h-4 w-4" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{selectedSong.title}</p>
                            <p className="text-xs text-muted-foreground">{selectedSong.artist}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setSelectedSong(null)}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {/* Media Preview */}
                      {mediaUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {mediaUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <Image
                                src={url}
                                alt="Media preview"
                                width={80}
                                height={80}
                                className="object-cover rounded-lg"
                              />
                              <button
                                onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== index))}
                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={isLoading}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-4 pb-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-2">
              {/* Media Upload */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-full"
                    disabled={isLoading || mediaUrls.length >= 5}
                  >
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Media (Max 5 files)</DialogTitle>
                  </DialogHeader>
                  <FileUpload 
                    onFileSelect={handleFileSelect}
                    maxSize={100}
                    accept={{
                      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
                      'video/*': ['.mp4', '.webm']
                    }}
                  />
                </DialogContent>
              </Dialog>

              {/* Tag Selector */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    disabled={isLoading}
                  >
                    <Hash className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0">
                  <Command>
                    <CommandInput placeholder="Search tags..." />
                    <CommandEmpty>No tags found.</CommandEmpty>
                    <CommandGroup>
                      {suggestedTags.map((tag) => (
                        <CommandItem
                          key={tag.id}
                          onSelect={() => handleAddTag(tag)}
                        >
                          <Hash className="h-4 w-4 mr-2" />
                          {tag.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Song Selector */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9rounded-full"
                    disabled={isLoading}
                  >
                    <Music className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search songs..." 
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <CommandEmpty>No songs found.</CommandEmpty>
                    <CommandGroup>
                      {suggestedSongs
                        .filter(song => 
                          song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          song.artist.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((song) => (
                          <CommandItem
                            key={song.id}
                            onSelect={() => handleSelectSong(song)}
                            className="flex items-center gap-2"
                          >
                            {song.albumArt && (
                              <Image 
                                src={song.albumArt || ""} 
                                alt={`Album art for ${song.title}`}
                                width={32}
                                height={32}
                                className="rounded object-cover"
                              />
                            )}
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{song.title}</span>
                              <span className="text-xs text-muted-foreground">{song.artist}</span>
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsExpanded(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 text-white hover:opacity-90"
                disabled={!content.trim() || isOverLimit || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isLoading ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
