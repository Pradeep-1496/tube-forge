import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateSubscribeImageDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file!: Express.Multer.File;

  @ApiProperty({
    example: 'subscribe-banner',
    description: 'Name for the subscribe image',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    enum: ['portrait', 'landscape'],
    required: false,
    description: 'Image type (auto-detected if not provided)',
  })
  @IsOptional()
  @IsIn(['portrait', 'landscape'])
  type?: 'portrait' | 'landscape';
}
