import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { Visibility } from 'src/common/enums/visibility.enum';

export class CreateAudioDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file!: Express.Multer.File;

  @ApiProperty({
    example: 'hip-hop-v-4',
    description: 'Name for the audio file',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    enum: [Visibility.PUBLIC, Visibility.PRIVATE],
    default: Visibility.PRIVATE,
    description: 'Visibility of the audio',
    required: false,
  })
  @IsOptional()
  @IsIn([Visibility.PUBLIC, Visibility.PRIVATE])
  visibility?: Visibility;
}
