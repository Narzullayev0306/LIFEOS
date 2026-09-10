import fs from 'fs';
import path from 'path';

export interface UploadOptions {
  buffer: Buffer;
  mimeType: string;
  originalFilename?: string;
  folder: 'avatars' | 'covers' | 'general';
}

export interface StorageProvider {
  upload(options: UploadOptions): Promise<string>;
  delete(fileUrl: string): Promise<boolean>;
  replace(oldUrl: string | null | undefined, options: UploadOptions): Promise<string>;
  getUrl(relativePath: string): string;
}

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

export class LocalStorageProvider implements StorageProvider {
  private baseUploadDir: string;

  constructor(customBaseDir?: string) {
    this.baseUploadDir = customBaseDir || path.join(process.cwd(), 'public', 'uploads');
  }

  async upload(options: UploadOptions): Promise<string> {
    const ext = MIME_EXTENSIONS[options.mimeType.toLowerCase()] || '.bin';
    const cleanRandom = Math.random().toString(36).substring(2, 10);
    const filename = `${options.folder}_${Date.now()}_${cleanRandom}${ext}`;

    const targetDir = path.join(this.baseUploadDir, options.folder);
    await fs.promises.mkdir(targetDir, { recursive: true });

    const filePath = path.join(targetDir, filename);
    await fs.promises.writeFile(filePath, options.buffer);

    return `/uploads/${options.folder}/${filename}`;
  }

  async delete(fileUrl: string): Promise<boolean> {
    if (!fileUrl || typeof fileUrl !== 'string') return false;
    // Don't attempt to delete data URLs or external CDN links
    if (fileUrl.startsWith('data:') || fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return false;
    }

    try {
      // Normalize and guard against path traversal attacks
      const cleanRelative = fileUrl.replace(/^\/?uploads\//, '').replace(/^\//, '');
      const targetPath = path.resolve(this.baseUploadDir, cleanRelative);
      const allowedBase = path.resolve(this.baseUploadDir);

      if (!targetPath.startsWith(allowedBase) || targetPath === allowedBase) {
        console.warn(`[StorageProvider] Blocked path traversal attempt: ${fileUrl}`);
        return false;
      }

      await fs.promises.unlink(targetPath);
      return true;
    } catch {
      // File may not exist or already deleted, not a fatal error
      return false;
    }
  }

  async replace(oldUrl: string | null | undefined, options: UploadOptions): Promise<string> {
    const newUrl = await this.upload(options);
    if (oldUrl) {
      await this.delete(oldUrl);
    }
    return newUrl;
  }

  getUrl(relativePath: string): string {
    if (!relativePath) return '';
    if (relativePath.startsWith('http') || relativePath.startsWith('data:')) return relativePath;
    return relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  }
}

let storageInstance: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (!storageInstance) {
    storageInstance = new LocalStorageProvider();
  }
  return storageInstance;
}

export function setStorageProvider(customProvider: StorageProvider) {
  storageInstance = customProvider;
}
