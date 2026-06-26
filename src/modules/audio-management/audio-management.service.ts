import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Audio } from 'src/common/models/audio.model';
import { Visibility } from 'src/common/enums/visibility.enum';
import { Op } from 'sequelize';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync, statSync, writeFileSync } from 'fs';
import { spawn } from 'child_process';

@Injectable()
export class AudioManagementService {
  private readonly AUDIO_DIR = join(process.cwd(), 'assets', 'audios');

  private isAdmin(user: { role: string }): boolean {
    return user.role === 'admin';
  }

  async create(
    file: Express.Multer.File,
    name: string,
    userId: string,
    visibility?: string,
  ): Promise<Audio> {
    if (!file) {
      throw new BadRequestException('Audio file is required');
    }

    const ext = this.getExtension(file.originalname);
    const sanitizedName = this.sanitizeFilename(name);

    if (!existsSync(this.AUDIO_DIR)) {
      mkdirSync(this.AUDIO_DIR, { recursive: true });
    }

    const finalName = this.getUniqueFilename(`${sanitizedName}.${ext}`);
    const targetPath = join(this.AUDIO_DIR, finalName);

    writeFileSync(targetPath, file.buffer);

    const fileStat = statSync(targetPath);
    const sizeInBytes = fileStat.size;
    const duration = await this.getAudioDuration(targetPath);

    return Audio.create({
      name,
      path: join('assets', 'audios', finalName),
      length: duration?.toFixed(2),
      size: sizeInBytes,
      userId,
      visibility: visibility || Visibility.PRIVATE,
    });
  }

  async findAll(user: { id: string; role: string }): Promise<Audio[]> {
    if (this.isAdmin(user)) {
      return Audio.findAll({ order: [['created_at', 'DESC']] });
    }
    return Audio.findAll({
      where: {
        [Op.or]: [{ userId: user.id }, { visibility: Visibility.PUBLIC }],
      },
      order: [['created_at', 'DESC']],
    });
  }

  async findOne(
    audioId: string,
    user: { id: string; role: string },
  ): Promise<Audio> {
    const audio = await Audio.findByPk(audioId);
    if (!audio) {
      throw new NotFoundException(`Audio with ID ${audioId} not found`);
    }
    if (
      !this.isAdmin(user) &&
      audio.userId !== user.id &&
      audio.visibility !== Visibility.PUBLIC
    ) {
      throw new ForbiddenException('You do not have access to this audio');
    }
    return audio;
  }

  async remove(
    audioId: string,
    user: { id: string; role: string },
  ): Promise<void> {
    const audio = await Audio.findByPk(audioId);
    if (!audio) {
      throw new NotFoundException(`Audio with ID ${audioId} not found`);
    }
    if (!this.isAdmin(user) && audio.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this audio',
      );
    }

    const fullPath = join(process.cwd(), audio.path);
    if (existsSync(fullPath)) {
      unlinkSync(fullPath);
    }

    await audio.destroy();
  }

  private getAudioDuration(filePath: string): Promise<number | null> {
    return new Promise((resolve) => {
      const args: string[] = [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        filePath,
      ];

      const ffprobe = spawn('ffprobe', args);
      let stdout = '';

      ffprobe.stdout.on('data', (data) => {
        stdout += String(data);
      });

      ffprobe.on('close', (code) => {
        if (code !== 0) {
          resolve(null);
          return;
        }

        const parsed = parseFloat(stdout.trim());
        if (isNaN(parsed) || parsed <= 0) {
          resolve(null);
          return;
        }

        resolve(parsed);
      });

      ffprobe.on('error', () => resolve(null));
    });
  }

  private sanitizeFilename(name: string): string {
    return name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  }

  private getExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || 'mp3';
  }

  private getUniqueFilename(desiredName: string): string {
    const targetPath = join(this.AUDIO_DIR, desiredName);
    if (!existsSync(targetPath)) {
      return desiredName;
    }

    const parts = desiredName.split('.');
    const ext = parts.pop();
    const base = parts.join('.');
    let counter = 1;
    let candidate = ext ? `${base}_${counter}.${ext}` : `${base}_${counter}`;

    while (existsSync(join(this.AUDIO_DIR, candidate))) {
      counter++;
      candidate = ext ? `${base}_${counter}.${ext}` : `${base}_${counter}`;
    }

    return candidate;
  }
}
