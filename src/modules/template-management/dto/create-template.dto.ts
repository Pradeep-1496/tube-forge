import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { Visibility } from 'src/common/enums/visibility.enum';

export class CreateTemplateDto {
  @ApiProperty({
    example: 'YouTube Intro',
    description: 'Unique name for the template',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'A professional intro template',
    description: 'Description of the template',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '<html lang="en"><head> <title>title</title></head><body></body></html>',
    description: 'Template code content',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    enum: [Visibility.PUBLIC, Visibility.PRIVATE],
    default: Visibility.PRIVATE,
    description: 'Visibility of the template',
    required: false,
  })
  @IsOptional()
  @IsIn([Visibility.PUBLIC, Visibility.PRIVATE])
  visibility?: Visibility;
}
