import { createHash } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export interface StorageConfig {
  baseDir: string;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
}

export class StorageService {
  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = {
      maxFileSize: 10 * 1024 * 1024, // 10MB default
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
      ...config,
    };
  }

  async store(
    file: Buffer,
    options: {
      filename: string;
      mimetype: string;
      folder?: string;
    }
  ): Promise<string> {
    const { filename, mimetype, folder = 'uploads' } = options;

    // Validate file type
    if (
      this.config.allowedTypes &&
      !this.config.allowedTypes.includes(mimetype)
    ) {
      throw new Error(`File type ${mimetype} not allowed`);
    }

    // Validate file size
    if (
      this.config.maxFileSize &&
      file.length > this.config.maxFileSize
    ) {
      throw new Error(
        `File size exceeds maximum allowed size of ${
          this.config.maxFileSize / 1024 / 1024
        }MB`
      );
    }

    // Generate unique filename
    const hash = createHash('md5')
      .update(file)
      .digest('hex');
    const ext = filename.split('.').pop();
    const uniqueFilename = `${hash}.${ext}`;

    // Create target directory if it doesn't exist
    const targetDir = join(this.config.baseDir, folder);
    await mkdir(targetDir, { recursive: true });

    // Save file
    const filePath = join(targetDir, uniqueFilename);
    await writeFile(filePath, file);

    // Return public URL/path
    return join(folder, uniqueFilename);
  }

  async delete(filepath: string): Promise<void> {
    try {
      const fullPath = join(this.config.baseDir, filepath);
      await writeFile(fullPath, '');
      // Note: Using writeFile with empty content instead of unlink
      // to avoid issues if file is still referenced elsewhere
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }
}

export const storage = new StorageService({
  baseDir: join(process.cwd(), 'public'),
});

// Alias for backward compatibility
export const uploadFile = storage.store.bind(storage);
