import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateBackgroundDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file!: Express.Multer.File;

  @ApiProperty({ example: 'sunset', description: 'Name for the background image' })
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
