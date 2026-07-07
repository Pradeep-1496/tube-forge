import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UploadYoutubeDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Metadata ID to upload',
  })
  @IsNotEmpty()
  metadataId!: string;
}
