import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateChannelDto {
  @ApiPropertyOptional({
    example: 'My YouTube Channel',
    description: 'Name of the YouTube channel',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    example: 'UCXuqSBlHAE6Xw-yeJA0Tunw',
    description: 'YouTube channel ID',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  channelId?: string;

  @ApiPropertyOptional({
    example: '123456789-abc.apps.googleusercontent.com',
    description: 'OAuth client ID',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  clientId?: string;

  @ApiPropertyOptional({
    example: 'GOCSPX-abc123',
    description: 'OAuth client secret',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  clientSecret?: string;

  @ApiPropertyOptional({
    example: '1//04abc123...',
    description: 'OAuth access token',
  })
  @IsOptional()
  @IsString()
  accessToken?: string;

  @ApiPropertyOptional({
    example: '1//04abc123...',
    description: 'OAuth refresh token',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiPropertyOptional({
    example: 1750000000000,
    description: 'Token expiry timestamp (epoch ms)',
  })
  @IsOptional()
  expiryDate?: number;
}
