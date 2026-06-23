import { PartialType } from '@nestjs/swagger';
import { CreateVideoGenerationDto } from './create-video-generation.dto';

export class UpdateVideoGenerationDto extends PartialType(CreateVideoGenerationDto) {}
