import { Injectable, OnModuleInit } from '@nestjs/common';
import { join } from 'path';
import { readFileSync } from 'fs';

export interface BackgroundImageConfig {
  enabled: boolean;
  path?: string;
  dataUrl?: string;
  opacity: number;
}

@Injectable()
export class BackgroundImageProvider implements OnModuleInit {
  private readonly PORTRAIT_DIR = join(
    process.cwd(),
    'assets',
    'backgrounds',
    'protrait',
  );
  private cachedDataUrls: Map<string, string> = new Map();

  async onModuleInit() {
    this.cacheAllPortraitImages();
  }

  private cacheAllPortraitImages() {
    const filenames = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'];
    for (const filename of filenames) {
      const fullPath = join(this.PORTRAIT_DIR, filename);
      try {
        const buf = readFileSync(fullPath);
        const b64 = buf.toString('base64');
        this.cachedDataUrls.set(filename, `data:image/jpeg;base64,${b64}`);
      } catch (err) {
        console.warn(
          `[BackgroundImageProvider] Failed to cache ${filename}:`,
          (err as Error).message,
        );
      }
    }
  }

  getDataUrl(filename: string): string | undefined {
    return this.cachedDataUrls.get(filename);
  }

  getAvailableFilenames(): string[] {
    return Array.from(this.cachedDataUrls.keys());
  }

  buildConfig(
    filename?: string,
    opacity: number = 0.45,
  ): BackgroundImageConfig {
    const dataUrl = filename ? this.getDataUrl(filename) : undefined;
    return {
      enabled: !!dataUrl,
      path: filename,
      dataUrl,
      opacity,
    };
  }
}
