import { Injectable, Inject } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import {
  BackgroundImageProvider,
  BackgroundImageConfig,
} from './background-image.provider';
import {
  ApplePremium,
  ViralShorts,
  Glassmorphism,
  LuxuryGold,
  NeonCard,
} from '../templates/index';

@Injectable()
export class HtmlToImageService {
  constructor(private readonly backgroundProvider: BackgroundImageProvider) {}

  async render(
    html: string,
    outputPath: string,
    bgConfig?: BackgroundImageConfig,
  ): Promise<void> {
    const dir = join(outputPath, '..');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const browser = await puppeteer.launch({
      executablePath:
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1920 });
      await page.setContent(html);
      await page.screenshot({ path: outputPath, type: 'png' });
    } finally {
      await browser.close();
    }
  }

  buildVideoHtml(
    title: string,
    content: string,
    isFirstFrame: boolean = false,
    bgConfig?: BackgroundImageConfig,
    themeName?: string,
  ): string {
    const key = themeName?.toLowerCase().trim();
    const map = {
      glassmorphism: Glassmorphism,
      neon: NeonCard,
      viral: ViralShorts,
      apple: ApplePremium,
      gold: LuxuryGold,
    };
    const fn = map[key as keyof typeof map] || Glassmorphism;
    return fn(title, content, isFirstFrame, bgConfig);
  }
}
