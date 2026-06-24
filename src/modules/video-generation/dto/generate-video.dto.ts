import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class GenerateVideoDto {
  @ApiPropertyOptional({
    description:
      'Background image filename (e.g. 1.jpg, 2.jpg, 3.jpg, 4.jpg, 5.jpg)',
    example: '2.jpg',
  })
  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @ApiPropertyOptional({
    description: 'Theme key to use for the video template',
    example: 'neon',
    enum: ['glassmorphism', 'neon', 'viral', 'apple', 'gold'],
  })
  @IsOptional()
  @IsString()
  theme?: string;
}
