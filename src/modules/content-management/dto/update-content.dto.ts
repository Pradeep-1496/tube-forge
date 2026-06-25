import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateContentDto {
  @ApiPropertyOptional({
    example: 'My Updated Title',
    description: 'Title for the content',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated content body...',
    description: 'Main content text',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    enum: ['video', 'audio', 'image', 'text'],
    required: false,
    description: 'Type of content',
  })
  @IsOptional()
  @IsIn(['video', 'audio', 'image', 'text'])
  type?: string;
}
