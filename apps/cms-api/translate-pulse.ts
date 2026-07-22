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
async function processLocalizedString(value: string | MultilingualObject): Promise<MultilingualObject> {
  // If it's already a multilingual object, just make sure it has all languages
  if (typeof value === 'object' && value !== null && value.az) {
    const result: MultilingualObject = { ...value };
    if (!result.en) {
      result.en = await translateText(result.az, 'en-US');
    }
    if (!result.ru) {
      result.ru = await translateText(result.az, 'ru');
    }
    return result;
  }
  // If it's a string, treat it as Azerbaijani and translate
  if (typeof value === 'string') {
    return {
      az: value,
      en: await translateText(value, 'en-US'),
      ru: await translateText(value, 'ru'),
    };
  }
  return value as MultilingualObject;
}

/**
 * Process and translate a Pulse block from AZ to EN and RU
 */
async function processBlock(block: PulseBlock): Promise<PulseBlock> {
  const processedBlock: PulseBlock = { ...block };

  // Translate text fields
  if (block.text) {
    processedBlock.text = await processLocalizedString(block.text);
  }

  // Translate list items
  if (block.items && Array.isArray(block.items)) {
    processedBlock.items = await Promise.all(
      block.items.map(item => processLocalizedString(item))
    );
  }

  // Translate alt text for images
  if (block.alt) {
    processedBlock.alt = await processLocalizedString(block.alt);
  }

  // Translate captions
  if (block.caption) {
    processedBlock.caption = await processLocalizedString(block.caption);
  }

  // Translate FAQ fields
  if (block.question) {
    processedBlock.question = await processLocalizedString(block.question);
  }
  if (block.answer) {
    processedBlock.answer = await processLocalizedString(block.answer);
  }

  // Translate quote author
  if (block.author) {
    processedBlock.author = await processLocalizedString(block.author);
  }

  // Translate gallery image alts
  if (block.images && Array.isArray(block.images)) {
    processedBlock.images = await Promise.all(
      block.images.map(async (img) => ({
        ...img,
        alt: img.alt ? await processLocalizedString(img.alt) : img.alt,
      }))
    );
  }

  return processedBlock;
}

async function main() {
  console.log('🚀 Starting Pulse articles translation...');

  // Fetch all Pulse articles
  const articles = await prisma.pulseArticle.findMany();
  console.log(`✅ Found ${articles.length} articles`);

  for (const article of articles) {
    console.log(`\n📄 Processing article: ${article.slug}`);
    const updateData: any = {};

    // Process title
    if (article.title) {
      updateData.title = await processLocalizedString(article.title as any);
      console.log('  ✅ Title translated');
    }

    // Process category
    if (article.category) {
      updateData.category = await processLocalizedString(article.category as any);
      console.log('  ✅ Category translated');
    }

    // Process excerpt
    if (article.excerpt) {
      updateData.excerpt = await processLocalizedString(article.excerpt as any);
      console.log('  ✅ Excerpt translated');
    }

    // Process metaTitle
    if (article.metaTitle) {
      updateData.metaTitle = await processLocalizedString(article.metaTitle as any);
      console.log('  ✅ Meta title translated');
    }

    // Process metaDescription
    if (article.metaDescription) {
      updateData.metaDescription = await processLocalizedString(article.metaDescription as any);
      console.log('  ✅ Meta description translated');
    }

    // Process blocks
    if (article.blocks && Array.isArray(article.blocks)) {
      const processedBlocks: PulseBlock[] = [];
      for (const block of article.blocks as PulseBlock[]) {
        const processed = await processBlock(block);
        processedBlocks.push(processed);
      }
      updateData.blocks = processedBlocks;
      console.log('  ✅ Blocks translated');
    }

    // Update the article in DB
    if (Object.keys(updateData).length > 0) {
      await prisma.pulseArticle.update({
        where: { id: article.id },
        data: updateData,
      });
      console.log(`  ✅ Article "${article.slug}" updated successfully!`);
    }
  }

  console.log('\n🎉 All Pulse articles translated successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
