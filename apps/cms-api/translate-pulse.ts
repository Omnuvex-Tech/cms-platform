import { PrismaClient } from '@prisma/client';
import * as deepl from 'deepl-node';
import * as dotenv from 'dotenv';

// Load environment variables from .env.development
dotenv.config({ path: '.env.development' });

const prisma = new PrismaClient();
const authKey = process.env.DEEPL_API_KEY; // Make sure to set this in .env.development!

if (!authKey) {
  console.error('❌ Please set DEEPL_API_KEY in .env.development');
  process.exit(1);
}

const translator = new deepl.Translator(authKey);

// Define type for Pulse block
type PulseBlock = {
  type: string;
  text?: string | { az: string; en?: string; ru?: string };
  items?: (string | { az: string; en?: string; ru?: string })[];
  alt?: string | { az: string; en?: string; ru?: string };
  caption?: string | { az: string; en?: string; ru?: string };
  question?: string | { az: string; en?: string; ru?: string };
  answer?: string | { az: string; en?: string; ru?: string };
  author?: string | { az: string; en?: string; ru?: string };
  images?: { url: string; alt?: string | { az: string; en?: string; ru?: string } }[];
  [key: string]: any;
};

// Define type for multilingual object (az, en, ru)
type MultilingualObject = {
  az: string;
  en?: string;
  ru?: string;
  [key: string]: any;
};

type ProcessResult<T> = {
  value: T;
  changed: boolean;
};

