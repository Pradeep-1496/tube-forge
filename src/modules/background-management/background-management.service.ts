import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Background } from 'src/common/models/background.model';
import { BackgroundType } from 'src/common/enums/bg-type.enum';
import { Visibility } from 'src/common/enums/visibility.enum';
import { Op } from 'sequelize';
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

  private isAdmin(user: { role: string }): boolean {
    return user.role === 'admin';
  }

  async create(
    file: Express.Multer.File,
    name: string,
    userId: string,
    type?: 'portrait' | 'landscape',
    visibility?: string,
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

    let processedBuffer: Buffer;
    let outputExt: string;

    if (imageType === BackgroundType.PORTRAIT) {
      processedBuffer = await sharp(file.buffer)
        .resize(1080, 1920, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toBuffer();
      outputExt = 'jpg';
    } else {
      processedBuffer = file.buffer;
      outputExt = ext;
    }

    const finalName = this.getUniqueFilename(
      targetDir,
      `${sanitizedName}.${outputExt}`,
    );
    const targetPath = join(targetDir, finalName);

    writeFileSync(targetPath, processedBuffer);

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
      userId,
      visibility: visibility || Visibility.PRIVATE,
    });
  }

  async findAll(user: { id: string; role: string }): Promise<Background[]> {
    if (this.isAdmin(user)) {
      return Background.findAll({ order: [['created_at', 'DESC']] });
    }
    return Background.findAll({
      where: {
        [Op.or]: [{ userId: user.id }, { visibility: Visibility.PUBLIC }],
      },
      order: [['created_at', 'DESC']],
    });
  }

  async findOne(
    id: string,
    user: { id: string; role: string },
  ): Promise<Background> {
    const background = await Background.findByPk(id);
    if (!background) {
      throw new NotFoundException(`Background with ID ${id} not found`);
    }
    if (
      !this.isAdmin(user) &&
      background.dataValues.userId !== user.id &&
      background.dataValues.visibility !== Visibility.PUBLIC
    ) {
      throw new ForbiddenException('You do not have access to this background');
    }
    return background;
  }

  async remove(id: string, user: { id: string; role: string }): Promise<void> {
    const background = await Background.findByPk(id);
    if (!background) {
      throw new NotFoundException(`Background with ID ${id} not found`);
    }
    if (!this.isAdmin(user) && background.dataValues.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this background',
      );
    }

    const fullPath = join(process.cwd(), background.dataValues.path);
    const t = await Background.sequelize!.transaction();
    try {
      await background.destroy({ transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }

    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }
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
