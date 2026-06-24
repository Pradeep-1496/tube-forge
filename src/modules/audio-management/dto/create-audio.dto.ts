import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAudioDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file!: Express.Multer.File;

  @ApiProperty({
    example: 'hip-hop-v-4',
    description: 'Name for the audio file',
  })
  @IsString()
  name!: string;
}
