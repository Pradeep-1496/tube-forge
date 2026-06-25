import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Background } from 'src/common/models/background.model';
import { BackgroundType } from 'src/common/enums/bg-type.enum';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync, statSync, writeFileSync } from 'fs';
import sharp from 'sharp';

@Injectable()
export class BackgroundManagementService {
  private readonly PORTRAIT_DIR = join(
    process.cwd(),
    'assets',
    'backgrounds',
    'portrait',
  );
  private readonly LANDSCAPE_DIR = join(
    process.cwd(),
    'assets',
    'backgrounds',
    'landscape',
  );

  async create(
    file: Express.Multer.File,
    name: string,
    type?: 'portrait' | 'landscape',
  ): Promise<Background> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const ext = this.getExtension(file.originalname);
    const sanitizedName = this.sanitizeFilename(name);

    let imageType: BackgroundType = type as BackgroundType;
    if (!type) {
      const metadata = await sharp(file.buffer).metadata();
      imageType =
        metadata.height && metadata.width
          ? metadata.height > metadata.width
            ? BackgroundType.PORTRAIT
            : BackgroundType.LANDSCAPE
          : BackgroundType.PORTRAIT;
    }

    

    const targetDir =
      imageType === BackgroundType.LANDSCAPE
        ? this.LANDSCAPE_DIR
        : this.PORTRAIT_DIR;
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    const finalName = this.getUniqueFilename(
      targetDir,
      `${sanitizedName}.${ext}`,
    );
    const targetPath = join(targetDir, finalName);

    writeFileSync(targetPath, file.buffer);

    const fileStat = statSync(targetPath);
    const sizeInBytes = fileStat.size;

    return Background.create({
      name,
      path: join(
        'assets',
        'backgrounds',
        imageType === BackgroundType.LANDSCAPE ? 'landscape' : 'portrait',
        finalName,
      ),
      size: sizeInBytes,
      type: imageType,
    });
  }

  async findAll(): Promise<Background[]> {
    return Background.findAll({ order: [['created_at', 'DESC']] });
  }

  async findOne(id: string): Promise<Background> {
    const background = await Background.findByPk(id, { raw: true });
    if (!background) {
      throw new NotFoundException(`Background with ID ${id} not found`);
    }
    return background;
  }

  async remove(id: string): Promise<void> {
    const background = await Background.findByPk(id);
    if (!background) {
      throw new NotFoundException(`Background with ID ${id} not found`);
    }

    const fullPath = join(process.cwd(), background.path);
    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }

    await background.destroy();
  }

  private sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  }

  private getExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || 'jpg';
  }

  private getUniqueFilename(dir: string, desiredName: string): string {
    const allDirs = [this.PORTRAIT_DIR, this.LANDSCAPE_DIR];
    let candidate = desiredName;
    let counter = 1;
    const existsAnywhere = (name: string) =>
      allDirs.some((d) => existsSync(join(d, name)));
    while (existsAnywhere(candidate)) {
      const parts = desiredName.split('.');
      const ext = parts.pop();
      const base = parts.join('.');
      candidate = ext ? `${base}_${counter}.${ext}` : `${base}_${counter}`;
      counter++;
    }
    return candidate;
  }
}
