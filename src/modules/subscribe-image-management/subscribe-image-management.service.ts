import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SubscribeImage } from 'src/common/models/subscribe-image.model';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync, statSync, writeFileSync } from 'fs';
import sharp from 'sharp';

@Injectable()
export class SubscribeImageManagementService {
  private readonly PORTRAIT_DIR = join(
    process.cwd(),
    'assets',
    'subscribe-images',
    'portrait',
  );
  private readonly LANDSCAPE_DIR = join(
    process.cwd(),
    'assets',
    'subscribe-images',
    'landscape',
  );

  async create(
    file: Express.Multer.File,
    name: string,
    type?: 'portrait' | 'landscape',
  ): Promise<SubscribeImage> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const ext = this.getExtension(file.originalname);
    const sanitizedName = this.sanitizeFilename(name);

    let imageType: 'portrait' | 'landscape' = type || 'portrait';
    if (!type) {
      const metadata = await sharp(file.buffer).metadata();
      imageType =
        metadata.height && metadata.width
          ? metadata.height > metadata.width
            ? 'portrait'
            : 'landscape'
          : 'portrait';
    }

    let processedBuffer: Buffer;
    let outputExt: string;
    if (imageType === 'portrait') {
      processedBuffer = await sharp(file.buffer)
        .resize(1080, 1920, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toBuffer();
      outputExt = 'jpg';
    } else {
      processedBuffer = file.buffer;
      outputExt = ext;
    }

    const extToUse = outputExt;

    const targetDir =
      imageType === 'landscape' ? this.LANDSCAPE_DIR : this.PORTRAIT_DIR;
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    const finalName = this.getUniqueFilename(
      targetDir,
      `${sanitizedName}.${extToUse}`,
    );
    const targetPath = join(targetDir, finalName);

    writeFileSync(targetPath, processedBuffer);

    const fileStat = statSync(targetPath);
    const sizeInBytes = fileStat.size;

    return SubscribeImage.create({
      name,
      path: join('assets', 'subscribe-images', imageType, finalName),
      size: sizeInBytes,
      type: imageType,
    });
  }

  async findAll(): Promise<SubscribeImage[]> {
    return SubscribeImage.findAll({ order: [['created_at', 'DESC']] });
  }

  async findOne(id: string): Promise<SubscribeImage> {
    const subscribeImage = await SubscribeImage.findByPk(id, { raw: true });
    if (!subscribeImage) {
      throw new NotFoundException(`Subscribe image with ID ${id} not found`);
    }
    return subscribeImage;
  }

  async update(
    id: string,
    data: {
      file?: Express.Multer.File;
      name?: string;
      type?: 'portrait' | 'landscape';
    },
  ): Promise<SubscribeImage> {
    const subscribeImage = await SubscribeImage.findByPk(id);
    if (!subscribeImage) {
      throw new NotFoundException(`Subscribe image with ID ${id} not found`);
    }

    const updatePayload: Record<string, string | number> = {};

    if (data.name) {
      updatePayload.name = data.name;
    }

    if (data.type) {
      updatePayload.type = data.type;
    }

    if (data.file) {
      const fullPath = join(process.cwd(), subscribeImage.path);
      if (existsSync(fullPath)) {
        unlinkSync(fullPath);
      }

      const sanitizedName = this.sanitizeFilename(
        data.name || subscribeImage.name,
      );

      const imageType = data.type || subscribeImage.type;
      const targetDir =
        imageType === 'landscape' ? this.LANDSCAPE_DIR : this.PORTRAIT_DIR;
      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
      }

      let processedBuffer: Buffer;
      let outputExt: string;
      if (imageType === 'portrait') {
        processedBuffer = await sharp(data.file.buffer)
          .resize(1080, 1920, { fit: 'fill' })
          .jpeg({ quality: 90 })
          .toBuffer();
        outputExt = 'jpg';
      } else {
        processedBuffer = data.file.buffer;
        outputExt = this.getExtension(data.file.originalname);
      }

      const finalName = this.getUniqueFilename(
        targetDir,
        `${sanitizedName}.${outputExt}`,
      );
      const targetPath = join(targetDir, finalName);

      writeFileSync(targetPath, processedBuffer);

      const fileStat = statSync(targetPath);
      updatePayload.path = join(
        'assets',
        'subscribe-images',
        imageType,
        finalName,
      );
      updatePayload.size = fileStat.size;
    }

    await subscribeImage.update(updatePayload);
    return subscribeImage.reload();
  }

  async remove(id: string): Promise<void> {
    const subscribeImage = await SubscribeImage.findByPk(id);
    if (!subscribeImage) {
      throw new NotFoundException(`Subscribe image with ID ${id} not found`);
    }

    const fullPath = join(process.cwd(), subscribeImage.path);
    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }

    await subscribeImage.destroy();
  }

  private sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  }

  private getExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || 'jpg';
  }

  private getUniqueFilename(dir: string, desiredName: string): string {
    let candidate = desiredName;
    let counter = 1;
    while (existsSync(join(dir, candidate))) {
      const parts = desiredName.split('.');
      const ext = parts.pop();
      const base = parts.join('.');
      candidate = ext ? `${base}_${counter}.${ext}` : `${base}_${counter}`;
      counter++;
    }
    return candidate;
  }
}
