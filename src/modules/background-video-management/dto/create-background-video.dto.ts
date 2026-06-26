import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { Visibility } from 'src/common/enums/visibility.enum';

export class CreateBackgroundVideoDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file!: Express.Multer.File;

  @ApiProperty({
    example: 'dark-green',
    description: 'Name for the background video',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    enum: ['portrait', 'landscape'],
    required: false,
    description: 'Video type (auto-detected if not provided)',
  })
  @IsOptional()
  @IsIn(['portrait', 'landscape'])
  type?: 'portrait' | 'landscape';

  @ApiProperty({
    enum: [Visibility.PUBLIC, Visibility.PRIVATE],
    default: Visibility.PRIVATE,
    description: 'Visibility of the background video',
    required: false,
  })
  @IsOptional()
  @IsIn([Visibility.PUBLIC, Visibility.PRIVATE])
  visibility?: Visibility;
}
