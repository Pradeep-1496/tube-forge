import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { Visibility } from 'src/common/enums/visibility.enum';

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
    example: 'video',
    description: 'Type of content',
  })
  @IsString()
  type!: string;

  @ApiProperty({
    enum: [Visibility.PUBLIC, Visibility.PRIVATE],
    default: Visibility.PRIVATE,
    description: 'Visibility of the content',
    required: false,
  })
  @IsOptional()
  @IsIn([Visibility.PUBLIC, Visibility.PRIVATE])
  visibility?: Visibility;
}