const missingOnly = process.argv.includes('--missing-only') || !process.argv.includes('--force');

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getSourceText(value: string | MultilingualObject): string {
  if (typeof value === 'string') {
    return normalizeText(value);
  }

  const candidates = [value.az, value.en, value.ru, ...Object.values(value)];
  for (const candidate of candidates) {
    const normalized = normalizeText(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return '';
}

function shouldTranslateLocale(source: string, current: unknown): boolean {
  const target = normalizeText(current);

  if (!source) {
    return false;
  }

  if (!missingOnly) {
    return true;
  }

  return !target || target === source;
}

/**
 * Translate text to target language using DeepL (auto-detects source language)
 */
async function translateText(text: string, targetLang: 'en-US' | 'ru'): Promise<string> {
  if (!text || text.trim() === '') {
    return text;
  }
  try {
    const result = await translator.translateText(text, null, targetLang);
    return result.text;
  } catch (error) {
    console.error(`❌ Translation error (text: "${text.substring(0, 50)}..."):`, error);
    return text; // Fallback to original if translation fails
  }
}

/**
 * Convert a string to a multilingual object and translate it
 */
async function processLocalizedString(value: string | MultilingualObject): Promise<ProcessResult<MultilingualObject>> {
  const source = getSourceText(value);
  const base: MultilingualObject =
    typeof value === 'object' && value !== null
      ? { ...value, az: normalizeText(value.az) || source }
      : { az: source };

  let changed = typeof value === 'string';

  if (shouldTranslateLocale(base.az, base.en)) {
    const translated = await translateText(base.az, 'en-US');
    if (translated !== base.en) {
      base.en = translated;
      changed = true;
    }
  }

  if (shouldTranslateLocale(base.az, base.ru)) {
    const translated = await translateText(base.az, 'ru');
    if (translated !== base.ru) {
      base.ru = translated;
      changed = true;
    }
  }

  return { value: base, changed };
}

/**
 * Process and translate a Pulse block from AZ to EN and RU
 */
async function processBlock(block: PulseBlock): Promise<ProcessResult<PulseBlock>> {
  const processedBlock: PulseBlock = { ...block };
  let changed = false;

  // Translate text fields
  if (block.text) {
    const result = await processLocalizedString(block.text);
    processedBlock.text = result.value;
    changed = changed || result.changed;
  }

  // Translate list items
  if (block.items && Array.isArray(block.items)) {
    const items = await Promise.all(block.items.map((item) => processLocalizedString(item)));
    processedBlock.items = items.map((item) => item.value);
    changed = changed || items.some((item) => item.changed);
  }

  // Translate alt text for images
  if (block.alt) {
    const result = await processLocalizedString(block.alt);
    processedBlock.alt = result.value;
    changed = changed || result.changed;
  }

  // Translate captions
  if (block.caption) {
    const result = await processLocalizedString(block.caption);
    processedBlock.caption = result.value;
    changed = changed || result.changed;
  }

  // Translate FAQ fields
  if (block.question) {
    const result = await processLocalizedString(block.question);
    processedBlock.question = result.value;
    changed = changed || result.changed;
  }
  if (block.answer) {
    const result = await processLocalizedString(block.answer);
    processedBlock.answer = result.value;
    changed = changed || result.changed;
  }

  // Translate quote author
  if (block.author) {
    const result = await processLocalizedString(block.author);
    processedBlock.author = result.value;
    changed = changed || result.changed;
  }

  // Translate gallery image alts
  if (block.images && Array.isArray(block.images)) {
    const images = await Promise.all(
      block.images.map(async (img) => {
        if (!img.alt) {
          return { value: img, changed: false };
        }

        const result = await processLocalizedString(img.alt);
        return {
          value: {
            ...img,
            alt: result.value,
          },
          changed: result.changed,
        };
      }),
    );
    processedBlock.images = images.map((img) => img.value);
    changed = changed || images.some((img) => img.changed);
  }

  return { value: processedBlock, changed };
}

async function main() {
  console.log(`🚀 Starting Pulse articles translation (${missingOnly ? 'missing-only mode' : 'force mode'})...`);

  // Fetch all Pulse articles
  const articles = await prisma.pulseArticle.findMany();
  console.log(`✅ Found ${articles.length} articles`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const article of articles) {
    console.log(`\n📄 Processing article: ${article.slug}`);
    const updateData: any = {};
    let articleChanged = false;

    // Process title
    if (article.title) {
      const result = await processLocalizedString(article.title as any);
      if (result.changed) {
        updateData.title = result.value;
        articleChanged = true;
        console.log('  ✅ Title translated');
      } else {
        console.log('  ⏭️ Title skipped');
      }
    }

    // Process category
    if (article.category) {
      const result = await processLocalizedString(article.category as any);
      if (result.changed) {
        updateData.category = result.value;
        articleChanged = true;
        console.log('  ✅ Category translated');
      } else {
        console.log('  ⏭️ Category skipped');
      }
    }

    // Process excerpt
    if (article.excerpt) {
      const result = await processLocalizedString(article.excerpt as any);
      if (result.changed) {
        updateData.excerpt = result.value;
        articleChanged = true;
        console.log('  ✅ Excerpt translated');
      } else {
        console.log('  ⏭️ Excerpt skipped');
      }
    }

    // Process metaTitle
    if (article.metaTitle) {
      const result = await processLocalizedString(article.metaTitle as any);
      if (result.changed) {
        updateData.metaTitle = result.value;
        articleChanged = true;
        console.log('  ✅ Meta title translated');
      } else {
        console.log('  ⏭️ Meta title skipped');
      }
    }

    // Process metaDescription
    if (article.metaDescription) {
      const result = await processLocalizedString(article.metaDescription as any);
      if (result.changed) {
        updateData.metaDescription = result.value;
        articleChanged = true;
        console.log('  ✅ Meta description translated');
      } else {
        console.log('  ⏭️ Meta description skipped');
      }
    }

    // Process blocks
    if (article.blocks && Array.isArray(article.blocks)) {
      const processedBlocks: PulseBlock[] = [];
      let blocksChanged = false;
      for (const block of article.blocks as PulseBlock[]) {
        const processed = await processBlock(block);
        processedBlocks.push(processed.value);
        blocksChanged = blocksChanged || processed.changed;
      }

      if (blocksChanged) {
        updateData.blocks = processedBlocks;
        articleChanged = true;
        console.log('  ✅ Blocks translated');
      } else {
        console.log('  ⏭️ Blocks skipped');
      }
    }

    // Update the article in DB
    if (articleChanged && Object.keys(updateData).length > 0) {
      await prisma.pulseArticle.update({
        where: { id: article.id },
        data: updateData,
      });
      console.log(`  ✅ Article "${article.slug}" updated successfully!`);
      updatedCount += 1;
    } else {
      console.log(`  ⏭️ Article "${article.slug}" already translated, skipped`);
      skippedCount += 1;
    }
  }

  console.log(`\n🎉 Pulse translation finished. Updated: ${updatedCount}, skipped: ${skippedCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
