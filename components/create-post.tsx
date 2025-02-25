"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Image as ImageIcon, X, Send, Music, Hash } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const TOKEN_LIMIT = 280 // Twitter-like limit

export function CreatePost() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [content, setContent] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleExpandClick = () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Sign in required",
        description: "Please sign in to create a post"
      })
      return
    }
    setIsExpanded(true)
    setTimeout(() => textareaRef.current?.focus(), 200)
  }

  const handleSubmit = async () => {
    // Add your submit logic here
    setContent("")
    setMediaUrls([])
    setIsExpanded(false)
    toast({
      title: "Success",
      description: "Your post has been created"
    })
  }

  const containerVariants = {
    collapsed: { height: 64 },
    expanded: { height: "auto" }
  }

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  }

  const mediaVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  return (
    <motion.div
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={containerVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative w-full max-w-3xl mx-auto"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-violet-500/10 rounded-xl blur-xl" />
      <Card className="relative overflow-hidden border bg-card/50 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 border-2 border-background">
              <AvatarImage src={user?.image} />
              <AvatarFallback>{user?.name?.[0] || "?"}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <Textarea
                ref={textareaRef}
                placeholder="What's happening?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onClick={handleExpandClick}
                className={cn(
                  "min-h-[40px] resize-none bg-background/50 border-none focus-visible:ring-0",
                  isExpanded ? "min-h-[120px]" : "min-h-[40px]"
                )}
              />

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Media Preview */}
                    {mediaUrls.length > 0 && (
                      <motion.div 
                        className="grid grid-cols-2 gap-2 mt-2"
                        variants={mediaVariants}
                      >
                        {mediaUrls.map((url, index) => (
                          <motion.div
                            key={url}
                            className="relative rounded-lg overflow-hidden aspect-video"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <img 
                              src={url} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                            <Button
                              size="icon"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => setMediaUrls(urls => urls.filter((_, i) => i !== index))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex gap-2">
                        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                          <Dialog>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full"
                              disabled={mediaUrls.length >= 4}
                              onClick={() => {
                                // Open the file input programmatically
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*,video/*';
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) {
                                    const url = URL.createObjectURL(file);
                                    setMediaUrls(prev => [...prev, url]);
                                  }
                                };
                                input.click();
                              }}
                            >
                              <ImageIcon className="h-5 w-5" />
                            </Button>
                          </Dialog>
                        </motion.div>

                        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <Hash className="h-5 w-5" />
                          </Button>
                        </motion.div>

                        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                          >
                            <Music className="h-5 w-5" />
                          </Button>
                        </motion.div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={cn(
                          "text-sm",
                          content.length > TOKEN_LIMIT ? "text-red-500" : "text-muted-foreground"
                        )}>
                          {content.length}/{TOKEN_LIMIT}
                        </span>
                        
                        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                          <Button
                            onClick={handleSubmit}
                            disabled={!content.trim() || content.length > TOKEN_LIMIT}
                            className="bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 text-white hover:opacity-90"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Post
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
