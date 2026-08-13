/**
 * One-time backfill of the two curated teaser fields — `tags` and `audience` —
 * from the bot's knowledge base into the panel's DB.
 *
 * Why a separate script from import-bot-projects.ts: that one rebuilds a whole
 * project (pricing, plans, descriptions) from the bot's files and would undo any
 * panel edits made since. This touches nothing but the two new columns, so it is
 * safe to run against a live panel.
 *
 * Run it BEFORE anyone publishes a project through the panel: until a project
 * has tags here, the panel sends null and the bot keeps carrying its own value
 * forward, so nothing breaks either way — but once these are in the DB the panel
 * is the source of truth and the two sides agree.
 *
 * Usage: npm run backfill:project-tags     (DRY_RUN=1 to preview)
 * Override the bot repo location with BOT_KB_DIR if it isn't a sibling of this
 * repo under the same parent directory.
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient, ProjectAudience } from '@prisma/client';
import { PROJECT_TAGS } from './src/modules/projects/project-tags';

const prisma = new PrismaClient();

const BOT_KB_DIR =
  process.env.BOT_KB_DIR ??
  path.resolve(__dirname, '../../../../treva_sales_bot/knowledge_base');

const AUDIENCES = new Set<string>(Object.values(ProjectAudience));
const KNOWN_TAGS = new Set<string>(PROJECT_TAGS);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log(`Reading bot knowledge base from: ${BOT_KB_DIR}`);
  const metadata = JSON.parse(
    fs.readFileSync(path.join(BOT_KB_DIR, 'projects_metadata.json'), 'utf-8'),
  ) as Record<string, { tags?: unknown; audience?: unknown }>;

  let updated = 0;
  let skipped = 0;

  for (const [name, m] of Object.entries(metadata)) {
    const raw = Array.isArray(m.tags) ? m.tags.map((t) => String(t).trim().toLowerCase()) : [];
    // A tag the panel's vocabulary doesn't cover would fail DTO validation on
    // the next edit, so it's dropped here loudly rather than written and stuck.
    const tags = raw.filter((t) => KNOWN_TAGS.has(t));
    for (const t of raw.filter((t) => !KNOWN_TAGS.has(t))) {
      console.warn(`  ! ${name}: dropping unknown tag "${t}" (not in PROJECT_TAGS)`);
    }

    const rawAudience = String(m.audience ?? '').trim().toLowerCase();
    const audience = AUDIENCES.has(rawAudience)
      ? (rawAudience as ProjectAudience)
      : null;
    if (rawAudience && !audience) {
      console.warn(`  ! ${name}: dropping unknown audience "${rawAudience}"`);
    }

    // Match the way import-bot-projects.ts stored these projects (slug), then
    // fall back to the name for anything created by hand in the panel.
    const project =
      (await prisma.project.findUnique({ where: { slug: slugify(name) } })) ??
      (await prisma.project.findFirst({ where: { name } }));

    if (!project) {
      console.log(`Skipped: ${name} — no matching project in the panel`);
      skipped++;
      continue;
    }

    if (process.env.DRY_RUN === '1') {
      console.log(
        `DRY RUN: ${name} (#${project.id}) -> tags=[${tags.join(', ')}] audience=${audience ?? '—'}`,
      );
      continue;
    }

    await prisma.project.update({
      where: { id: project.id },
      data: { tags, audience },
    });
    console.log(
      `Updated: ${name} (#${project.id}) -> tags=[${tags.join(', ')}] audience=${audience ?? '—'}`,
    );
    updated++;
  }

  console.log(`\n✅ Backfilled ${updated} project(s), skipped ${skipped}.`);
}

main()
  .catch((e) => {
    console.error('Backfill error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
