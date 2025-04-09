"use client"

import { useState } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  maxSize?: number // in MB
  allowedTypes?: {
    video?: boolean
    image?: boolean
  }
}

export function FileUpload({ onFileSelect, maxSize = 100, allowedTypes = { video: true } }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) validateAndSetFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndSetFile(file)
  }

  const validateAndSetFile = (file: File) => {
    // Check file size
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      alert(`File size should not exceed ${maxSize}MB`)
      return
    }

    // Check file type
    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')
    
    if (allowedTypes.video && !isVideo && !allowedTypes.image) {
      alert('Please upload a video file')
      return
    }
    if (allowedTypes.image && !isImage && !allowedTypes.video) {
      alert('Please upload an image file')
      return
    }

    setSelectedFile(file)
    onFileSelect(file)
  }

  const handleRemove = () => {
    setSelectedFile(null)
  }

  return (
    <div
      className={`relative w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center ${
        dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {selectedFile ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm font-medium">{selectedFile.name}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <Input
            type="file"
            accept={allowedTypes.video ? "video/*" : "image/*"}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
            <p className="text-xs text-muted-foreground">
              Supports: {allowedTypes.video ? 'MP4, WebM' : 'JPG, PNG, GIF'} (max {maxSize}MB)
            </p>
          </div>
        </>
      )}
    </div>
  )
}