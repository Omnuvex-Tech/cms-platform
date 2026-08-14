/**
 * The portfolio-teaser categories the bot understands.
 *
 * These are the exact strings the bot matches against a project's `tags` array
 * in projects_metadata.json (`_TEASER_CATEGORY_ORDER` in the bot's
 * graph/nodes/matching.py) when it builds the teaser: one project per category,
 * in this order, so the customer sees a spread of the portfolio. A tag outside
 * this list is stored fine but matches no category and therefore does nothing,
 * which is why the panel restricts the vocabulary instead of taking free text.
 *
 * Adding a category means changing it here AND in the bot's matching.py.
 * The web editor keeps its own copy of the same list (cms-web/lib/status.ts).
 */
export const PROJECT_TAGS = [
  'sea-front',
  'luxury',
  'branded',
  'family',
  'cost-performance',
  'investment',
] as const;

export type ProjectTag = (typeof PROJECT_TAGS)[number];
