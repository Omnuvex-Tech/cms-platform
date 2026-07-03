import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private async getAccessToken(): Promise<string> {
    const url = `https://login.microsoftonline.com/${process.env.GRAPH_TENANT_ID}/oauth2/v2.0/token`;

    const body = new URLSearchParams({
      client_id: process.env.GRAPH_CLIENT_ID!,
      client_secret: process.env.GRAPH_CLIENT_SECRET!,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    });

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Token alınmadı: ${JSON.stringify(data)}`);
    }

    return data.access_token;
  }

  private async sendMail(
    from: string,
    to: string,
    subject: string,
    html: string,
  ) {
    const token = await this.getAccessToken();

    const res = await fetch(
      `https://graph.microsoft.com/v1.0/users/${from}/sendMail`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            subject,
            body: { contentType: 'HTML', content: html },
            toRecipients: [{ emailAddress: { address: to } }],
          },
        }),
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => res.statusText);
      throw new Error(`Mail göndərilmədi: ${JSON.stringify(err)}`);
    }
  }

  async sendContactSubmission(data: {
    name: string;
    email: string;
    phone: string;
    service: string;
    budget: string;
    timeline: string;
    message: string;
    submittedAt: Date;
  }) {
    const from = 'we@trenders.team';
    const to = process.env.CONTACT_RECEIVER_EMAIL ?? 'we@trenders.team';

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <div style="padding:32px 40px;background:#0a0a0a;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:0.12em;color:#666;text-transform:uppercase;">Yeni müraciət</p>
      <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">${data.name}</h1>
      <p style="margin:6px 0 0;font-size:13px;color:#888;">${data.email}</p>
    </div>
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
    <div style="padding:20px 40px;background:#f9f9f9;border-top:1px solid #f0f0f0;">
      <span style="font-size:15px;font-weight:700;color:#0a0a0a;letter-spacing:-0.01em;">Trenders</span>
      <span style="font-size:11px;color:#aaa;float:right;">${data.submittedAt.toLocaleString('az-AZ')}</span>
    </div>
  </div>
</body>
</html>`;

    try {
      await this.sendMail(from, to, `Yeni müraciət — ${data.name}`, html);
      this.logger.log(`Contact mail göndərildi: ${to}`);
    } catch (err) {
      this.logger.error('Contact mail göndərilmədi', err);
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
    const from = 'hr@trenders.team';
    const to = process.env.HR_RECEIVER_EMAIL ?? 'hr@trenders.team';

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
    </div>`;

    try {
      await this.sendMail(
        from,
        to,
        `Vakansiya müraciəti: ${data.name}${data.vacancyTitle ? ` — ${data.vacancyTitle}` : ''}`,
        html,
      );
      this.logger.log(`Vakansiya mail göndərildi: ${to}`);
    } catch (err) {
      this.logger.error('Vakansiya mail göndərilmədi', err);
      throw err;
    }
  }
}