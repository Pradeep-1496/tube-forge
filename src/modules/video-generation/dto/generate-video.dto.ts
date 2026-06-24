import { IsString, IsOptional } from 'class-validator';

export class GenerateVideoDto {
  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @IsOptional()
  @IsString()
  theme?: string;
}
