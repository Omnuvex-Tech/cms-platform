import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Pulse CMS (multilingual seed — 6 articles)...');

  // ── Categories ──────────────────────────────────────────
  const pulseCategories = [
    { name: { az: 'Bloq', en: 'Blog', ru: 'Блог' }, slug: 'bloq' },
    { name: { az: 'Kampaniya', en: 'Campaign', ru: 'Кампания' }, slug: 'kampaniya' },
    { name: { az: 'Tədbir', en: 'Event', ru: 'Событие' }, slug: 'tedbir' },
    { name: { az: 'Analizlər', en: 'Analysis', ru: 'Анализы' }, slug: 'analizler' },
    { name: { az: 'Xəbərlər', en: 'News', ru: 'Новости' }, slug: 'xebərlər' },
  ];
  for (const cat of pulseCategories) {
    await prisma.pulseCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
  }
  console.log('✅ Pulse categories seeded');

  // ── Authors ──────────────────────────────────────────
  const AUTHORS_DATA = [
    { name: { az: 'Emil Qurbanov', en: 'Emil Qurbanov', ru: 'Emil Qurbanov' }, slug: 'emil-qurbanov', title: { az: 'Satış üzrə Menecer', en: 'Satış üzrə Menecer', ru: 'Satış üzrə Menecer' } },
    { name: { az: 'Cavid Axundov', en: 'Cavid Axundov', ru: 'Cavid Axundov' }, slug: 'cavid-axundov', title: { az: 'Menecer', en: 'Menecer', ru: 'Menecer' } },
    { name: { az: 'Nəzrin Kərimli', en: 'Nəzrin Kərimli', ru: 'Nəzrin Kərimli' }, slug: 'nezrin-kerimli', title: { az: 'Menecer', en: 'Menecer', ru: 'Menecer' } },
    { name: { az: 'Türkan Mamedova', en: 'Türkan Mamedova', ru: 'Türkan Mamedova' }, slug: 'turkan-mamedova', title: { az: 'Menecer', en: 'Menecer', ru: 'Menecer' } },
    { name: { az: 'Leyla Bağırzadə', en: 'Leyla Bağırzadə', ru: 'Leyla Bağırzadə' }, slug: 'leyla-bagirzade', title: { az: 'Menecer', en: 'Menecer', ru: 'Menecer' } },
    { name: { az: 'Tural Nəcəfov', en: 'Tural Nəcəfov', ru: 'Tural Nəcəfov' }, slug: 'tural-necfov', title: { az: 'Menecer', en: 'Menecer', ru: 'Menecer' } },
    { name: { az: 'Səbinə Muxtarova', en: 'Səbinə Muxtarova', ru: 'Səbinə Muxtarova' }, slug: 'sebine-muxtarova', title: { az: 'Menecer', en: 'Menecer', ru: 'Menecer' } },
    { name: { az: 'Batula Mohubbi', en: 'Batula Mohubbi', ru: 'Batula Mohubbi' }, slug: 'batula-mohubbi', title: { az: 'Menecer', en: 'Menecer', ru: 'Menecer' } },
    { name: { az: 'İlhamə Paşazadə', en: 'İlhamə Paşazadə', ru: 'İlhamə Paşazadə' }, slug: 'ilhame-paszazade', title: { az: 'Menecer', en: 'Menecer', ru: 'Menecer' } },
    { name: { az: 'Tərlan Kərimov', en: 'Tərlan Kərimov', ru: 'Tərlan Kərimov' }, slug: 'terlan-kerimov', title: { az: 'Menecer', en: 'Menecer', ru: 'Menecer' } },
    { name: { az: 'Həcər Nağıyeva', en: 'Həcər Nağıyeva', ru: 'Həcər Nağıyeva' }, slug: 'hecer-nagiyeva', title: { az: 'Menecer', en: 'Menecer', ru: 'Menecer' } },
    { name: { az: 'Fərid Əlipənahov', en: 'Fərid Əlipənahov', ru: 'Fərid Əlipənahov' }, slug: 'farid-alipanahov', title: { az: 'Menecer', en: 'Menecer', ru: 'Menecer' } },
  ];

  const createdAuthors: Record<string, any> = {};
  for (const a of AUTHORS_DATA) {
    const author = await prisma.pulseAuthor.upsert({
      where: { slug: a.slug },
      update: { name: a.name, title: a.title },
      create: a,
    });
    createdAuthors[a.slug] = author;
  }
  console.log('✅ Pulse authors seeded (12)');

  // ── Keywords ──────────────────────────────────────────
  const KEYWORDS_DATA = [
    { name: { az: 'Daşınmaz Əmlak', en: 'Daşınmaz Əmlak', ru: 'Daşınmaz Əmlak' }, slug: 'dasinmaz-emlak' },
    { name: { az: 'Bakıda Evlər', en: 'Bakıda Evlər', ru: 'Bakıda Evlər' }, slug: 'bakida-evler' },
    { name: { az: 'Sea Breeze', en: 'Sea Breeze', ru: 'Sea Breeze' }, slug: 'sea-breeze' },
    { name: { az: 'İnvestisiya', en: 'İnvestisiya', ru: 'İnvestisiya' }, slug: 'investisiya' },
    { name: { az: 'Premium Əmlak', en: 'Premium Əmlak', ru: 'Premium Əmlak' }, slug: 'premium-emlak' },
    { name: { az: 'Kampaniya', en: 'Kampaniya', ru: 'Kampaniya' }, slug: 'kampaniya' },
    { name: { az: 'Bloq', en: 'Bloq', ru: 'Bloq' }, slug: 'bloq' },
    { name: { az: 'Tədbir', en: 'Tədbir', ru: 'Tədbir' }, slug: 'tedbir' },
    { name: { az: 'İpoteka', en: 'İpoteka', ru: 'İpoteka' }, slug: 'ipoteka' },
    { name: { az: 'Layihə', en: 'Layihə', ru: 'Layihə' }, slug: 'layihe' },
  ];

  const createdKeywords: Record<string, any> = {};
  for (const kw of KEYWORDS_DATA) {
    const keyword = await prisma.pulseKeyword.upsert({
      where: { slug: kw.slug },
      update: { name: kw.name },
      create: kw,
    });
    createdKeywords[kw.slug] = keyword;
  }
  console.log('✅ Pulse keywords seeded (10)');

  // ── Articles (6 — multilingual) ──────────────────────
  const ARTICLES_DATA = [
    {
      slug: 'panorama-by-elie-saab-da-30-70-kampaniyasi',
      title: {
        az: 'Panorama By Elie Saab-da 30/70 Kampaniyası: Aylıq Ödənişsiz Eksklüziv İnvestisiya',
        en: 'Panorama By Elie Saab 30/70 Campaign: Exclusive Investment Without Monthly Payments',
        ru: 'Panorama By Elie Saab 30/70 Кампания: Эксклюзивная инвестиция без ежемесячных платежей',
      },
      category: { az: 'Kampaniya', en: 'Campaign', ru: 'Кампания' },
      date: '12.05.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03349150df278a38351b4a_panorama%20aze.webp',
      headerPositions: ['left'],
      headerOrder: 1,
      keywords: ['kampaniya', 'investisiya', 'layihe'],
      blocks: [
        { type: 'heading' as const, level: 2 as const, text: 'Panorama By Elie Saab — Bakının yeni ikonu' },
        { type: 'paragraph' as const, text: 'Panorama By Elie Saab, Bakının ən prestijli layihələrindən biri olaraq, daşınmaz əmlak bazarında yeni standartlar müəyyən edir.' },
        { type: 'image' as const, url: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03349150df278a38351b4a_panorama%20aze.webp', alt: 'Panorama By Elie Saab' },
        { type: 'heading' as const, level: 3 as const, text: '30/70 Kampaniyası nədir?' },
        { type: 'paragraph' as const, text: '30/70 kampaniyası çərçivəsində yalnız 30% ilkin ödənişlə mənzil sahibi ola bilərsiniz.' },
        { type: 'list' as const, items: ['30% ilkin ödəniş', '70% faizsiz aylıq ödəniş', 'Aylıq ödəniş 0% komissiya', 'Çatdırılma 2027-ci ildə'] },
      ],
    },
    {
      slug: 'reportage-heights-de-30-70-kampaniyasi',
      title: {
        az: 'Reportage Heights-də 30/70 Kampaniyası: Aylıq Ödənişsiz Prestijli Həyat',
        en: 'Reportage Heights 30/70 Campaign: Prestigious Life Without Monthly Payments',
        ru: 'Reportage Heights 30/70 Кампания: Премиум жизнь без ежемесячных платежей',
      },
      category: { az: 'Kampaniya', en: 'Campaign', ru: 'Кампания' },
      date: '12.05.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03347538e0bfa6ec214d61_reportage%20aze.webp',
      headerPositions: ['left'],
      headerOrder: 2,
      keywords: ['kampaniya', 'investisiya'],
      blocks: [
        { type: 'heading' as const, level: 2 as const, text: 'Reportage Heights — Dubay təcrübəsi Bakıda' },
        { type: 'paragraph' as const, text: 'Reportage Heights, Dubayın məşhur Reportage Group tərəfindən Bakıda həyata keçirilən ilk layihədir.' },
        { type: 'image' as const, url: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03347538e0bfa6ec214d61_reportage%20aze.webp', alt: 'Reportage Heights' },
        { type: 'heading' as const, level: 3 as const, text: 'Kampaniya şərtləri' },
        { type: 'paragraph' as const, text: 'Reportage Heights-də 30/70 kampaniyası ilə premium mənzillərə sahib ola bilərsiniz.' },
        { type: 'list' as const, items: ['Şəhər mərkəzində yerləşmə', 'Premium təmir', 'Geniş mənzil planları', 'Kapital Abadlıq'] },
      ],
    },
    {
      slug: 'menzil-almaq-ucun-ilkin-odenis-ne-qeder-olmalidir',
      title: {
        az: 'Mənzil almaq üçün ilkin ödəniş nə qədər olmalıdır?',
        en: 'How much should the down payment be for an apartment?',
        ru: 'Каким должен быть первоначальный взнос за квартиру?',
      },
      category: { az: 'Bloq', en: 'Blog', ru: 'Блог' },
      excerpt: {
        az: 'Hər kəsin büdcəsi fərqlidir, amma daşınmaz əmlak bazarı daxilindəki tendensiyalar bizə müəyyən rəqəmlər diktə edir.',
        en: 'Everyone has a different budget, but trends in the real estate market dictate certain figures.',
        ru: 'У каждого разный бюджет, но тенденции на рынке недвижимости диктуют определённые цифры.',
      },
      date: '08.05.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69fd94d16c2f782bfe2b200b_emil%20blog%20cover.webp',
      authorSlug: 'emil-qurbanov',
      headerPositions: ['center'],
      headerOrder: 1,
      featured: true,
      keywords: ['dasinmaz-emlak', 'bakida-evler', 'ipoteka', 'investisiya'],
      selectedArticleSlugs: ['bakida-dasinmaz-emlak-satis-ugurunu-ne-mueyyen-edir', 'bakida-investisiya-ucun-en-ugurlu-layiheler-hansilardir'],
      blocks: [
        { type: 'paragraph' as const, text: 'Hər kəsin büdcəsi fərqlidir, amma daşınmaz əmlak bazarı daxilindəki tendensiyalar bizə müəyyən rəqəmlər diktə edir.' },
        { type: 'heading' as const, level: 2 as const, text: 'Bakıda mənzil qiymətləri nə qədərdir?' },
        { type: 'paragraph' as const, text: 'Bəli, Bakıda mənzil qiymətləri artımı trendindədir.' },
        { type: 'list' as const, items: ['Tikinti materiallarının bahalaşması', 'Torpaq sahələrinin azalması', 'İnfrastrukturun inkişafı'] },
        { type: 'image' as const, url: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69fd9716275a8625e0442bb4_emil%20blog%20img1.webp', alt: 'Blog şəkli' },
        { type: 'heading' as const, level: 3 as const, text: 'İlkin ödənişlə mənzil almağın üstünlükləri' },
        { type: 'list' as const, items: ['Borc yükü azalır', 'Faiz xərcləri aşağı düşür', 'Maliyyə stressi minimum olur', 'Seçim imkanları artır'] },
      ],
    },
    {
      slug: 'bakida-dasinmaz-emlak-satis-ugurunu-ne-mueyyen-edir',
      title: {
        az: 'Bakıda Daşınmaz Əmlakda Satış Uğurunu Nə Müəyyən Edir?',
        en: 'What Determines Sales Success in Baku Real Estate?',
        ru: 'Что определяет успех продаж на рынке недвижимости Баку?',
      },
      category: { az: 'Bloq', en: 'Blog', ru: 'Блог' },
      date: '17.04.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e23b2e65222dfa1568b506_javid%20cover.webp',
      authorSlug: 'cavid-axundov',
      headerPositions: ['right'],
      headerOrder: 1,
      keywords: ['dasinmaz-emlak', 'bloq'],
      blocks: [
        { type: 'paragraph' as const, text: 'Ayın əvvəlində brokerlər bir neçə müraciət gətirdi, sonra isə səssizlik çökdü.' },
        { type: 'paragraph' as const, text: 'Bu problemlərin səbəbi insanlar deyil — məhsulun satış mexanizmidir.' },
        { type: 'heading' as const, level: 2 as const, text: 'Satış Komandası və Satış Sistemi Eyni Şey Deyil' },
        { type: 'paragraph' as const, text: 'Komanda insanlardır — onlar motivasiya olunur, yorulur, dəyişir. Sistem isə strukturdur.' },
        { type: 'heading' as const, level: 3 as const, text: 'Peşəkar Satış Sisteminin 4 Sütunu' },
        { type: 'list' as const, items: ['Sürət', 'Broker Şəbəkəsi', 'Satış Funnel-i', 'Məlumat Bazası'] },
      ],
    },
    {
      slug: 'bakida-investisiya-ucun-en-ugurlu-layiheler-hansilardir',
      title: {
        az: 'Bakıda İnvestisiya Üçün Ən Uğurlu Layihələr Hansılardır?',
        en: 'What Are the Most Successful Investment Projects in Baku?',
        ru: 'Какие самые успешные инвестиционные проекты в Баку?',
      },
      category: { az: 'Bloq', en: 'Blog', ru: 'Блог' },
      date: '10.04.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69d8fa41ad243257771d2882_Nezrin%20Kerimli%20cover%20(1)%20(1).webp',
      authorSlug: 'nezrin-kerimli',
      headerPositions: ['right'],
      headerOrder: 2,
      keywords: ['investisiya', 'layihe', 'bloq'],
      blocks: [
        { type: 'heading' as const, level: 2 as const, text: 'Bakıda investisiya üçün doğru layihəni necə seçməli?' },
        { type: 'paragraph' as const, text: 'Daşınmaz əmlaka investisiya edərkən düzgün layihə seçimi ən vacib qərardır.' },
        { type: 'list' as const, items: ['Layihənin yerləşdiyi ərazi', 'İnfrastruktur səviyyəsi', 'Developerin etibarlılığı', 'Çatdırılma müddəti', 'Gəlir potensiali'] },
        { type: 'image' as const, url: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69d8fa41ad243257771d2882_Nezrin%20Kerimli%20cover%20(1)%20(1).webp', alt: 'İnvestisiya layihələri' },
      ],
    },
    {
      slug: 'arabian-ranches-de-30-70-kampaniyasi',
      title: {
        az: 'Arabian Ranches-də 30/70 Kampaniyası: Aylıq Ödənişsiz Mənzil Sahibi Olun',
        en: 'Arabian Ranches 30/70 Campaign: Own an Apartment Without Monthly Payments',
        ru: 'Arabian Ranches 30/70 Кампания: Владейте квартирой без ежемесячных платежей',
      },
      category: { az: 'Kampaniya', en: 'Campaign', ru: 'Кампания' },
      date: '12.05.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03037f2071a1acdd345f50_arabian%2016x9.webp',
      headerPositions: ['week'],
      headerOrder: 1,
      keywords: ['kampaniya', 'investisiya'],
      blocks: [
        { type: 'heading' as const, level: 2 as const, text: 'Arabian Ranches — Dubay təcrübəsi Bakıda' },
        { type: 'paragraph' as const, text: 'Arabian Ranches, Dubayın məşhur villa kompleksinin Bakıda tətbiqidir.' },
        { type: 'image' as const, url: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03037f2071a1acdd345f50_arabian%2016x9.webp', alt: 'Arabian Ranches' },
        { type: 'heading' as const, level: 3 as const, text: 'Kampaniya şərtləri' },
        { type: 'paragraph' as const, text: '30/70 kampaniyası ilə Arabian Ranches-də villa və mənzillərə sahib ola bilərsiniz.' },
        { type: 'list' as const, items: ['Villa və mənzil seçimləri', 'Geniş yaşayış sahəsi', 'Yaşıl ərazilər', 'Uşaqlar üçün oyun sahələri', 'İdman kompleksləri'] },
      ],
    },
  ];

  // ── Create articles ──────────────────────────────────────
  for (const a of ARTICLES_DATA) {
    const { authorSlug, keywords: kwSlugs, selectedArticleSlugs, date: dateStr, ...articleData } = a;
    const relations: any = { published: true };
    if (dateStr) {
      const [day, month, year] = dateStr.split('.');
      relations.date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    }
    if (authorSlug && createdAuthors[authorSlug]) {
      relations.author = { connect: { id: createdAuthors[authorSlug].id } };
    }
    if (kwSlugs && kwSlugs.length > 0) {
      relations.keywords = {
        connect: kwSlugs.filter(ks => createdKeywords[ks]).map(ks => ({ id: createdKeywords[ks].id })),
      };
    }
    await prisma.pulseArticle.upsert({
      where: { slug: a.slug },
      update: { ...articleData, ...relations },
      create: { ...articleData, ...relations },
    });
  }

  // ── Second pass: connect selectedArticles ────────────────
  for (const a of ARTICLES_DATA) {
    const slugs = (a as any).selectedArticleSlugs;
    if (slugs && slugs.length > 0) {
      const target = await prisma.pulseArticle.findUnique({ where: { slug: a.slug } });
      if (target) {
        const toConnect: { id: string }[] = [];
        for (const s of slugs) {
          const sa = await prisma.pulseArticle.findUnique({ where: { slug: s } });
          if (sa) toConnect.push({ id: sa.id });
        }
        if (toConnect.length > 0) {
          await prisma.pulseArticle.update({
            where: { id: target.id },
            data: { selectedArticles: { connect: toConnect } },
          });
        }
      }
    }
  }

  console.log('✅ Pulse articles seeded (6)');

  // ── Delete old articles not in seed ──────────────────────
  const seedSlugs = ARTICLES_DATA.map(a => a.slug);
  const deleted = await prisma.pulseArticle.deleteMany({
    where: { slug: { notIn: seedSlugs } },
  });
  console.log(`🗑️  Deleted ${deleted.count} old articles`);

  console.log('\n🎉 Pulse CMS seeded successfully! (6 articles, multilingual)');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
