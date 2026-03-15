import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';

@Injectable()
export class EmailService {
  private logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  private async createTransporter(): Promise<nodemailer.Transporter> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const refreshToken = this.configService.get<string>('GOOGLE_REFRESH_TOKEN');
    const user = this.configService.get<string>('MAIL_USERNAME');

    const oAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'http://localhost:5000/api/v1/authorize/callback', // redirect URL for dev
    );

    oAuth2Client.setCredentials({ refresh_token: refreshToken });

    // const accessTokenResponse = await oAuth2Client.getAccessToken();
    // if (!accessTokenResponse?.token) {
    //   throw new Error('Failed to obtain access token');
    // }

    return nodemailer.createTransport({
      // service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user,
        clientId,
        clientSecret,
        refreshToken,
        // accessToken: accessTokenResponse.token,
      },
      tls: { rejectUnauthorized: false }, // dev only
    });
  }

  // Generic email sender
  async sendEmail(to: string, subject: string, html: string) {
    try {
      const transporter = await this.createTransporter();

      const info = await transporter.sendMail({
        from: `"Prysm" <${this.configService.get<string>('MAIL_USERNAME')}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent to ${to}`);
      return { success: true, statusCode: HttpStatus.OK, info };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      return { success: false, statusCode: HttpStatus.FAILED_DEPENDENCY };
    }
  }

  // Convenience for org invites
  async sendOrgInvite(
    to: string,
    organizationName: string,
    inviteToken: string,
  ) {
    const frontendUrl = this.configService.get<string>('FRONTEND_BASE_URL');
    const inviteLink = `${frontendUrl}/invite/${inviteToken}`;
    const html = `
      <p>Hello,</p>
      <p>You have been invited to join <strong>${organizationName}</strong> on Prysm.</p>
      <p>Click the link below to accept the invitation:</p>
      <a href="${inviteLink}">Accept Invite</a>
      <p>If you did not expect this, you can ignore this email.</p>
    `;

    return this.sendEmail(to, `Invitation to join ${organizationName}`, html);
  }
}
