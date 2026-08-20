import { Injectable, Logger } from '@nestjs/common';

// "Website" lead status in Bitrix24 CRM (treva.bitrix24.ru). This numeric
// code was assigned by Bitrix24 when the status was created through the
// UI — if that status is ever deleted and recreated it will get a new
// code. Re-check via crm.status.list (filter ENTITY_ID=STATUS) if leads
// stop landing in the "Website" stage.
const WEBSITE_STATUS_ID = '9';

// Bitrix24 CRM source directory (ENTITY_ID=SOURCE) codes for the website
// CTAs. Re-check via crm.status.list (filter ENTITY_ID=SOURCE) if these
// ever change in Bitrix24.
export const BITRIX_SOURCE = {
  CUSTOMER: '34', // "Web Site - Customer"
  BROKER: '35',   // "Web Site - Broker"
  DEVELOPER: '36', // "Web Site - Developer"
} as const;

export interface BitrixLeadInput {
  name: string;
  phone?: string;
  email?: string;
  comments?: string;
  /** Which CTA this lead came from, e.g. "Callback request", "Contact form". */
  sourceDescription: string;
  /** Bitrix24 SOURCE_ID code — one of BITRIX_SOURCE. Defaults to CUSTOMER. */
  sourceId?: string;
}

/**
 * Sends website CTA submissions to Bitrix24 as CRM leads.
 *
 * Every call is fire-and-forget safe: this never throws, so callers can
 * invoke it without awaiting (or await it without try/catch) and it will
 * never fail or slow down the CTA's own response to the user.
 */
@Injectable()
export class BitrixService {
  private readonly logger = new Logger(BitrixService.name);

  async createLead(input: BitrixLeadInput): Promise<number | null> {
    const webhook = process.env.BITRIX_WEBHOOK_URL;

    if (!webhook) {
      this.logger.warn('BITRIX_WEBHOOK_URL is not set — skipping Bitrix sync');
      return null;
    }

    try {
      const res = await fetch(`${webhook}crm.lead.add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            TITLE: `Website lead – ${input.name}`,
            NAME: input.name,
            EMAIL: input.email ? [{ VALUE: input.email, VALUE_TYPE: 'WORK' }] : [],
            PHONE: input.phone ? [{ VALUE: input.phone, VALUE_TYPE: 'WORK' }] : [],
            COMMENTS: input.comments || '',
            STATUS_ID: WEBSITE_STATUS_ID,
            SOURCE_ID: input.sourceId || BITRIX_SOURCE.CUSTOMER,
            SOURCE_DESCRIPTION: input.sourceDescription,
          },
          params: { REGISTER_SONET_EVENT: 'Y' },
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        this.logger.error(
          `Bitrix24 lead creation failed (${input.sourceDescription}): ${data.error_description ?? res.statusText}`,
        );
        return null;
      }

      this.logger.log(`Bitrix24 lead #${data.result} created (${input.sourceDescription})`);
      return data.result as number;
    } catch (err) {
      // Never let a Bitrix outage break the CTA's own response.
      this.logger.error(`Bitrix24 request failed (${input.sourceDescription})`, err as Error);
      return null;
    }
  }
}
