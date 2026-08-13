import {
  BedroomPricing,
  InternationalPlanTier,
  Project,
  StandardPaymentPlan,
  TrevaInfoSection,
} from '@prisma/client';

/**
 * Maps a panel Project into the shape the treva_sales_bot keeps in its
 * file-based knowledge base, so the (future) bot-side receiver can write it
 * near-verbatim into its KB files:
 *
 *   metadata        -> knowledge_base/projects_metadata.json[name]
 *   description      -> knowledge_base/projects_description/<name>.md sections
 *   bedroom_pricing  -> knowledge_base/bedroom_pricing.json[name]
 *   payment_plans    -> knowledge_base/payment_plans.json[name]
 *
 * The transform is deliberately snake_case and mirrors those file schemas
 * (verified against the bot repo). Payment-plan reconstruction from the panel's
 * flat rows is best-effort — the bot remains the final authority on its own file
 * shape and is free to further normalise what it receives.
 */

export type ProjectWithChildren = Project & {
  bedroomPricing: BedroomPricing[];
  standardPlans: StandardPaymentPlan[];
  internationalTiers: InternationalPlanTier[];
};

export type BotSyncOp = 'upsert' | 'delete';

export interface BotSyncPayload {
  op: BotSyncOp;
  /** Schema version so the bot side can evolve the contract safely. */
  version: 1;
  project: BotProject;
}

export interface BotProject {
  /** Panel's stable Project.id (autoincrement Int). Lets the bot-side receiver
   * track identity across a name/slug edit deterministically instead of
   * guessing from the (user-editable) name/slug alone. */
  id: number;
  name: string;
  slug: string | null;
  status: string;
  metadata: BotProjectMetadata;
  description: BotProjectDescription;
  bedroom_pricing: BotBedroomPricing;
  payment_plans: BotPaymentPlans;
}

interface BotProjectMetadata {
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  price_per_sqm_min: number | null;
  price_per_sqm_max: number | null;
  area_min_sqm: number | null;
  area_max_sqm: number | null;
  price_total_min: number | null;
  price_total_max: number | null;
  payment_plan: boolean;
  ready_to_move_in: boolean;
  completion_year: number | null;
  handover_condition: string | null;
  /** Teaser categories. `null` (never `[]`) when the panel has none — see
   * projectToBotPayload. */
  tags: string[] | null;
  audience: string | null;
}

interface BotProjectDescription {
  about_project: string | null;
  advantages: string | null;
  target_audience: string | null;
  investment_advantages: string | null;
  services: string | null;
}

interface BotBedroomRow {
  bedroom_key: string;
  label: string;
  area_min: number | null;
  area_max: number | null;
  price_min: number | null;
  price_max: number | null;
}

interface BotBedroomPricing {
  by_bedroom: BotBedroomRow[];
}

interface BotPaymentPlans {
  standard_plans: Record<string, Record<string, number>>;
  international_plan: Record<string, unknown> & { available: boolean };
  bulk_discount: { available: boolean };
}

/**
 * Derive the bot's `bedroom_key` ("studio" / "1" / "2" …) from a free-text
 * label like "2 bedroom" or "Studio". Falls back to a slug of the label so an
 * unusual unit type still gets a stable key rather than being dropped.
 */
export function bedroomKeyFromLabel(label: string): string {
  const s = (label ?? '').trim().toLowerCase();
  if (s.includes('studio')) return 'studio';
  const m = s.match(/\d+/);
  if (m) return m[0];
  return s.replace(/\s+/g, '_') || 'unknown';
}

function mapBedroomPricing(rows: BedroomPricing[]): BotBedroomPricing {
  const by_bedroom = [...rows]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((r) => ({
      bedroom_key: bedroomKeyFromLabel(r.label),
      label: r.label,
      area_min: r.areaMin ?? null,
      area_max: r.areaMax ?? null,
      price_min: r.priceMin ?? null,
      price_max: r.priceMax ?? null,
    }));
  return { by_bedroom };
}

