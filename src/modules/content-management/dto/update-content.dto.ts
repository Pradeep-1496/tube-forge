import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { Visibility } from 'src/common/enums/visibility.enum';

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
    example: 'new video',
    description: 'Type of content',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    enum: [Visibility.PUBLIC, Visibility.PRIVATE],
    description: 'Visibility of the content',
    required: false,
  })
  @IsOptional()
  @IsIn([Visibility.PUBLIC, Visibility.PRIVATE])
  visibility?: Visibility;
}
