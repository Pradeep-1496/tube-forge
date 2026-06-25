import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateContentDto {
  @ApiProperty({
    example: 'My Video Title',
    description: 'Title for the content',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    example: 'This is the content body...',
    description: 'Main content text',
  })
  @IsString()
  content!: string;

  @ApiProperty({
    enum: ['video', 'audio', 'image', 'text'],
    required: false,
    description: 'Type of content',
  })
  @IsOptional()
  @IsIn(['video', 'audio', 'image', 'text'])
  type?: string;
}
