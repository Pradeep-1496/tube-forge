import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { Visibility } from 'src/common/enums/visibility.enum';

export class UpdateSubscribeImageDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  file?: Express.Multer.File;

  @ApiProperty({
    example: 'subscribe-banner',
    description: 'Name for the subscribe image',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    enum: ['portrait', 'landscape'],
    required: false,
    description: 'Image type',
  })
  @IsOptional()
  @IsIn(['portrait', 'landscape'])
  type?: 'portrait' | 'landscape';

  @ApiProperty({
    enum: [Visibility.PUBLIC, Visibility.PRIVATE],
    description: 'Visibility of the subscribe image',
    required: false,
  })
  @IsOptional()
  @IsIn([Visibility.PUBLIC, Visibility.PRIVATE])
  visibility?: Visibility;
}
