import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Pulse CMS (production seed — 6 articles)...');

  // ── Categories ──────────────────────────────────────────
  const pulseCategories = [
    { name: 'Bloq', slug: 'bloq' },
    { name: 'Kampaniya', slug: 'kampaniya' },
    { name: 'Tədbir', slug: 'tedbir' },
    { name: 'Analizlər', slug: 'analizler' },
    { name: 'Xəbərlər', slug: 'xebərlər' },
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
    { name: 'Emil Qurbanov', slug: 'emil-qurbanov', title: 'Satış üzrə Menecer', avatar: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69fd8ce9412d4296bff1111a_Emil%20Qurbanov.webp' },
    { name: 'Cavid Axundov', slug: 'cavid-axundov', title: 'Menecer', avatar: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69b1127e23e0494e172f15d1_freepik__keep-everything-exactly-the-same-in-the-image-the-__62478.webp' },
    { name: 'Nəzrin Kərimli', slug: 'nezrin-kerimli', title: 'Menecer', avatar: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69d8f643447acae0af6ad0cd_Nezrin%20K%C9%99rimli%20(1).webp' },
    { name: 'Türkan Mamedova', slug: 'turkan-mamedova', title: 'Menecer', avatar: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69d39344f03dd689a3df5f48_Turkan%20Mamedova%20(1)d.webp' },
    { name: 'Leyla Bağırzadə', slug: 'leyla-bagirzade', title: 'Menecer', avatar: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69eb87ce2666e56cda7df5f6_leyla-autor.webp' },
    { name: 'Tural Nəcəfov', slug: 'tural-necfov', title: 'Menecer', avatar: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69f20b608b4bce1864a0a1a0_Tural%20Necefov.webp' },
    { name: 'Səbinə Muxtarova', slug: 'sebine-muxtarova', title: 'Menecer', avatar: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69bbd13d1d6e953bdfa53e4f_Sebine.webp' },
    { name: 'Batula Mohubbi', slug: 'batula-mohubbi', title: 'Menecer', avatar: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69b40fd1699b4c83ff918f97_batula.webp' },
    { name: 'İlhamə Paşazadə', slug: 'ilhame-paszazade', title: 'Menecer', avatar: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69a7d6a31b4102cd82150c58_1x1%20size%20qadin%20(1).webp' },
    { name: 'Tərlan Kərimov', slug: 'terlan-kerimov', title: 'Menecer', avatar: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6989c5263e93fc7d31871a9e_IMAGE.jpeg' },
    { name: 'Həcər Nağıyeva', slug: 'hecer-nagiyeva', title: 'Menecer', avatar: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69b4284aff4b24810b7251ff_hecer.webp' },
    { name: 'Fərid Əlipənahov', slug: 'farid-alipanahov', title: 'Menecer', avatar: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6971fdc542706589755deb51_profil%20photo.webp' },
  ];

  const createdAuthors: Record<string, any> = {};
  for (const a of AUTHORS_DATA) {
    const author = await prisma.pulseAuthor.upsert({
      where: { slug: a.slug },
      update: { name: a.name, title: a.title, avatar: a.avatar },
      create: a,
    });
    createdAuthors[a.slug] = author;
  }
  console.log('✅ Pulse authors seeded (12)');

  // ── Keywords ──────────────────────────────────────────
  const KEYWORDS_DATA = [
    { name: 'Daşınmaz Əmlak', slug: 'dasinmaz-emlak' },
    { name: 'Bakıda Evlər', slug: 'bakida-evler' },
    { name: 'Sea Breeze', slug: 'sea-breeze' },
    { name: 'İnvestisiya', slug: 'investisiya' },
    { name: 'Premium Əmlak', slug: 'premium-emlak' },
    { name: 'Kampaniya', slug: 'kampaniya' },
    { name: 'Bloq', slug: 'bloq' },
    { name: 'Tədbir', slug: 'tedbir' },
    { name: 'İpoteka', slug: 'ipoteka' },
    { name: 'Layihə', slug: 'layihe' },
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

  // ── Articles (6 — production seed) ──────────────────────
  const ARTICLES_DATA = [
    // LEFT 1 — Kampaniya
    {
      slug: 'panorama-by-elie-saab-da-30-70-kampaniyasi',
      title: 'Panorama By Elie Saab-da 30/70 Kampaniyası: Aylıq Ödənişsiz Eksklüziv İnvestisiya',
      category: 'Kampaniya',
      date: '12.05.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03349150df278a38351b4a_panorama%20aze.webp',
      headerPosition: 'left',
      headerOrder: 1,
      keywords: ['kampaniya', 'investisiya', 'layihe'],
      blocks: [
        { type: 'heading' as const, level: 2 as const, text: 'Panorama By Elie Saab — Bakının yeni ikonu' },
        { type: 'paragraph' as const, text: 'Panorama By Elie Saab, Bakının ən prestijli layihələrindən biri olaraq, daşınmaz əmlak bazarında yeni standartlar müəyyən edir. Bu layihə, beynəlxalq dizayn anlayışını Azərbaycan memarlığı ilə birləşdirərək, yaşayış məkanına yeni məna verir.' },
        { type: 'image' as const, url: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03349150df278a38351b4a_panorama%20aze.webp', alt: 'Panorama By Elie Saab' },
        { type: 'heading' as const, level: 3 as const, text: '30/70 Kampaniyası nədir?' },
        { type: 'paragraph' as const, text: '30/70 kampaniyası çərçivəsində yalnız 30% ilkin ödənişlə mənzil sahibi ola bilərsiniz. Qalan 70% isə aylıq ödənişlərlə — faizsiz və komissiyasız. Bu, Bakıda nadir təkliflərdən biridir.' },
        { type: 'list' as const, items: ['30% ilkin ödəniş', '70% faizsiz aylıq ödəniş', 'Aylıq ödəniş 0% komissiya', 'Çatdırılma 2027-ci ildə'] },
        { type: 'paragraph' as const, text: 'Layihədə 1, 2 və 3 otaqlı mənzillər təklif olunur. Hər mənzil premium səviyyədə təmir olunub və modern dizayn həlləri təqdim edir.' },
      ],
    },
    // LEFT 2 — Kampaniya
    {
      slug: 'reportage-heights-de-30-70-kampaniyasi',
      title: 'Reportage Heights-də 30/70 Kampaniyası: Aylıq Ödənişsiz Prestijli Həyat',
      category: 'Kampaniya',
      date: '12.05.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03347538e0bfa6ec214d61_reportage%20aze.webp',
      headerPosition: 'left',
      headerOrder: 2,
      keywords: ['kampaniya', 'investisiya'],
      blocks: [
        { type: 'heading' as const, level: 2 as const, text: 'Reportage Heights — Dubay təcrübəsi Bakıda' },
        { type: 'paragraph' as const, text: 'Reportage Heights, Dubayın məşhur Reportage Group tərəfindən Bakıda həyata keçirilən ilk layihədir. Bu bina, beynəlxalq keyfiyyət standartlarını Azərbaycan bazarına gətirir.' },
        { type: 'image' as const, url: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03347538e0bfa6ec214d61_reportage%20aze.webp', alt: 'Reportage Heights' },
        { type: 'heading' as const, level: 3 as const, text: 'Kampaniya şərtləri' },
        { type: 'paragraph' as const, text: 'Reportage Heights-də 30/70 kampaniyası ilə premium mənzillərə sahib ola bilərsiniz. Layihə şəhərin mərkəzində, infrastrukturun inkişaf etdiyi ərazidə yerləşir.' },
        { type: 'list' as const, items: ['Şəhər mərkəzində yerləşmə', 'Premium təmir', 'Geniş mənzil planları', 'Kapital Abadlıq'] },
        { type: 'paragraph' as const, text: 'Reportage Heights ilə gələcəyinə investisiya et. Həm yaşayış, həm investisiya üçün ideal seçim.' },
      ],
    },
    // CENTER — Bloq (featured)
    {
      slug: 'menzil-almaq-ucun-ilkin-odenis-ne-qeder-olmalidir',
      title: 'Mənzil almaq üçün ilkin ödəniş nə qədər olmalıdır?',
      category: 'Bloq',
      date: '08.05.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69fd94d16c2f782bfe2b200b_emil%20blog%20cover.webp',
      excerpt: 'Hər kəsin büdcəsi fərqlidir, amma daşınmaz əmlak bazarı daxilindəki tendensiyalar bizə müəyyən rəqəmlər diktə edir.',
      authorSlug: 'emil-qurbanov',
      headerPosition: 'center',
      headerOrder: 1,
      featured: true,
      keywords: ['dasinmaz-emlak', 'bakida-evler', 'ipoteka', 'investisiya'],
      selectedArticleSlugs: ['bakida-dasinmaz-emlak-satis-ugurunu-ne-mueyyen-edir', 'bakida-investisiya-ucun-en-ugurlu-layiheler-hansilardir'],
      blocks: [
        { type: 'paragraph' as const, text: 'Hər kəsin büdcəsi fərqlidir, amma daşınmaz əmlak bazarı daxilindəki tendensiyalar bizə müəyyən rəqəmlər diktə edir. Adətən, ilkin ödəniş faizi layihədən və ödəniş növündən (daxili kredit və ya ipoteka) asılı olaraq dəyişir. Bakıda mənzil almaq istəyirsinizsə, minimum 20-30% ilkin ödənişə hazır olmalısınız.' },
        { type: 'heading' as const, level: 2 as const, text: 'Bakıda mənzil qiymətləri nə qədərdir və artım gözlənilirmi?' },
        { type: 'paragraph' as const, text: 'Bəli, Bakıda mənzil qiymətləri artımı trendindədir. Bunun əsas səbəbləri:' },
        { type: 'list' as const, items: ['Tikinti materiallarının bahalaşması', 'Torpaq sahələrinin azalması', 'İnfrastrukturun inkişafı'] },
        { type: 'paragraph' as const, text: 'Tez-tez müraciət edib soruşurlar: "Bakıda ev qiymətləri artacaqmı?" Səmimi deyəcəyəm, daşınmaz əmlak qiymətləri yerində saymır. Xüsusilə infrastrukturun inkişaf etdiyi ərazilərdə qiymət artımı qaçılmazdır.' },
        { type: 'image' as const, url: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69fd9716275a8625e0442bb4_emil%20blog%20img1.webp', alt: 'Blog şəkli' },
        { type: 'heading' as const, level: 3 as const, text: 'İlkin ödənişlə mənzil almağın üstünlükləri' },
        { type: 'list' as const, items: ['Borc yükü azalır', 'Faiz xərcləri aşağı düşür', 'Maliyyə stressi minimum olur', 'Seçim imkanları artır'] },
        { type: 'paragraph' as const, text: 'İlkin ödəniş yalnız giriş deyil, strategiyadır.' },
        { type: 'heading' as const, level: 2 as const, text: 'Bakıda investisiya üçün ən doğru seçim' },
        { type: 'paragraph' as const, text: 'Əgər məqsədiniz sadəcə yaşamaq deyil, həm də Bakıda investisiya etməkdirsə, düzgün layihə seçimi çox vacibdir. Premium seqmentdə infrastrukturun inkişaf etdiyi ərazilər ən yaxşı gəlir gətirir.' },
        { type: 'image' as const, url: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69fd97350ec24e311b1a6ce1_emil%20blog%20img2.webp', alt: 'Blog şəkli 2' },
        { type: 'heading' as const, level: 2 as const, text: 'Niyə mənzil almaq ilkin ödənişlə daha sərfəlidir?' },
        { type: 'paragraph' as const, text: 'Mənzil almaq ilkin ödənişlə həm psixoloji, həm də maliyyə baxımından sizi rahatladır. Aylıq ödənişlərin minimuma düşməsi, uzunmüddətli planlarda böyük üstünlük verir.' },
        { type: 'heading' as const, level: 3 as const, text: 'İlkin ödəniş minimum nə qədər ola bilər?' },
        { type: 'paragraph' as const, text: 'Adətən 20%, lakin kampaniyalarda 10%-ə qədər düşə bilər.' },
        { type: 'heading' as const, level: 3 as const, text: 'İlkin ödəniş nə qədər optimaldır?' },
        { type: 'paragraph' as const, text: '20–30% ən balanslı seçim hesab olunur.' },
      ],
    },
    // RIGHT 1 — Bloq
    {
      slug: 'bakida-dasinmaz-emlak-satis-ugurunu-ne-mueyyen-edir',
      title: 'Bakıda Daşınmaz Əmlakda Satış Uğurunu Nə Müəyyən Edir?',
      category: 'Bloq',
      date: '17.04.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e23b2e65222dfa1568b506_javid%20cover.webp',
      authorSlug: 'cavid-axundov',
      headerPosition: 'right',
      headerOrder: 1,
      keywords: ['dasinmaz-emlak', 'bloq'],
      blocks: [
        { type: 'paragraph' as const, text: 'Ayın əvvəlində brokerlər bir neçə müraciət gətirdi, sonra isə səssizlik çökdü. Bu, bir çox developerlərin tanış olduğu ssenaridir. Qısa müddətli maraq dalğası, sonra isə uzun müddətli sustalma. Satışlar niyə dayanır?' },
        { type: 'paragraph' as const, text: 'Bu problemlərin səbəbi insanlar deyil — məhsulun satış mexanizmidir. Məhsul nə qədər yaxşı olsa da, əgər onu satışa çıxaran sistem düzgün qurulmayıbsa, nəticə dəyişməyəcək.' },
        { type: 'heading' as const, level: 2 as const, text: 'Satış Komandası və Satış Sistemi Eyni Şey Deyil' },
        { type: 'paragraph' as const, text: 'Komanda insanlardır — onlar motivasiya olunur, yorulur, dəyişir. Sistem isə strukturdur — onu qurdunuzmu, işləyir. Əksər developerlər broker komandasına investisiya edir, amma satış arxitekturasına yox.' },
        { type: 'paragraph' as const, text: 'Bəs bu arxitektura nələrdən ibarətdir?' },
        { type: 'heading' as const, level: 3 as const, text: 'Peşəkar Satış Sisteminin 4 Sütunu' },
        { type: 'list' as const, items: [
          '<strong>Sürət.</strong> İlk 5 dəqiqədə alıcının ehtiyacını anlamaq.',
          '<strong>Broker Şəbəkəsi.</strong> Yalnız daxili komanda yox, xarici brokerlər də satışa cəlb olunmalıdır.',
          '<strong>Satış Funnel-i.</strong> Müraciətdən imzaya qədər hər mərhələ ölçülməli və optimallaşdırılmalıdır.',
          '<strong>Məlumat Bazası.</strong> Hər alıcı, hər əlaqə, hər görüş qeydə alınmalıdır.'
        ] },
        { type: 'heading' as const, level: 2 as const, text: 'Developerlər Niyə Bu Sistemi Qurmurlar?' },
        { type: 'paragraph' as const, text: 'Çoxu bunun lazım olduğunu bilir, amma hərəsi bir səbəbdən geri çəkilir. Əsasən üç səbəb dayanır: "Hər şey qaydasındadır" illüziyası, nəzarəti itirmək qorxusu, daimi "yanğın söndürmə" rejimi.' },
        { type: 'image' as const, url: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e23b2e65222dfa1568b506_javid%20cover.webp', alt: 'Satış sistemi' },
        { type: 'heading' as const, level: 3 as const, text: 'İki Yol Var. Üçüncüsü Yoxdur.' },
        { type: 'paragraph' as const, text: 'Birincisi — sistemi özünüz qurmaqdır. İkincisi — artıq qurulmuş bir platformaya qoşulmaqdır. Hər iki yol legitimdir. Əsas olan seçməyinizdir.' },
      ],
    },
    // RIGHT 2 — Bloq
    {
      slug: 'bakida-investisiya-ucun-en-ugurlu-layiheler-hansilardir',
      title: 'Bakıda İnvestisiya Üçün Ən Uğurlu Layihələr Hansılardır?',
      category: 'Bloq',
      date: '10.04.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69d8fa41ad243257771d2882_Nezrin%20Kerimli%20cover%20(1)%20(1).webp',
      authorSlug: 'nezrin-kerimli',
      headerPosition: 'right',
      headerOrder: 2,
      keywords: ['investisiya', 'layihe', 'bloq'],
      blocks: [
        { type: 'heading' as const, level: 2 as const, text: 'Bakıda investisiya üçün doğru layihəni necə seçməli?' },
        { type: 'paragraph' as const, text: 'Daşınmaz əmlaka investisiya edərkən düzgün layihə seçimi ən vacib qərardır. Bakıda bir çox layihə təklif olunur, amma hamısı eyni səviyyədə gəlir gətirmir.' },
        { type: 'paragraph' as const, text: 'İnvestisiya üçün layihə seçərkən əsas kriteriyalar:' },
        { type: 'list' as const, items: ['Layihənin yerləşdiyi ərazi', 'İnfrastruktur səviyyəsi', 'Developerin etibarlılığı', 'Çatdırılma müddəti', 'Gəlir potensiali'] },
        { type: 'heading' as const, level: 2 as const, text: 'Ən yüksək gəlir gətirən layihələr' },
        { type: 'paragraph' as const, text: 'Premium seqmentdə yerləşən layihələr adətən daha yüksək gəlir gətirir. Xüsusilə dəniz kənarı və şəhər mərkəzindəki layihələr Kirayə gəliri baxımından ən sərfəli seçimdir.' },
        { type: 'image' as const, url: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69d8fa41ad243257771d2882_Nezrin%20Kerimli%20cover%20(1)%20(1).webp', alt: 'İnvestisiya layihələri' },
        { type: 'heading' as const, level: 3 as const, text: 'Sea Breeze niyə birinci sıradadır?' },
        { type: 'paragraph' as const, text: 'Sea Breeze, Bakıda ən uzunmüddətli investisiya potensialına malik layihələrdən biridir. Dəniz kənarında yerləşməsi, beynəlxalq səviyyədə infrastrukturu və davamlı inkişafı onu ideal seçim edir.' },
        { type: 'paragraph' as const, text: 'Düzgün layihə seçimi ilə daşınmaz əmlakdan uzunmüddətli gəlir əldə etmək mümkündür. Əsas olan dataya əsaslanmaq və emosional qərarlardan qaçmaqdır.' },
      ],
    },
    // WEEK — Kampaniya
    {
      slug: 'arabian-ranches-de-30-70-kampaniyasi',
      title: 'Arabian Ranches-də 30/70 Kampaniyası: Aylıq Ödənişsiz Mənzil Sahibi Olun',
      category: 'Kampaniya',
      date: '12.05.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03037f2071a1acdd345f50_arabian%2016x9.webp',
      headerPosition: 'week',
      headerOrder: 1,
      keywords: ['kampaniya', 'investisiya'],
      blocks: [
        { type: 'heading' as const, level: 2 as const, text: 'Arabian Ranches — Dubay təcrübəsi Bakıda' },
        { type: 'paragraph' as const, text: 'Arabian Ranches, Dubayın məşhur villa kompleksinin Bakıda tətbiqidir. Bu layihə, şəhər həyatından uzaq, təbiətə yaxın, sakit və rahat yaşam təklif edir.' },
        { type: 'image' as const, url: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03037f2071a1acdd345f50_arabian%2016x9.webp', alt: 'Arabian Ranches' },
        { type: 'heading' as const, level: 3 as const, text: 'Kampaniya şərtləri' },
        { type: 'paragraph' as const, text: '30/70 kampaniyası ilə Arabian Ranches-də villa və mənzillərə sahib ola bilərsiniz. Yalnız 30% ilkin ödəniş — qalanı aylıq, faizsiz.' },
        { type: 'list' as const, items: ['Villa və mənzil seçimləri', 'Geniş yaşayış sahəsi', 'Yaşıl ərazilər', 'Uşaqlar üçün oyun sahələri', 'İdman kompleksləri'] },
        { type: 'paragraph' as const, text: 'Arabian Ranches ilə ailəniz üçün ideal yaşam məkanı yaradın. Təbiətə yaxın, şəhərə rahat çatışla.' },
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

  console.log('\n🎉 Pulse CMS seeded successfully! (6 articles)');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
