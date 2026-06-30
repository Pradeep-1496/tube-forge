import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { google } from 'googleapis';

@Controller('youtube')
export class YoutubeController {
  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  @Get('login')
  login(@Res() res: Response) {
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/youtube.upload'],
    });

    return res.redirect(url);
  }

  @Get('callback')
  async callback(@Query('code') code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
    };
  }


  
}
