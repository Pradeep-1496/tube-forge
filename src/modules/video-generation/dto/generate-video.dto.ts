import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class GenerateVideoDto {
  @ApiPropertyOptional({
    description: 'Background image ID from the backgrounds collection',
    example: 'bbccce9c-64e9-491e-a94d-63fc6318218d',
  })
  @IsOptional()
  @IsString()
  backgroundId?: string;

  @ApiPropertyOptional({
    description: 'Theme key to use for the video template',
    example: 'neon',
    enum: ['glassmorphism', 'neon', 'viral', 'apple', 'gold'],
  })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiPropertyOptional({
    description:
      'Audio filename from the assets/audios folder (e.g. hip-hop-v-4.mp3). If shorter than 15s it will be looped, if longer it will be trimmed to 15s',
    example: 'hip-hop-v-4.mp3',
  })
  @IsOptional()
  @IsString()
  audioPath?: string;
}
