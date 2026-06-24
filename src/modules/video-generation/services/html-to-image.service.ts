import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ApplePremium } from '../templates/index';

@Injectable()
export class HtmlToImageService {
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
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });
    await page.setContent(html);
    await page.screenshot({ path: outputPath, type: 'png' });
    await browser.close();
  }

  buildVideoHtml(
    title: string,
    content: string,
    isFirstFrame: boolean = false,
  ): string {
    return ApplePremium(title, content, (isFirstFrame = false));
  }
}
