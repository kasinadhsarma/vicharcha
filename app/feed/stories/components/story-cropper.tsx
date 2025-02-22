"use client";

import { useState, useRef, useCallback } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Volume2,
  Mic,
  Settings,
  SlidersHorizontal,
  Eye,
  Video,
  Sparkles
} from "lucide-react";
import { useStory } from "../context/story-context";
import { ProcessingSettings, uploadStoryMedia, processStoryAudio } from "@/lib/api/stories";
import { useToast } from "@/components/ui/use-toast";

interface StoryCropperProps {
  file: File;
  preview: string;
  aspectRatio?: number;
  onCrop: (file: File) => void;
  onCancel: () => void;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function StoryCropper({ file, preview, aspectRatio = 9/16, onCrop, onCancel }: StoryCropperProps) {
  const cropperRef = useRef<ReactCropperElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const { uploadProgress, setUploadProgress } = useStory();
  
  const [isVideo] = useState(file.type.startsWith('video/'));
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeTab, setActiveTab] = useState("crop");

  const [settings, setSettings] = useState<ProcessingSettings>({
    quality: 80,
    frameRate: 30,
    denoise: false,
    enhanceAudio: false,
    removeBgNoise: false,
    audioBitrate: 128,
  });

  const handleCrop = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    try {
      setIsProcessing(true);

      // Get cropped canvas
      const croppedCanvas = cropper.getCroppedCanvas({
        imageSmoothingQuality: 'high',
        imageSmoothingEnabled: true,
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        croppedCanvas.toBlob(
          (blob) => resolve(blob!),
          file.type,
          settings.quality / 100
        );
      });

      // Create new file from blob
      const croppedFile = new File([blob], file.name, { type: file.type });

      // Upload the file
      const uploadResult = await uploadStoryMedia(croppedFile, settings);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      // If video and audio processing is needed
      if (isVideo && (settings.enhanceAudio || settings.removeBgNoise)) {
        const storyId = uploadResult.story?.id;
        if (!storyId) throw new Error('Invalid story ID');

        const processResult = await processStoryAudio(storyId, settings);
        if (!processResult.success) {
          throw new Error(processResult.error || 'Audio processing failed');
        }
      }

      toast({
        title: "Success",
        description: "Story edited successfully",
      });

      onCrop(croppedFile);

    } catch (error) {
      console.error('Error during crop/upload:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process media",
      });
    } finally {
      setIsProcessing(false);
      setUploadProgress({
        isUploading: false,
        progress: 0,
        currentStep: "",
      });
    }
  };

  const rotate = () => cropperRef.current?.cropper.rotate(90);
  const zoomIn = () => cropperRef.current?.cropper.zoom(0.1);
  const zoomOut = () => cropperRef.current?.cropper.zoom(-0.1);
  const fitScreen = () => cropperRef.current?.cropper.zoomTo(1);
  const fillScreen = () => {
    const container = cropperRef.current?.cropper.getContainerData();
    const canvas = cropperRef.current?.cropper.getCanvasData();
    if (!container || !canvas) return;
    const scale = Math.max(
      container.width / canvas.width,
      container.height / canvas.height
    );
    cropperRef.current?.cropper.zoomTo(scale);
  };

  // Initialize video playback tracking
  const handleVideoLoad = useCallback(() => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    videoRef.current.ontimeupdate = () => {
      setCurrentTime(videoRef.current?.currentTime || 0);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
        {isVideo ? (
          <>
            <video
              ref={videoRef}
              src={preview}
              className="max-h-full w-full"
              controls
              onLoadedMetadata={handleVideoLoad}
            />
            <Cropper
              ref={cropperRef}
              src={preview}
              style={{ height: "100%", width: "100%" }}
              aspectRatio={aspectRatio}
              guides={true}
              viewMode={1}
              dragMode="move"
              className="absolute inset-0"
              autoCropArea={1}
              responsive={true}
              restore={true}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
              <div className="space-y-2">
                <Progress value={(currentTime / duration) * 100} className="h-1" />
                <div className="flex justify-between text-white text-xs">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <Cropper
            ref={cropperRef}
            src={preview}
            style={{ height: "100%", width: "100%" }}
            aspectRatio={aspectRatio}
            guides={true}
            viewMode={1}
            dragMode="move"
            autoCropArea={1}
            responsive={true}
            restore={true}
          />
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="crop" className="flex-1">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Crop & Transform
          </TabsTrigger>
          {isVideo && (
            <TabsTrigger value="audio" className="flex-1">
              <Mic className="h-4 w-4 mr-2" />
              Audio
            </TabsTrigger>
          )}
          <TabsTrigger value="settings" className="flex-1">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

      <TabsContent value="crop" className="mt-0">
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={zoomOut}
                className="rounded-full"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={rotate}
                className="rounded-full"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={zoomIn}
                className="rounded-full"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={fitScreen}
                className="rounded-full"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={fillScreen}
                className="rounded-full"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </TabsContent>

      {isVideo && (
        <TabsContent value="audio" className="mt-0">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Audio Enhancement
              </Label>
              <div className="flex items-center justify-between">
                <Label>Remove Background Noise</Label>
                <Switch
                  checked={settings.removeBgNoise}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, removeBgNoise: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Enhance Voice</Label>
                <Switch
                  checked={settings.enhanceAudio}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enhanceAudio: checked })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Audio Bitrate
              </Label>
              <Slider
                value={[settings.audioBitrate]}
                onValueChange={([value]) =>
                  setSettings({ ...settings, audioBitrate: value })
                }
                min={64}
                max={320}
                step={32}
              />
              <div className="text-xs text-muted-foreground text-right">
                {settings.audioBitrate} kbps
              </div>
            </div>
          </Card>
        </TabsContent>
      )}

      <TabsContent value="settings" className="mt-0">
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Quality
            </Label>
            <Slider
              value={[settings.quality]}
              onValueChange={([value]) =>
                setSettings({ ...settings, quality: value })
              }
              min={1}
              max={100}
              step={1}
            />
            <div className="text-xs text-muted-foreground text-right">
              {settings.quality}%
            </div>
          </div>
          {isVideo && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Frame Rate
              </Label>
              <Slider
                value={[settings.frameRate]}
                onValueChange={([value]) =>
                  setSettings({ ...settings, frameRate: value })
                }
                min={24}
                max={60}
                step={1}
              />
              <div className="text-xs text-muted-foreground text-right">
                {settings.frameRate} fps
              </div>
            </div>
          )}
        </Card>
      </TabsContent>
      </Tabs>

      {(isProcessing || uploadProgress.isUploading) && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{uploadProgress.currentStep || "Processing..."}</span>
              <span>{Math.round(uploadProgress.progress)}%</span>
            </div>
            <Progress value={uploadProgress.progress} />
          </div>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          disabled={isProcessing || uploadProgress.isUploading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleCrop} 
          disabled={isProcessing || uploadProgress.isUploading}
        >
          {isProcessing || uploadProgress.isUploading ? "Processing..." : "Apply Changes"}
        </Button>
      </div>
    </div>
  );
}
