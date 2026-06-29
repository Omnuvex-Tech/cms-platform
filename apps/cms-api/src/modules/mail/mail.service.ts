
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private getTransporter() {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendContactSubmission(data: {
    name: string;
    email: string;
    phone: string;
    service?: string;
    budget?: string;
    timeline?: string;
    message: string;
    submittedAt: Date;
  }) {
    const to = process.env.CONTACT_RECEIVER_EMAIL;
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="padding:32px 40px;background:#0a0a0a;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:0.12em;color:#666;text-transform:uppercase;">Yeni müraciət</p>
      <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">${data.name}</h1>
      <p style="margin:6px 0 0;font-size:13px;color:#888;">${data.email}</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;width:110px;vertical-align:top;">
            <span style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#999;">Telefon</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
            <span style="font-size:14px;color:#1a1a1a;">${data.phone || '—'}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;vertical-align:top;">
            <span style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#999;">Servis</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
            <span style="display:inline-block;font-size:12px;font-weight:600;color:#1a1a1a;background:#f4f4f5;padding:3px 12px;border-radius:20px;">${data.service || '—'}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;vertical-align:top;">
            <span style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#999;">Büdcə</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
            <span style="font-size:14px;color:#1a1a1a;">${data.budget || '—'}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;vertical-align:top;">
            <span style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#999;">Timeline</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
            <span style="font-size:14px;color:#1a1a1a;">${data.timeline || '—'}</span>
          </td>
        </tr>
        ${data.message ? `
        <tr>
          <td style="padding:12px 0;vertical-align:top;">
            <span style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#999;">Mesaj</span>
          </td>
          <td style="padding:12px 0;">
            <span style="font-size:14px;color:#1a1a1a;line-height:1.7;white-space:pre-line;">${data.message}</span>
          </td>
        </tr>` : ''}
      </table>
    </div>

    <!-- Footer -->
    <div style="padding:20px 40px;background:#f9f9f9;border-top:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:15px;font-weight:700;color:#0a0a0a;letter-spacing:-0.01em;">Trenders</span>
      <span style="font-size:11px;color:#aaa;">${data.submittedAt.toLocaleString('az-AZ')}</span>
    </div>

  </div>
</body>
</html>
`;
    try {
      await this.getTransporter().sendMail({
        from: `"Trenders" <${process.env.MAIL_USER}>`,
        to,
        subject: `Yeni müraciət — ${data.name}`,
        html,
      });
      this.logger.log(`Mail göndərildi: ${to}`);
    } catch (err) {
      this.logger.error('Mail göndərilmədi', err);
      throw err;
    }
  }

  async sendVacancySubmission(data: {
    name: string;
    email: string;
    phone: string;
    message?: string;
    cvUrl: string;
    vacancyTitle?: string;
    submittedAt: Date;
  }) {
    const to = process.env.CONTACT_RECEIVER_EMAIL;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1a1a1a; margin-bottom: 24px; font-size: 20px;">
        📋 Yeni vakansiya müraciəti — Trenders
      </h2>

      ${data.vacancyTitle ? `
      <p style="margin-bottom: 16px; padding: 10px 16px; background: #f0f9ff; border-radius: 6px; font-size: 14px; color: #0369a1;">
        Vakansiya: <strong>${data.vacancyTitle}</strong>
      </p>` : ''}

      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; color: #6b7280; font-size: 13px; width: 140px;">Ad</td>
          <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${data.name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Email</td>
          <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px;">
            <a href="mailto:${data.email}" style="color: #2563eb;">${data.email}</a>
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Telefon</td>
          <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px;">${data.phone}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 0; color: #6b7280; font-size: 13px; vertical-align: top;">Mesaj</td>
          <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px; white-space: pre-line;">${data.message || '—'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">CV</td>
          <td style="padding: 10px 0; font-size: 14px;">
<a href="${process.env.API_URL}${data.cvUrl}" style="color: #2563eb;">CV-yə bax / yüklə</a>
          </td>
        </tr>
      </table>

      <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
        Göndərilmə tarixi: ${data.submittedAt.toLocaleString('az-AZ')}
      </p>
    </div>
  `;

    try {
      await this.getTransporter().sendMail({
        from: `"Trenders CMS" <${process.env.MAIL_USER}>`,
        to,
        subject: `Vakansiya müraciəti: ${data.name}${data.vacancyTitle ? ` — ${data.vacancyTitle}` : ''}`,
        html,
      });
      this.logger.log(`Vakansiya mail göndərildi: ${to}`);
    } catch (err) {
      this.logger.error('Vakansiya mail göndərilmədi', err);
      throw err;
    }
  }
}