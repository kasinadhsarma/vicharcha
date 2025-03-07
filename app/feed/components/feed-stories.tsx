"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileUpload } from "@/components/file-upload";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/components/ui/use-toast";
import { Story } from "@/lib/types";
import { StoryViewer } from "../stories/components/story-viewer";

export function FeedStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories');
      const data = await response.json();
      if (data.success) {
        setStories(data.data.stories);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load stories",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStoryUpload = async (file: File) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please login to create a story",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('settings', JSON.stringify({
      duration: 5000,
      category: 'general'
    }));

    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Story created successfully",
        });
        fetchStories();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error uploading story:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload story",
      });
    }
  };

  return (
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-violet-500/10 rounded-xl blur-xl" />
      <div className="relative bg-card/50 backdrop-blur-sm rounded-xl p-4">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {/* Create Story Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-shrink-0 w-20 h-32 rounded-xl flex flex-col items-center justify-center gap-2 border-dashed"
              >
                <Avatar className="w-12 h-12 border-2">
                  <AvatarImage src={user?.image} />
                  <AvatarFallback>
                    <Plus className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">Create Story</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Story</DialogTitle>
              </DialogHeader>
              <FileUpload
                onFileSelect={handleStoryUpload}
                maxSize={100}
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
                  'video/*': ['.mp4', '.webm']
                }}
              />
            </DialogContent>
          </Dialog>

          {/* Stories List */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            stories.map((story, index) => (
              <Button
                key={story.id}
                variant="ghost"
                className="flex-shrink-0 w-20 h-32 p-0 rounded-xl overflow-hidden relative group"
                onClick={() => setSelectedStoryIndex(index)}
              >
                <img
                  src={story.mediaUrl}
                  alt={story.username}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/60" />
                <Avatar className="absolute top-2 left-2 w-8 h-8 border-2 border-primary">
                  <AvatarImage src={story.userImage} />
                  <AvatarFallback>{story.username[0]}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-2 left-2 right-2 text-xs text-white text-center line-clamp-1">
                  {story.username}
                </span>
                <div className="absolute inset-0 ring-2 ring-primary ring-offset-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            ))
          )}
        </div>

        {/* Story Viewer */}
        {selectedStoryIndex !== null && (
          <StoryViewer
            stories={stories}
            currentIndex={selectedStoryIndex}
            onClose={() => setSelectedStoryIndex(null)}
            onNext={() => {
              if (selectedStoryIndex < stories.length - 1) {
                setSelectedStoryIndex(selectedStoryIndex + 1);
              } else {
                setSelectedStoryIndex(null);
              }
            }}
            onPrevious={() => {
              if (selectedStoryIndex > 0) {
                setSelectedStoryIndex(selectedStoryIndex - 1);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}