/**
 * One-time backfill: import the treva_sales_bot's REAL, currently-live project
 * catalog into the panel's Postgres DB.
 *
 * Why this exists: the panel's `seed.ts` used to only create 4 fictional demo
 * projects (Port Baku Residence, White City Boulevard, Crescent Bay, Sea
 * Breeze Resort) for local dev fixtures — none of them were what the bot
 * actually quotes to customers. The bot's real catalog (6 projects: Reportage
 * Heights, Arabian Ranches, Marina Village, Panorama by ELIE SAAB, BRABUS
 * ISLAND, Sabah Towers) lives only in its file-based knowledge base and was
 * never in this database. This script reads those files directly and
 * upserts them here so the panel reflects reality.
 *
 * This is the REVERSE of the panel -> bot push built in bot-sync.mapper.ts.
 * Going forward the panel is the source of truth (edits push to the bot via
 * bot-sync); this script is a one-time bootstrap, not a live sync — safe to
 * re-run (upserts by slug). `seed.ts` no longer touches the projects table at
 * all (demo project fixtures were removed from it), so re-seeding never
 * erases what this script imports.
 *
 * Usage: npx ts-node import-bot-projects.ts
 * Override the bot repo location with BOT_KB_DIR if it isn't a sibling of
 * this repo under the same parent directory.
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

const BOT_KB_DIR =
  process.env.BOT_KB_DIR ??
  path.resolve(__dirname, '../../../../treva_sales_bot/knowledge_base');

// Bot's canonical project keys (shared across the 3 JSON files) -> the
// filename of its description markdown. Filenames don't follow a mechanical
// slugify of the name (e.g. "Panorama by ELIE SAAB" -> panorama_ellie_saab.md),
// so this is hand-mapped against what's actually in the bot repo today.
const DESCRIPTION_FILES: Record<string, string> = {
  'Reportage Heights': 'reportage_heights.md',
  'Arabian Ranches': 'arabian_ranches.md',
  'Marina Village': 'marina_village.md',
  'Panorama by ELIE SAAB': 'panorama_ellie_saab.md',
  'BRABUS ISLAND': 'brabus_island.md',
  'Sabah Towers': 'sabah_towers.md',
};

interface BedroomRow {
  label: string;
  areaMin: number | null;
  areaMax: number | null;
  priceMin: number | null;
  priceMax: number | null;
  note: string | null;
  sortOrder: number;
}

interface StandardPlanRow {
  downPaymentPct: number;
  discountPct: number | null;
  installmentMonths: number | null;
  optionDiscountPct: number | null;
  sortOrder: number;
}

interface InternationalTierRow {
  downPaymentPct: number;
  discountPct: number | null;
  interestFreeMonths: number | null;
  sortOrder: number;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Splits a project's description markdown into its `## ` sections. */
function parseSections(md: string): Record<string, string> {
  const sections: Record<string, string> = {};
  let current: string | null = null;
  let buffer: string[] = [];
  const flush = () => {
    if (current) sections[current] = buffer.join('\n').trim();
    buffer = [];
  };
  for (const line of md.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.*)$/);
    if (heading) {
      flush();
      current = heading[1].trim();
      continue;
    }
    if (/^#\s+/.test(line) || line.trim() === '---') continue; // title / hr
    if (current) buffer.push(line);
  }
  flush();
  return sections;
}

function readDescription(name: string): {
  aboutProject: string | null;
  advantages: string | null;
  targetAudience: string | null;
  investmentAdvantages: string | null;
  services: string | null;
} {
  const file = DESCRIPTION_FILES[name];
  const filePath = path.join(BOT_KB_DIR, 'projects_description', file);
  const md = fs.readFileSync(filePath, 'utf-8');
  const s = parseSections(md);
  return {
    aboutProject: s['About Project'] || null,
    advantages: s['Project Advantages'] || null,
    targetAudience: s['Target Audience'] || null,
    investmentAdvantages: s['Investment Advantages'] || null,
    services: s['Services'] || null,
  };
}

function mapBedroomPricing(raw: any): BedroomRow[] {
  const rows: (Record<string, any>)[] = raw?.by_bedroom ?? [];
  return rows.map((r, i) => ({
    label: r.label,
    areaMin: r.area_min ?? null,
    areaMax: r.area_max ?? null,
    priceMin: r.price_min ?? null,
    priceMax: r.price_max ?? null,
    // per_sqm_note is a project-level caveat with no per-row home in the
    // schema; attach it to the first row so it isn't silently lost.
    note: i === 0 && raw?.per_sqm_note ? raw.per_sqm_note : null,
    sortOrder: i,
  }));
}

/**
 * Inverse of bot-sync.mapper's mapStandardPlans. The bot's "100" key is
 * always a one-time full-payment row (never has installment months); every
 * other key is an object keyed by installment months, whose value is either
 * a plain discount number or `{ discount, hos_bonus_max }`.
 *
 * `hos_bonus_max` (a bonus-installment count, not a percentage) has no slot
 * in the panel's StandardPaymentPlan schema and is intentionally dropped —
 * documented here rather than mis-mapped into optionDiscountPct.
 */
