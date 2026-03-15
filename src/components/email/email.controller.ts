import { Controller, Get, Query, Res } from '@nestjs/common';
import { google } from 'googleapis';
import { Response } from 'express';

@Controller('api/v1/authorize')
export class EmailController {
  private oAuth2Client;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = 'http://localhost:5000/api/v1/authorize/callback'; // Must match your script

    this.oAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );
  }

  // Step 1: Redirect user to Google consent screen
  @Get()
  redirectToGoogle(@Res() res: Response) {
    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline', // to get refresh token
      scope: ['https://www.googleapis.com/auth/gmail.send'],
      prompt: 'consent', // forces consent screen
    });

    res.redirect(authUrl);
  }

  // Step 2: Callback route Google redirects to
  @Get('callback')
  async handleGoogleCallback(
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    try {
      const { tokens } = await this.oAuth2Client.getToken(code);
      console.log('Tokens received:', tokens);

      // Show user the refresh token to copy (or save it)
      res.send(`
        <h2>OAuth Success!</h2>
        <p>Copy this refresh token and put it in your .env:</p>
        <pre>${tokens.refresh_token}</pre>
      `);
    } catch (error) {
      console.error('Error retrieving token:', error);
      res.status(500).send('Error retrieving token');
    }
  }
}
