import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { BackgroundVideo } from 'src/common/models/background-video.model';
import { BackgroundVideoType } from 'src/common/enums/background-video-type.enum';
import { Visibility } from 'src/common/enums/visibility.enum';
import { Op } from 'sequelize';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync, statSync, writeFileSync } from 'fs';
import { spawn } from 'child_process';

@Injectable()
export class BackgroundVideoManagementService {
  private readonly PORTRAIT_DIR = join(
    process.cwd(),
    'assets',
    'bg_videos',
    'portrait',
  );
  private readonly LANDSCAPE_DIR = join(
    process.cwd(),
    'assets',
    'bg_videos',
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
  ): Promise<BackgroundVideo> {
    if (!file) {
      throw new BadRequestException('Video file is required');
    }

    const ext = this.getExtension(file.originalname);
    const sanitizedName = this.sanitizeFilename(name);

    let videoType: BackgroundVideoType = type as BackgroundVideoType;
    if (!type) {
      videoType = BackgroundVideoType.PORTRAIT;
    }

    const targetDir =
      videoType === BackgroundVideoType.LANDSCAPE
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
    const tempPath = join(targetDir, `temp-${Date.now()}-${finalName}`);

    writeFileSync(tempPath, file.buffer);

    try {
      await this.transcodeToPortrait(tempPath, targetPath);
    } finally {
      if (existsSync(tempPath)) {
        unlinkSync(tempPath);
      }
    }

    const fileStat = statSync(targetPath);
    const sizeInBytes = fileStat.size;

    return BackgroundVideo.create({
      name,
      path: join(
        'assets',
        'bg_videos',
        videoType === BackgroundVideoType.LANDSCAPE ? 'landscape' : 'portrait',
        finalName,
      ),
      size: sizeInBytes,
      type: videoType,
      userId,
      visibility: visibility || Visibility.PRIVATE,
    });
  }

  async findAll(user: {
    id: string;
    role: string;
  }): Promise<BackgroundVideo[]> {
    if (this.isAdmin(user)) {
      return BackgroundVideo.findAll({ order: [['created_at', 'DESC']] });
    }
    return BackgroundVideo.findAll({
      where: {
        [Op.or]: [{ userId: user.id }, { visibility: Visibility.PUBLIC }],
      },
      order: [['created_at', 'DESC']],
    });
  }

  async findOne(
    id: string,
    user: { id: string; role: string },
  ): Promise<BackgroundVideo> {
    const backgroundVideo = await BackgroundVideo.findByPk(id);
    if (!backgroundVideo) {
      throw new NotFoundException(`Background video with ID ${id} not found`);
    }
    if (
      !this.isAdmin(user) &&
      backgroundVideo.dataValues.userId !== user.id &&
      backgroundVideo.dataValues.visibility !== Visibility.PUBLIC
    ) {
      throw new ForbiddenException(
        'You do not have access to this background video',
      );
    }
    return backgroundVideo;
  }

  async remove(id: string, user: { id: string; role: string }): Promise<void> {
    const backgroundVideo = await BackgroundVideo.findByPk(id);
    if (!backgroundVideo) {
      throw new NotFoundException(`Background video with ID ${id} not found`);
    }
    if (!this.isAdmin(user) && backgroundVideo.dataValues.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this background video',
      );
    }

    const fullPath = join(process.cwd(), backgroundVideo.dataValues.path);
    const t = await BackgroundVideo.sequelize!.transaction();
    try {
      await backgroundVideo.destroy({ transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }

    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }
  }

  private async transcodeToPortrait(
    inputPath: string,
    outputPath: string,
  ): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const args = [
        '-i',
        inputPath,
        '-vf',
        'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black',
        '-c:a',
        'aac',
        '-y',
        outputPath,
      ];

      const ffmpeg = spawn('ffmpeg', args);

      let stderr = '';
      ffmpeg.stderr.on('data', (data) => {
        stderr += String(data);
      });

      ffmpeg.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`FFmpeg transcoding failed: ${stderr}`));
          return;
        }
        resolve();
      });

      ffmpeg.on('error', (err) => reject(err));
    });
  }

  private sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  }

  private getExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || 'mp4';
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
