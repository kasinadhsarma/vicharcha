import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";

// Define upload directory - In production, use proper cloud storage
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "stories");

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const settings = JSON.parse(formData.get("settings") as string);
    const storyId = formData.get("storyId") as string;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string);
    const totalChunks = parseInt(formData.get("totalChunks") as string);

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = path.extname(file.name);
    const fileName = `${storyId}_${timestamp}${fileExt}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // For chunk handling
    const chunkPath = path.join(UPLOAD_DIR, `${fileName}.part${chunkIndex}`);
    await writeFile(chunkPath, buffer);

    // If this is the last chunk, combine all chunks
    if (chunkIndex === totalChunks - 1) {
      const chunks = [];
      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(UPLOAD_DIR, `${fileName}.part${i}`);
        const chunkData = await import("fs/promises").then(fs => fs.readFile(chunkPath));
        chunks.push(chunkData);
        // Clean up chunk file
        await import("fs/promises").then(fs => fs.unlink(chunkPath));
      }

      // Combine chunks and save final file
      const finalBuffer = Buffer.concat(chunks);
      await writeFile(filePath, finalBuffer);

      // Update story record in database
      // TODO: Implement database update
      
      return NextResponse.json({
        success: true,
        url: `/uploads/stories/${fileName}`,
        settings
      });
    }

    // For intermediate chunks
    return NextResponse.json({
      success: true,
      chunkIndex,
      remaining: totalChunks - chunkIndex - 1
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
