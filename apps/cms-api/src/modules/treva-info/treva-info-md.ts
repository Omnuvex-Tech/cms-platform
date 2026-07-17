import * as fs from 'fs';
import * as path from 'path';

/**
 * Writes the panel's TrevaInfoSection rows back to the bot's
 * about_treva.md knowledge-base file. The admin panel is the single source
 * of truth for TREVA Information; every section add/edit/delete regenerates
 * this file so the bot's file-based knowledge base never drifts from what's
 * in the panel (mirrors import-treva-info.ts's read direction, in reverse).
 *
 * Override the file location with TREVA_INFO_MD_PATH if it isn't a sibling
 * of this repo under the same parent directory, or if process.cwd() isn't
 * apps/cms-api (e.g. a production deployment without filesystem access to
 * the bot repo — in that case, leave the var unset and set it to a path
 * that doesn't exist; writes fail safe and are logged, never thrown).
 */
const MD_PATH =
  process.env.TREVA_INFO_MD_PATH ??
  path.resolve(
    process.cwd(),
    '../../../../treva_sales_bot/knowledge_base/about_treva.md',
  );

const TITLE = '# TREVA Real Estate — About';

interface SectionLike {
  heading: string;
  content: string;
  sortOrder: number;
}

export function renderAboutTrevaMd(sections: SectionLike[]): string {
  const ordered = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);
  const body = ordered
    .map((s) => `## ${s.heading}\n\n${s.content.trim()}`)
    .join('\n\n---\n\n');
  return `${TITLE}\n\n${body}\n`;
}

export interface WriteResult {
  ok: boolean;
  path: string;
  error?: string;
}

/** Regenerates about_treva.md from the given sections. Never throws. */
export function writeAboutTrevaMd(sections: SectionLike[]): WriteResult {
  try {
    fs.writeFileSync(MD_PATH, renderAboutTrevaMd(sections), 'utf-8');
    return { ok: true, path: MD_PATH };
  } catch (err) {
    return {
      ok: false,
      path: MD_PATH,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
