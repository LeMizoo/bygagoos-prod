import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

// Interface pour le typage des templates d'email
export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Configuration du transporteur Nodemailer
 * Supporte OAuth2 pour Gmail en production et Ethereal en développement
 */
export const createTransporter = async (): Promise<nodemailer.Transporter<SMTPTransport.SentMessageInfo>> => {
  if (process.env.NODE_ENV === 'production') {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });

    const accessToken = await oauth2Client.getAccessToken();

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.SMTP_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token || ''
      }
    } as SMTPTransport.Options);
  } else {
    // Service de test pour le développement
    const testAccount = await nodemailer.createTestAccount();
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }
};

// Styles communs exportés pour les templates
export const commonStyles = `
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #164657; color: white; padding: 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; background: #F7ECDC; }
    .button { display: inline-block; padding: 12px 30px; background: #164657; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #707470; font-size: 12px; }
    .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
`;