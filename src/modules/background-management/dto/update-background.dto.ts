import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateBackgroundDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  file?: Express.Multer.File;

  @ApiProperty({ example: 'sunset', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    enum: ['portrait', 'landscape'],
    required: false,
  })
  @IsOptional()
  @IsIn(['portrait', 'landscape'])
  type?: 'portrait' | 'landscape';
}
