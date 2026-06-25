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
      await page.setContent(html);
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

    let transparent = html;
    transparent = transparent.replace(
      /<body[^>]*background-color\s*:\s*[^;'"]+;?/gi,
      '<body style="margin:0;width:1080px;height:1920px;display:flex;justify-content:center;align-items:center;font-family:Poppins,sans-serif;overflow:hidden;position:relative;"',
    );
    transparent = transparent.replace(
      /<div style="\s*position:\s*absolute\s*;\s*inset:\s*0\s*;[^>]*><\/div>/gi,
      '',
    );
    transparent = transparent.replace(
      /background-color\s*:\s*#111827\s*;?/gi,
      '',
    );
    transparent = transparent.replace(
      /background-color\s*:\s*#050505\s*;?/gi,
      '',
    );
    transparent = transparent.replace(
      /background-color\s*:\s*#18181b\s*;?/gi,
      '',
    );
    transparent = transparent.replace(
      /background-color\s*:\s*#0f0f0f\s*;?/gi,
      '',
    );

    const browser = await puppeteer.launch({
      executablePath:
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1920 });
      await page.setContent(transparent);
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
    };

    const fn = map[key as keyof typeof map] || Glassmorphism;
    return fn(title, content, isFirstFrame, bgConfig);
  }
}
