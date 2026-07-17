/**
 * One-time backfill: import the treva_sales_bot's REAL about_treva.md
 * knowledge-base file into the panel's Postgres DB as TrevaInfoSection rows.
 *
 * Why this exists: the panel's `seed.ts` used to seed the "TREVA Information"
 * page with fictional placeholder copy (mission/vision/etc.) that was never
 * what the bot actually tells customers — the real company info lived only
 * in about_treva.md and was never in this database. This script reads that
 * file directly and upserts it here so the panel reflects reality.
 *
 * This is the same pattern as import-bot-projects.ts. Going forward the
 * panel is the source of truth (edits push to the bot via
 * BOT_INFO_WEBHOOK_URL, see bot-sync.service.ts); this script is a one-time
 * bootstrap, not a live sync — safe to re-run (replaces all sections).
 * `seed.ts` no longer touches the treva_info table at all, so re-seeding
 * never erases what this script imports.
 *
 * Usage: npx ts-node import-treva-info.ts
 * Override the file location with TREVA_INFO_MD_PATH if it isn't a sibling
 * of this repo under the same parent directory.
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MD_PATH =
  process.env.TREVA_INFO_MD_PATH ??
  path.resolve(
    __dirname,
    '../../../../treva_sales_bot/knowledge_base/about_treva.md',
  );

interface ParsedSection {
  heading: string;
  content: string;
}

/** Splits the markdown into its `## ` sections, keeping `### ` subheadings inline in the body. */
function parseSections(md: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  let current: string | null = null;
  let buffer: string[] = [];
  const flush = () => {
    if (current) sections.push({ heading: current, content: buffer.join('\n').trim() });
    buffer = [];
  };
  for (const line of md.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.*)$/);
    if (heading) {
      flush();
      current = heading[1].trim();
      continue;
    }
    if (/^#\s+/.test(line)) continue; // document title
    if (line.trim() === '---') continue; // hr
    if (current) buffer.push(line);
  }
  flush();
  return sections;
}

async function main() {
  console.log(`Reading TREVA Information from: ${MD_PATH}`);
  const md = fs.readFileSync(MD_PATH, 'utf-8');
  const sections = parseSections(md);
  console.log(
    `Found ${sections.length} sections: ${sections.map((s) => s.heading).join(', ')}`,
  );

  if (process.env.DRY_RUN === '1') {
    console.log(JSON.stringify(sections, null, 1));
    return;
  }

  const record =
    (await prisma.trevaInfo.findFirst({ orderBy: { id: 'asc' } })) ??
    (await prisma.trevaInfo.create({ data: {} }));

  await prisma.$transaction([
    prisma.trevaInfoSection.deleteMany({ where: { trevaInfoId: record.id } }),
    ...sections.map((s, i) =>
      prisma.trevaInfoSection.create({
        data: {
          trevaInfoId: record.id,
          heading: s.heading,
          content: s.content,
          sortOrder: i,
        },
      }),
    ),
  ]);

  console.log(`\n✅ Imported ${sections.length} TREVA Information sections into the panel.`);
}

main()
  .catch((e) => {
    console.error('Import error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
