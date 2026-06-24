import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
}
