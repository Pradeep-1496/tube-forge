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
      'Audio ID from the audios collection. If the audio is shorter than 15s it will be looped, if longer it will be trimmed to 15s',
    example: 'a1b2c3d4-1234-1234-1234-abcdef123456',
  })
  @IsOptional()
  @IsString()
  audioId?: string;

  @ApiPropertyOptional({
    description:
      'Subscribe image ID from the subscribe-images collection. If provided, the video will be 10s main content + 5s subscribe image = 15s total',
    example: 'ccddeeff-1234-1234-1234-abcdef123456',
  })
  @IsOptional()
  @IsString()
  subscribeImageId?: string;
}