/**
 * Rebuild the bot's `standard_plans` object from the panel's flat rows. The bot
 * keys plans by down-payment percent; a full-payment row (no installment
 * months) becomes `{ discount }`, an installment row becomes `{ <months>:
 * <discount> }`, and rows sharing a down-payment percent are merged.
 */
function mapStandardPlans(
  rows: StandardPaymentPlan[],
): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    const key = String(r.downPaymentPct ?? 100);
    const bucket = (out[key] ??= {});
    if (r.installmentMonths != null) {
      if (r.discountPct != null) bucket[String(r.installmentMonths)] = r.discountPct;
    } else if (r.discountPct != null) {
      bucket.discount = r.discountPct;
    }
    // The panel's optional "option discount" has no native slot in the bot's
    // schema; preserve it under a clearly-named extra key (the bot ignores
    // unknown keys) rather than silently dropping it.
    if (r.optionDiscountPct != null) bucket.option_discount = r.optionDiscountPct;
  }
  return out;
}

function mapInternationalPlan(
  rows: InternationalPlanTier[],
): Record<string, unknown> & { available: boolean } {
  const plan: Record<string, unknown> & { available: boolean } = {
    available: rows.length > 0,
  };
  for (const r of rows) {
    const key = String(r.downPaymentPct ?? 100);
    const tier: Record<string, number> = {};
    if (r.discountPct != null) tier.discount = r.discountPct;
    if (r.interestFreeMonths != null) tier.interest_free_months = r.interestFreeMonths;
    plan[key] = tier;
  }
  return plan;
}

export function projectToBotPayload(
  project: ProjectWithChildren,
  op: BotSyncOp,
): BotSyncPayload {
  return {
    op,
    version: 1,
    project: {
      id: project.id,
      name: project.name,
      slug: project.slug ?? null,
      status: project.status,
      metadata: {
        location: project.location ?? null,
        latitude: project.latitude ?? null,
        longitude: project.longitude ?? null,
        price_per_sqm_min: project.pricePerM2Min ?? null,
        price_per_sqm_max: project.pricePerM2Max ?? null,
        area_min_sqm: project.areaMin ?? null,
        area_max_sqm: project.areaMax ?? null,
        price_total_min: project.totalPriceMin ?? null,
        price_total_max: project.totalPriceMax ?? null,
        payment_plan: project.paymentPlanAvailable,
        ready_to_move_in: project.readyToMoveIn,
        completion_year: project.completionYear ?? null,
        handover_condition: project.handoverCondition ?? null,
        // `tags`/`audience` are the two keys the bot treats as curated: it
        // carries forward its existing value when we send null, and takes ours
        // when we send anything else. So an untagged panel project must send
        // null, NOT [] — [] would win and wipe the bot's curation, dropping the
        // teaser back to dumping the whole catalogue.
        tags: project.tags.length > 0 ? project.tags : null,
        audience: project.audience ?? null,
      },
      description: {
        about_project: project.aboutProject ?? null,
        advantages: project.advantages ?? null,
        target_audience: project.targetAudience ?? null,
        investment_advantages: project.investmentAdvantages ?? null,
        services: project.services ?? null,
      },
      bedroom_pricing: mapBedroomPricing(project.bedroomPricing),
      payment_plans: {
        standard_plans: mapStandardPlans(project.standardPlans),
        international_plan: mapInternationalPlan(project.internationalTiers),
        bulk_discount: { available: project.bulkDiscountAvailable },
      },
    },
  };
}

/**
 * Maps the panel's TREVA Information sections into the shape the bot's
 * about_treva.md knowledge-base file is built from: an ordered list of
 * `## heading` / markdown-body pairs. Mirrors projectToBotPayload's contract
 * so a future bot-side receiver can write it back into that file near-verbatim.
 */
export interface BotInfoSection {
  heading: string;
  content: string;
}

export interface BotInfoPayload {
  version: 1;
  sections: BotInfoSection[];
}

export function trevaInfoToBotPayload(
  sections: TrevaInfoSection[],
): BotInfoPayload {
  return {
    version: 1,
    sections: [...sections]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => ({ heading: s.heading, content: s.content })),
  };
}
