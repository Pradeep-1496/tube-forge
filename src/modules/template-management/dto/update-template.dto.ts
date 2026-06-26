import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { Visibility } from 'src/common/enums/visibility.enum';

export class UpdateTemplateDto {
  @ApiPropertyOptional({
    example: 'YouTube Intro Updated',
    description: 'Unique name for the template',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'An updated professional intro template',
    description: 'Description of the template',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example:
      '<html lang="en"><head> <title>title</title></head><body></body></html>',
    description: 'Template code content',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    enum: [Visibility.PUBLIC, Visibility.PRIVATE],
    description: 'Visibility of the template',
    required: false,
  })
  @IsOptional()
  @IsIn([Visibility.PUBLIC, Visibility.PRIVATE])
  visibility?: Visibility;
}
