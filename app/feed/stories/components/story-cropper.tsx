"use client";

import { useEffect, useRef, useState } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Button } from "@/components/ui/button";
import { RotateCw, ZoomIn, ZoomOut } from "lucide-react";

interface StoryCropperProps {
  file: File;
  preview: string;
  aspectRatio?: number;
  onCrop: (file: File) => void;
  onCancel: () => void;
}

export function StoryCropper({ file, preview, aspectRatio = 9/16, onCrop, onCancel }: StoryCropperProps) {
  const cropperRef = useRef<ReactCropperElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideo] = useState(file.type.startsWith('video/'));

  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, [isVideo]);

  const handleCrop = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    try {
      if (isVideo) {
        // For videos, we need to crop each frame
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Get crop box dimensions
        const { x, y, width, height } = cropper.getData();
        canvas.width = width;
        canvas.height = height;

        // Create a temporary video element for processing
        const tempVideo = document.createElement('video');
        tempVideo.src = preview;
        
        await new Promise((resolve) => {
          tempVideo.onloadeddata = resolve;
          tempVideo.load();
        });

        // Process video frames
        const stream = canvas.captureStream();
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: file.type,
          videoBitsPerSecond: 2500000 // 2.5 Mbps
        });

        const chunks: BlobPart[] = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: file.type });
          const croppedFile = new File([blob], file.name, { type: file.type });
          onCrop(croppedFile);
        };

        mediaRecorder.start();

        // Process each frame
        let currentFrame = 0;
        const totalFrames = tempVideo.duration * 30; // Assuming 30fps

        const processFrame = () => {
          if (currentFrame >= totalFrames) {
            mediaRecorder.stop();
            return;
          }

          tempVideo.currentTime = currentFrame / 30;
          ctx.drawImage(tempVideo, -x, -y, tempVideo.videoWidth, tempVideo.videoHeight);
          currentFrame++;
          requestAnimationFrame(processFrame);
        };

        processFrame();
      } else {
        // For images, we can use the built-in cropper functionality
        const croppedCanvas = cropper.getCroppedCanvas();
        croppedCanvas.toBlob((blob) => {
          if (!blob) return;
          const croppedFile = new File([blob], file.name, { type: file.type });
          onCrop(croppedFile);
        });
      }
    } catch (error) {
      console.error('Cropping error:', error);
    }
  };

  const rotate = () => {
    cropperRef.current?.cropper.rotate(90);
  };

  const zoomIn = () => {
    cropperRef.current?.cropper.zoom(0.1);
  };

  const zoomOut = () => {
    cropperRef.current?.cropper.zoom(-0.1);
  };

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
            />
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
          />
        )}
      </div>

      <div className="flex items-center justify-center gap-2">
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
        <Button
          variant="outline"
          size="icon"
          onClick={zoomOut}
          className="rounded-full"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleCrop}>
          Apply Crop
        </Button>
      </div>
    </div>
  );
}
