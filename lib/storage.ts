import { createHash } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export interface StorageConfig {
  baseDir: string;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
}

export interface UploadResult {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
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

    if (this.config.allowedTypes && !this.config.allowedTypes.includes(mimetype)) {
      throw new Error(`File type ${mimetype} not allowed`);
    }

    if (this.config.maxFileSize && file.length > this.config.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.config.maxFileSize / 1024 / 1024}MB`);
    }

    const hash = createHash('md5').update(file).digest('hex');
    const ext = filename.split('.').pop();
    const uniqueFilename = `${hash}.${ext}`;

    const targetDir = join(this.config.baseDir, folder);
    await mkdir(targetDir, { recursive: true });

    const filePath = join(targetDir, uniqueFilename);
    await writeFile(filePath, file);

    return join(folder, uniqueFilename);
  }

  async delete(filepath: string): Promise<void> {
    try {
      const fullPath = join(this.config.baseDir, filepath);
      await writeFile(fullPath, '');
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }
}

export const storage = new StorageService({
  baseDir: join(process.cwd(), 'uploads'),
});

export async function processUpload(data: {
  file: File;
  userId: string;
  username?: string;
  userImage?: string;
  metadata?: Record<string, any>;
}): Promise<UploadResult> {
  const buffer = Buffer.from(await data.file.arrayBuffer());
  const url = await storage.store(buffer, {
    filename: data.file.name,
    mimetype: data.file.type,
    folder: 'stories'
  });

  return {
    url,
    filename: data.file.name,
    mimetype: data.file.type,
    size: data.file.size
  };
}

export const uploadFile = storage.store.bind(storage);
