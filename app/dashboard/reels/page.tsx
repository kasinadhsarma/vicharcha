"use client"

import { useState } from "react"
import { FileUpload } from "./components/file-upload"
import { SidebarReels } from "./components/sidebar-reels"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Film, Plus } from "lucide-react"
import { motion } from "framer-motion"

export default function ReelsPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const onFileSelect = (file: File) => {
    // Here we would typically handle the file upload to our backend
    console.log('Selected file:', file)
    // Close the dialog after successful upload
    setIsUploadOpen(false)
  }

  return (
    <div className="flex-1 w-full">
      <div className="w-full mx-auto pt-4 md:pt-6">
        <div className="w-full mx-auto px-2 md:px-6 max-w-3xl">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">
              <Film className="h-6 w-6" />
              <h1 className="text-xl md:text-2xl font-bold">Reels</h1>
            </div>
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 text-white hover:opacity-90">
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:inline">Create Reel</span>
                  <span className="md:hidden">New</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Create New Reel</DialogTitle>
                </DialogHeader>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FileUpload 
                    onFileSelect={onFileSelect} 
                    maxSize={100} 
                    allowedTypes={{ video: true }}
                  />
                </motion.div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative mt-4">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-violet-500/10 rounded-lg blur-xl" />
            <div className="relative bg-background/80 backdrop-blur-sm rounded-lg p-3 md:p-4">
              <SidebarReels />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
