"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

interface CreateStoryProps {
  onStoryCreated: () => void;
}

export function CreateStory({ onStoryCreated }: CreateStoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('downloadable', String(allowDownload));

      const response = await fetch('/api/stories/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload story');

      toast({
        title: "Success",
        description: "Story uploaded successfully",
      });

      onStoryCreated();
      setIsOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload story",
      });
    } finally {
      setIsUploading(false);
      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <motion.button
        className="flex flex-col items-center space-y-1 relative group text-gray-900"
        onClick={() => setIsOpen(true)}
        aria-label="Add your story"
      >
        <div className="rounded-full p-1 bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500">
          <div className="rounded-full p-0.5 bg-white">
            <Avatar className="w-16 h-16 group-hover:scale-105 transition-transform">
              <AvatarImage src="/placeholder-user.jpg" alt="Create Story" />
              <AvatarFallback>
                <Plus className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <span className="text-xs font-medium text-gray-900">Your Story</span>
      </motion.button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Create New Story</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center gap-4">
              {preview ? (
                <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden bg-black">
                  {selectedFile?.type.startsWith('video/') ? (
                    <video
                      src={preview}
                      className="w-full h-full object-contain"
                      controls
                    />
                  ) : (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-[200px] border-dashed"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-6 w-6 mr-2" />
                  Select Media
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="allow-download" className="text-sm">
                Allow Download
              </Label>
              <Switch
                id="allow-download"
                checked={allowDownload}
                onCheckedChange={setAllowDownload}
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className={cn(
                "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90",
                isUploading && "animate-pulse"
              )}
            >
              {isUploading ? "Uploading..." : "Share Story"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
