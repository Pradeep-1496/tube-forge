import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateVideoGenerationDto {
  @ApiProperty({ example: 'Title' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Content' })
  @IsString()
  content!: string;

  @ApiProperty({ example: 'Type', required: false })
  @IsOptional()
  @IsString()
  type?: string;
}
