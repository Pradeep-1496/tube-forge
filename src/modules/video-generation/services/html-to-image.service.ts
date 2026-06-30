import { Injectable } from '@nestjs/common';
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
  None,
  Custom,
  News,
} from '../templates/index';

@Injectable()
export class HtmlToImageService {
  constructor(private readonly backgroundProvider: BackgroundImageProvider) {}

  async render(html: string, outputPath: string): Promise<void> {
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
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 } as Record<string, unknown>);
      await page.waitForSelector('body');
      await page.screenshot({ path: outputPath, type: 'png' });
    } finally {
      await browser.close();
    }
  }

  async renderTransparent(html: string, outputPath: string): Promise<void> {
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
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 } as Record<string, unknown>);
      await page.evaluate(() => {
        const body = document.body;
        if (body) {
          const keep: Record<string, string> = {};
          const i = body.style.length;
          let idx = 0;
          while (idx < i) {
            const key = body.style.item(idx);
            if (key && !/^background-?color$/i.test(key)) {
              keep[key] = body.style.getPropertyValue(key);
            }
            idx++;
          }
          body.style.cssText = '';
          for (const [key, value] of Object.entries(keep)) {
            body.style.setProperty(key, value);
          }
        }
        document.querySelectorAll('div[style*="position:absolute"][style*="inset:0"]').forEach((el) => {
          el.remove();
        });
      });
      await page.waitForSelector('body');
      await page.screenshot({
        path: outputPath,
        type: 'png',
        omitBackground: true,
      });
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
      none: None,
      custom: Custom,
      news: News,
    };

    const fn = map[key as keyof typeof map] || Glassmorphism;
    return fn(title, content, isFirstFrame, bgConfig);
  }
}
