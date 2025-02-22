import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { readdir } from "fs/promises";

const execAsync = promisify(exec);
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "stories");
const PROCESSED_DIR = path.join(process.cwd(), "uploads", "processed");

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storyId, settings } = body;

    if (!storyId) {
      return NextResponse.json({ success: false, error: "Story ID required" }, { status: 400 });
    }

    // Locate the video file
    const files = await readdir(UPLOAD_DIR);
    const storyFile = files.find(file => file.startsWith(storyId));

    if (!storyFile) {
      return NextResponse.json({ success: false, error: "Story file not found" }, { status: 404 });
    }

    const inputPath = path.join(UPLOAD_DIR, storyFile);
    const outputPath = path.join(PROCESSED_DIR, `processed_${storyFile}`);

    // Ensure processed directory exists
    await import("fs/promises").then(fs => fs.mkdir(PROCESSED_DIR, { recursive: true }));

    // Extract audio from video
    const tempAudioPath = path.join(PROCESSED_DIR, `temp_${storyId}.wav`);
    await execAsync(`ffmpeg -i "${inputPath}" -vn -acodec pcm_s16le -ar 44100 -ac 2 "${tempAudioPath}"`);

    // Apply audio processing based on settings
    if (settings.removeBgNoise) {
      // Use sox for noise reduction
      // First, get noise profile
      const noiseProfilePath = path.join(PROCESSED_DIR, `noise_${storyId}.prof`);
      await execAsync(`sox "${tempAudioPath}" -n trim 0 0.5 noiseprof "${noiseProfilePath}"`);
      
      // Then apply noise reduction
      const denoisedPath = path.join(PROCESSED_DIR, `denoised_${storyId}.wav`);
      await execAsync(`sox "${tempAudioPath}" "${denoisedPath}" noisered "${noiseProfilePath}" 0.21`);
      
      // Update temp path for next operation
      await execAsync(`mv "${denoisedPath}" "${tempAudioPath}"`);
    }

    if (settings.enhanceVoice) {
      // Enhance voice frequencies (human voice typically between 85-255 Hz)
      const enhancedPath = path.join(PROCESSED_DIR, `enhanced_${storyId}.wav`);
      await execAsync(
        `sox "${tempAudioPath}" "${enhancedPath}" \
         equalizer 100 100h 3 \
         equalizer 2000 2.5k 3 \
         compand 0.3,1 6:-70,-60,-20 -5 -90 0.2`
      );
      
      await execAsync(`mv "${enhancedPath}" "${tempAudioPath}"`);
    }

    if (settings.audioBitrate) {
      // Apply bitrate settings
      const bitrateKbps = settings.audioBitrate;
      const bitratedPath = path.join(PROCESSED_DIR, `bitrated_${storyId}.wav`);
      await execAsync(`ffmpeg -i "${tempAudioPath}" -b:a ${bitrateKbps}k "${bitratedPath}"`);
      await execAsync(`mv "${bitratedPath}" "${tempAudioPath}"`);
    }

    // Merge processed audio back with video
    await execAsync(
      `ffmpeg -i "${inputPath}" -i "${tempAudioPath}" \
       -c:v copy -c:a aac -strict experimental \
       -map 0:v:0 -map 1:a:0 "${outputPath}"`
    );

    // Clean up temporary files
    const cleanupFiles = [
      tempAudioPath,
      path.join(PROCESSED_DIR, `noise_${storyId}.prof`),
    ];

    await Promise.all(
      cleanupFiles.map(file =>
        import("fs/promises")
          .then(fs => fs.unlink(file))
          .catch(() => {}) // Ignore errors if files don't exist
      )
    );

    // Update the story record in database with the new processed file path
    // TODO: Implement database update

    return NextResponse.json({
      success: true,
      url: `/uploads/processed/${path.basename(outputPath)}`,
      settings
    });

  } catch (error) {
    console.error("Audio processing error:", error);
    return NextResponse.json(
      { success: false, error: "Audio processing failed" },
      { status: 500 }
    );
  }
}
