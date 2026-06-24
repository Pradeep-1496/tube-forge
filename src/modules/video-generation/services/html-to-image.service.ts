import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

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
    return `
<html>
  <body style="margin:0; padding:0; width:1080px; height:1920px; font-family: Arial, sans-serif; background: #1a1a2e; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; overflow: hidden;">
    <div style="font-size: ${isFirstFrame ? '80px' : '70px'}; font-weight: bold; max-width: 90%; word-wrap: break-word; line-height: 1.3; padding: 20px; margin-bottom: 20px;">
      ${title}
    </div>
    ${content ? `<div style="font-size: 56px; max-width: 90%; word-wrap: break-word; line-height: 1.3; padding: 20px;">${content}</div>` : ''}
  </body>
</html>
`;
  }
}
