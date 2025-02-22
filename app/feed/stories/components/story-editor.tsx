"use client";

import { useState, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Volume2, 
  VolumeX, 
  Sun,
  RotateCw,
  ZoomIn,
  Crop,
} from "lucide-react";
import Image from "next/image";
import { StoryCropper } from "./story-cropper";

interface StoryEditorProps {
  file: File;
  preview: string;
  onSave: (editedFile: File) => void;
  onCancel: () => void;
  setSelectedFile: (file: File) => void;
  setPreview: (preview: string) => void;
}

export function StoryEditor({ file, preview, onSave, onCancel, setSelectedFile, setPreview }: StoryEditorProps) {
  const [brightness, setBrightness] = useState(100);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isCropping, setIsCropping] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSave = async () => {
    if (!canvasRef.current) return;

    try {
      // Apply edits to canvas
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Apply brightness
      ctx.filter = `brightness(${brightness}%)`;

      // Apply rotation and zoom
      ctx.translate(canvasRef.current.width/2, canvasRef.current.height/2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom/100, zoom/100);
      ctx.translate(-canvasRef.current.width/2, -canvasRef.current.height/2);

      // Draw image/video frame
      if (file.type.startsWith('video/')) {
        ctx.drawImage(videoRef.current!, 0, 0);
        
        // Convert edited frame back to video
        const stream = canvasRef.current.captureStream();
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];
        
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: file.type });
          const editedFile = new File([blob], file.name, { type: file.type });
          onSave(editedFile);
        };

        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 100);
      } else {
        const img = new window.Image();
        img.src = preview;
        ctx.drawImage(img, 0, 0);
        
        canvasRef.current.toBlob((blob) => {
          if (!blob) return;
          const editedFile = new File([blob], file.name, { type: file.type });
          onSave(editedFile);
        });
      }
    } catch (error) {
      console.error('Error saving edits:', error);
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value / 100;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleCropped = (croppedFile: File) => {
    setSelectedFile(croppedFile);
    const url = URL.createObjectURL(croppedFile);
    setPreview(url);
    setIsCropping(false);
  };

  if (isCropping) {
    return (
      <StoryCropper
        file={file}
        preview={preview}
        onCrop={handleCropped}
        onCancel={() => setIsCropping(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-black">
        <canvas ref={canvasRef} className="hidden" />
        {file.type.startsWith('video/') ? (
          <video
            ref={videoRef}
            src={preview}
            className="w-full h-full object-contain"
            controls
            style={{
              filter: `brightness(${brightness}%)`,
              transform: `rotate(${rotation}deg) scale(${zoom/100})`,
            }}
          />
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={preview}
              alt="Story preview"
              fill
              className="object-contain"
              style={{
                filter: `brightness(${brightness}%)`,
                transform: `rotate(${rotation}deg) scale(${zoom/100})`,
              }}
            />
          </div>
        )}
      </div>

      <div className="space-y-4 p-4">
        <Button
          variant="outline"
          onClick={() => setIsCropping(true)}
          className="w-full"
        >
          <Crop className="h-4 w-4 mr-2" />
          Crop Media
        </Button>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Sun className="h-4 w-4" /> Brightness
          </Label>
          <Slider
            value={[brightness]}
            onValueChange={([value]) => setBrightness(value)}
            min={0}
            max={200}
            step={1}
          />
        </div>

        {file.type.startsWith('video/') && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" /> Volume
            </Label>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={[volume]}
                onValueChange={([value]) => handleVolumeChange(value)}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <RotateCw className="h-4 w-4" /> Rotation
          </Label>
          <Slider
            value={[rotation]}
            onValueChange={([value]) => setRotation(value)}
            min={0}
            max={360}
            step={90}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <ZoomIn className="h-4 w-4" /> Zoom
          </Label>
          <Slider
            value={[zoom]}
            onValueChange={([value]) => setZoom(value)}
            min={50}
            max={200}
            step={1}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
