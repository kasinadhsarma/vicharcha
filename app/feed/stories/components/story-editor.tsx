"use client";

import { useState, useRef, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { 
  Volume2, 
  VolumeX,
  Sun,
  RotateCw,
  ZoomIn,
  Crop,
  Waves as WaveIcon,
  SlidersHorizontal,
  Sparkles,
  CloudRainWind,
  Music2,
  Waves
} from "lucide-react";
import Image from "next/image";
import { StoryCropper } from "./story-cropper";
import { cn } from "@/lib/utils";

interface StoryEditorProps {
  file: File;
  preview: string;
  onSave: (editedFile: File) => void;
  onCancel: () => void;
  setSelectedFile: (file: File) => void;
  setPreview: (preview: string) => void;
}

interface AudioEnhancement {
  noiseReduction: number;
  clarity: number;
  bass: number;
  treble: number;
  removeBackground: boolean;
  enhanceVoice: boolean;
}

interface VideoElementWithCapture extends HTMLVideoElement {
  captureStream(): MediaStream;
}

export function StoryEditor({ file, preview, onSave, onCancel, setSelectedFile, setPreview }: StoryEditorProps) {
  const [brightness, setBrightness] = useState(100);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isCropping, setIsCropping] = useState(false);
  const [activeTab, setActiveTab] = useState("visual");
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  
  const [audioEnhancement, setAudioEnhancement] = useState<AudioEnhancement>({
    noiseReduction: 0,
    clarity: 50,
    bass: 50,
    treble: 50,
    removeBackground: false,
    enhanceVoice: false
  });
  
  const videoRef = useRef<VideoElementWithCapture>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const setupAudioContext = useCallback(() => {
    if (!videoRef.current) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    if (!sourceNodeRef.current) {
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(videoRef.current);
    }

    if (!gainNodeRef.current) {
      gainNodeRef.current = audioContextRef.current.createGain();
    }

    // Connect nodes
    sourceNodeRef.current
      .connect(gainNodeRef.current)
      .connect(audioContextRef.current.destination);

    // Apply initial volume
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume / 100;
    }
  }, [volume]);

  const handleAudioEnhancementChange = useCallback((key: keyof AudioEnhancement, value: number | boolean) => {
    setAudioEnhancement(prev => ({ ...prev, [key]: value }));
    
    if (videoRef.current && audioContextRef.current) {
      // Here you would apply audio processing based on the new settings
      // This is a simplified example - in a real app you'd use more sophisticated audio processing
      if (gainNodeRef.current) {
        const clarity = audioEnhancement.clarity / 100;
        const bass = audioEnhancement.bass / 100;
        gainNodeRef.current.gain.value = clarity * bass * (volume / 100);
      }
    }
  }, [audioEnhancement, volume]);

  const handleSave = async () => {
    if (!canvasRef.current) return;

    try {
      // Apply edits to canvas
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Apply visual effects
      ctx.filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
        blur(${blur}px)
      `;

      // Apply rotation and zoom
      ctx.translate(canvasRef.current.width/2, canvasRef.current.height/2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom/100, zoom/100);
      ctx.translate(-canvasRef.current.width/2, -canvasRef.current.height/2);

      if (file.type.startsWith('video/')) {
        ctx.drawImage(videoRef.current!, 0, 0);
        
        // Convert edited frame and audio to video
        const stream = canvasRef.current.captureStream();
        if (videoRef.current) {
          const audioStream = videoRef.current.captureStream();
          const audioTrack = audioStream.getAudioTracks()[0];
          if (audioTrack) stream.addTrack(audioTrack);
        }
        
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
        
        canvasRef.current.toBlob((blob: Blob | null) => {
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
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = value / 100;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? volume / 100 : 0;
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
    <div className="space-y-6">
      <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-black">
        <canvas ref={canvasRef} className="hidden" />
        {file.type.startsWith('video/') ? (
          <video
            ref={videoRef}
            src={preview}
            className="w-full h-full object-contain"
            controls
            style={{
              filter: `
                brightness(${brightness}%)
                contrast(${contrast}%)
                saturate(${saturation}%)
                blur(${blur}px)
              `,
              transform: `rotate(${rotation}deg) scale(${zoom/100})`,
            }}
            onLoadedMetadata={setupAudioContext}
          />
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={preview}
              alt="Story preview"
              fill
              className="object-contain"
              style={{
                filter: `
                  brightness(${brightness}%)
                  contrast(${contrast}%)
                  saturate(${saturation}%)
                  blur(${blur}px)
                `,
                transform: `rotate(${rotation}deg) scale(${zoom/100})`,
              }}
            />
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="visual" className="flex-1">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Visual
          </TabsTrigger>
          {file.type.startsWith('video/') && (
            <TabsTrigger value="audio" className="flex-1">
              <WaveIcon className="h-4 w-4 mr-2" />
              Audio
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="visual" className="space-y-4">
          <Card className="p-4 space-y-4">
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
                className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Contrast
              </Label>
              <Slider
                value={[contrast]}
                onValueChange={([value]) => setContrast(value)}
                min={0}
                max={200}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CloudRainWind className="h-4 w-4" /> Saturation
              </Label>
              <Slider
                value={[saturation]}
                onValueChange={([value]) => setSaturation(value)}
                min={0}
                max={200}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Waves className="h-4 w-4" /> Blur
              </Label>
              <Slider
                value={[blur]}
                onValueChange={([value]) => setBlur(value)}
                min={0}
                max={10}
                step={0.1}
              />
            </div>

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
          </Card>
        </TabsContent>

        {file.type.startsWith('video/') && (
          <TabsContent value="audio" className="mt-0 space-y-4">
            <Card className="p-4 space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" /> Volume
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className={cn("h-8 w-8", isMuted && "text-muted-foreground")}
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

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CloudRainWind className="h-4 w-4" /> Noise Reduction
                </Label>
                <Slider
                  value={[audioEnhancement.noiseReduction]}
                  onValueChange={([value]) => handleAudioEnhancementChange('noiseReduction', value)}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Clarity
                </Label>
                <Slider
                  value={[audioEnhancement.clarity]}
                  onValueChange={([value]) => handleAudioEnhancementChange('clarity', value)}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Waves className="h-4 w-4" /> Bass
                </Label>
                <Slider
                  value={[audioEnhancement.bass]}
                  onValueChange={([value]) => handleAudioEnhancementChange('bass', value)}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Music2 className="h-4 w-4" /> Treble
                </Label>
                <Slider
                  value={[audioEnhancement.treble]}
                  onValueChange={([value]) => handleAudioEnhancementChange('treble', value)}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <CloudRainWind className="h-4 w-4" /> Remove Background Noise
                </Label>
                <Switch
                  checked={audioEnhancement.removeBackground}
                  onCheckedChange={(checked) => handleAudioEnhancementChange('removeBackground', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" /> Enhance Voice
                </Label>
                <Switch
                  checked={audioEnhancement.enhanceVoice}
                  onCheckedChange={(checked) => handleAudioEnhancementChange('enhanceVoice', checked)}
                />
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Apply Changes
        </Button>
      </div>
    </div>
  );
}
