import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(
      this.configService.get<string>('OAUTH_CLIENTID'),
      this.configService.get<string>('OAUTH_CLIENT_SECRET'),
      'https://developers.google.com/oauthplayground',
    );

    oauth2Client.setCredentials({
      refresh_token: this.configService.get<string>('OAUTH_REFRESH_TOKEN'),
    });
    const accessToken = await oauth2Client.getAccessToken();

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.configService.get<string>('MAIL_USERNAME'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
        clientId: this.configService.get<string>('OAUTH_CLIENTID'),
        clientSecret: this.configService.get<string>('OAUTH_CLIENT_SECRET'),
        refreshToken: this.configService.get<string>('OAUTH_REFRESH_TOKEN'),
        accessToken,
        tls: {
          rejectUnauthorized: false,
        },
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    attachments?: {
      filename: string;
      content?: string | Buffer;
      path?: string;
      contentType?: string;
    }[],
  ) {
    try {
      const mailOptions = {
        from: `"Prysm" <${this.configService.get<string>('MAIL_FROM')}>`,
        to,
        subject,
        html,
        attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to}`);
      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Email sent',
        info,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      return {
        success: false,
        statusCode: HttpStatus.FAILED_DEPENDENCY,
        message: 'Email sending failed',
        error,
      };
    }
  }

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