function mapStandardPlans(raw: Record<string, any> | undefined): StandardPlanRow[] {
  if (!raw) return [];
  const rows: StandardPlanRow[] = [];
  let sortOrder = 0;
  for (const [pctKey, val] of Object.entries(raw)) {
    const downPaymentPct = Number(pctKey);
    if (pctKey === '100') {
      rows.push({
        downPaymentPct,
        discountPct: val?.discount ?? null,
        installmentMonths: null,
        optionDiscountPct: null,
        sortOrder: sortOrder++,
      });
      continue;
    }
    for (const [monthKey, monthVal] of Object.entries(val as Record<string, any>)) {
      const discountPct = typeof monthVal === 'number' ? monthVal : (monthVal?.discount ?? null);
      rows.push({
        downPaymentPct,
        discountPct,
        installmentMonths: Number(monthKey),
        optionDiscountPct: null,
        sortOrder: sortOrder++,
      });
    }
  }
  return rows;
}

/** Inverse of mapInternationalPlan. The "note" key has no schema slot and is dropped. */
function mapInternationalPlan(raw: Record<string, any> | undefined): InternationalTierRow[] {
  if (!raw?.available) return [];
  const rows: InternationalTierRow[] = [];
  let sortOrder = 0;
  for (const [key, val] of Object.entries(raw)) {
    if (key === 'available' || key === 'note') continue;
    rows.push({
      downPaymentPct: Number(key),
      discountPct: (val as any)?.discount ?? null,
      interestFreeMonths: (val as any)?.interest_free_months ?? null,
      sortOrder: sortOrder++,
    });
  }
  return rows;
}

async function main() {
  console.log(`Reading bot knowledge base from: ${BOT_KB_DIR}`);
  const metadata = JSON.parse(
    fs.readFileSync(path.join(BOT_KB_DIR, 'projects_metadata.json'), 'utf-8'),
  ) as Record<string, any>;
  const bedroomPricing = JSON.parse(
    fs.readFileSync(path.join(BOT_KB_DIR, 'bedroom_pricing.json'), 'utf-8'),
  ) as Record<string, any>;
  const paymentPlans = JSON.parse(
    fs.readFileSync(path.join(BOT_KB_DIR, 'payment_plans.json'), 'utf-8'),
  ) as Record<string, any>;

  const names = Object.keys(metadata);
  console.log(`Found ${names.length} live projects in the bot: ${names.join(', ')}`);

  for (const name of names) {
    const m = metadata[name];
    const slug = slugify(name);
    const description = readDescription(name);
    const plans = paymentPlans[name];

    const data = {
      name,
      slug,
      status: ProjectStatus.published, // already live in the bot / customer-facing
      location: m.location ?? null,
      latitude: m.latitude ?? null,
      longitude: m.longitude ?? null,
      ...description,
      pricePerM2Min: m.price_per_sqm_min ?? null,
      pricePerM2Max: m.price_per_sqm_max ?? null,
      areaMin: m.area_min_sqm ?? null,
      areaMax: m.area_max_sqm ?? null,
      totalPriceMin: m.price_total_min ?? null,
      totalPriceMax: m.price_total_max ?? null,
      readyToMoveIn: !!m.ready_to_move_in,
      completionYear: m.completion_year ?? null,
      handoverCondition: m.handover_condition ?? null,
      paymentPlanAvailable: !!m.payment_plan,
      bulkDiscountAvailable: !!plans?.bulk_discount?.available,
    };

    const bedroomRows = mapBedroomPricing(bedroomPricing[name]);
    const standardRows = mapStandardPlans(plans?.standard_plans);
    const intlRows = mapInternationalPlan(plans?.international_plan);

    if (process.env.DRY_RUN === '1') {
      console.log(`\n--- DRY RUN: ${name} (slug: ${slug}) ---`);
      console.log(JSON.stringify({ data, bedroomRows, standardRows, intlRows }, null, 1));
      continue;
    }

    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) {
      await prisma.$transaction([
        prisma.bedroomPricing.deleteMany({ where: { projectId: existing.id } }),
        prisma.standardPaymentPlan.deleteMany({ where: { projectId: existing.id } }),
        prisma.internationalPlanTier.deleteMany({ where: { projectId: existing.id } }),
      ]);
      await prisma.project.update({
        where: { id: existing.id },
        data: {
          ...data,
          bedroomPricing: bedroomRows.length ? { create: bedroomRows } : undefined,
          standardPlans: standardRows.length ? { create: standardRows } : undefined,
          internationalTiers: intlRows.length ? { create: intlRows } : undefined,
        },
      });
      console.log(`Updated: ${name} (${bedroomRows.length} bedroom rows, ${standardRows.length} standard-plan rows, ${intlRows.length} international-tier rows)`);
    } else {
      await prisma.project.create({
        data: {
          ...data,
          bedroomPricing: bedroomRows.length ? { create: bedroomRows } : undefined,
          standardPlans: standardRows.length ? { create: standardRows } : undefined,
          internationalTiers: intlRows.length ? { create: intlRows } : undefined,
        },
      });
      console.log(`Created: ${name} (${bedroomRows.length} bedroom rows, ${standardRows.length} standard-plan rows, ${intlRows.length} international-tier rows)`);
    }
  }

  console.log(`\n✅ Imported ${names.length} live bot projects into the panel.`);
}

main()
  .catch((e) => {
    console.error('Import error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
