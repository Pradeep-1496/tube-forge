import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateChannelDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User ID who owns this channel',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @ApiProperty({
    example: 'My YouTube Channel',
    description: 'Name of the YouTube channel',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'UCXuqSBlHAE6Xw-yeJA0Tunw',
    description: 'YouTube channel ID',
  })
  @IsString()
  @IsNotEmpty()
  channelId!: string;

  @ApiProperty({
    example: '123456789-abc.apps.googleusercontent.com',
    description: 'OAuth client ID',
  })
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @ApiProperty({
    example: 'GOCSPX-abc123',
    description: 'OAuth client secret',
  })
  @IsString()
  @IsNotEmpty()
  clientSecret!: string;

  @ApiProperty({
    example: '1//04abc123...',
    description: 'OAuth access token',
    required: false,
  })
  @IsString()
  accessToken?: string;

  @ApiProperty({
    example: '1//04abc123...',
    description: 'OAuth refresh token',
    required: false,
  })
  @IsString()
  refreshToken?: string;

  @ApiProperty({
    example: 1750000000000,
    description: 'Token expiry timestamp (epoch ms)',
    required: false,
  })
  expiryDate?: number;
}
