import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Pulse CMS (treva data)...');

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

  // ── Articles ──────────────────────────────────────────
  const ARTICLES_DATA = [
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
      blocks: [
        { type: 'paragraph' as const, text: 'Hər kəsin büdcəsi fərqlidir, amma daşınmaz əmlak bazarı daxilindəki tendensiyalar bizə müəyyən rəqəmlər diktə edir. Adətən, ilkin ödəniş faizi layihədən və ödəniş növündən (daxili kredit və ya ipoteka) asılı olaraq dəyişir. Bakıda mənzil almaq istəyirsinizsə, minimum 20-30% ilkin ödənişə hazır olmalısınız. Bəzən kampaniyalar çərçivəsində ilkin ödənişli mənzillər daha aşağı - 10% ilə də təklif oluna bilir, lakin bu zaman aylıq ödənişlərin bir qədər yüksək olacağını nəzərə almalısınız. İlkin ödənişin miqdarı seçilən layihə, kredit növü və ödəniş planına görə dəyişir. Daha aşağı ilkin ödəniş aylıq ödənişlərin artmasına səbəb olur, yüksək ilkin ödəniş isə ümumi maliyyə yükünü azaldır.' },
        { type: 'heading' as const, level: 2 as const, text: 'Bakıda mənzil qiymətləri nə qədərdir və artım gözlənilirmi?' },
        { type: 'paragraph' as const, text: 'Bəli, Bakıda mənzil qiymətləri artımı trendindədir. Bunun əsas səbəbləri:' },
        { type: 'list' as const, items: ['Tikinti materiallarının bahalaşması', 'Torpaq sahələrinin azalması', 'İnfrastrukturun inkişafı'] },
        { type: 'paragraph' as const, text: 'Tez-tez müraciət edib soruşurlar: "Bakıda ev qiymətləri artacaqmı?" Səmimi deyəcəyəm, daşınmaz əmlak qiymətləri yerində saymır. Xüsusilə infrastrukturun inkişaf etdiyi ərazilərdə qiymət artımı qaçılmazdır.' },
        { type: 'image' as const, url: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69fd9716275a8625e0442bb4_emil%20blog%20img1.webp', alt: 'Blog şəkli' },
        { type: 'heading' as const, level: 3 as const, text: 'İlkin ödənişlə mənzil almağın üstünlükləri' },
        { type: 'list' as const, items: ['Borc yükü azalır', 'Faiz xərcləri aşağı düşür', 'Maliyyə stressi minimum olur', 'Seçim imkanları artır'] },
        { type: 'paragraph' as const, text: 'İlkin ödəniş yalnız giriş deyil, strategiyadır.' },
        { type: 'heading' as const, level: 2 as const, text: 'Bakıda investisiya üçün ən doğru seçim: Sea Breeze' },
        { type: 'paragraph' as const, text: 'Əgər məqsədiniz sadəcə yaşamaq deyil, həm də Bakıda investisiya etməkdirsə, mənim bir nömrəli tövsiyəm həmişə Sea Breeze layihəsidir.' },
        { type: 'image' as const, url: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69fd97350ec24e311b1a6ce1_emil%20blog%20img2.webp', alt: 'Blog şəkli 2' },
        { type: 'heading' as const, level: 2 as const, text: 'Niyə mənzil almaq ilkin ödənişlə daha sərfəlidir?' },
        { type: 'paragraph' as const, text: 'Mənzil almaq ilkin ödənişlə həm psixoloji, həm də maliyyə baxımından sizi rahatladır.' },
        { type: 'heading' as const, level: 3 as const, text: 'İlkin ödəniş minimum nə qədər ola bilər?' },
        { type: 'paragraph' as const, text: 'Adətən 20%, lakin kampaniyalarda 10%-ə qədər düşə bilər.' },
        { type: 'heading' as const, level: 3 as const, text: 'İlkin ödəniş az olsa nə baş verir?' },
        { type: 'paragraph' as const, text: 'Aylıq ödəniş artır və ümumi kredit yükü yüksəlir.' },
        { type: 'heading' as const, level: 3 as const, text: 'İpoteka ilə ilkin ödəniş fərqlidir?' },
        { type: 'paragraph' as const, text: 'Bəli, ipoteka zamanı bank şərtlərinə görə dəyişir.' },
        { type: 'heading' as const, level: 3 as const, text: 'İlkin ödəniş nə qədər optimaldır?' },
        { type: 'paragraph' as const, text: '20–30% ən balanslı seçim hesab olunur.' },
      ],
    },
    {
      slug: 'panorama-by-elie-saab-da-30-70-kampaniyasi',
      title: 'Panorama By Elie Saab-da 30/70 Kampaniyası: Aylıq Ödənişsiz Eksklüziv İnvestisiya',
      category: 'Kampaniya',
      date: '12.05.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03349150df278a38351b4a_panorama%20aze.webp',
      headerPosition: 'left',
      headerOrder: 1,
      keywords: ['kampaniya', 'investisiya', 'layihe'],
    },
    {
      slug: 'reportage-heights-de-30-70-kampaniyasi',
      title: 'Reportage Heights-də 30/70 Kampaniyası: Aylıq Ödənişsiz Prestijli Həyat',
      category: 'Kampaniya',
      date: '12.05.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03347538e0bfa6ec214d61_reportage%20aze.webp',
      headerPosition: 'left',
      headerOrder: 2,
      keywords: ['kampaniya', 'investisiya'],
    },
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
        { type: 'paragraph' as const, text: 'Ayın əvvəlində brokerlər bir neçə müraciət gətirdi, sonra isə səssizlik çökdü. Bu, bir çox developerlərin tanış olduğu ssenaridir. Qısa müddətli maraq dalğası, sonra isə uzun müddətli sustalma. Satışlar niyə dayanır? Səbəb alıcılarmı?' },
        { type: 'paragraph' as const, text: 'Bu problemlərin səbəbi insanlar deyil — məhsulun satış mexanizmidir. Məhsul nə qədər yaxşı olsa da, əgər onu satışa çıxaran sistem düzgün qurulmayıbsa, nəticə dəyişməyəcək. Bakıda daşınmaz əmlak bazarında ən böyük problem məhz budur — yaxşı məhsullar, zəif satış sistemi.' },
        { type: 'heading' as const, level: 2 as const, text: 'Satış Komandası və Satış Sistemi Eyni Şey Deyil' },
        { type: 'paragraph' as const, text: 'Komanda insanlardır — onlar motivasiya olunur, yorulur, dəyişir. Sistem isə strukturdur — onu qurdunuzmu, işləyir. Əksər developerlər broker komandasına investisiya edir, amma satış arxitekturasına yox. Halbuki, komanda olmadan sistem işləmir, amma sistem olmadan komanda itir.' },
        { type: 'paragraph' as const, text: 'Developerlərin çoxu insana investisiya edir: təlimlər, motivasiya görüşləri, bonuslar. Amma bunların heç biri davamlı nəticə vermir, çünki problem insanlarda deyil — prosesdədir. Satış prosesi standartlaşdırılmayıbsa, hər broker öz üsulu ilə işləyir və nəticə qeyri-sabit olur.' },
        { type: 'paragraph' as const, text: 'Bəs bu arxitektura nələrdən ibarətdir?' },
        { type: 'image' as const, url: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e23b2e65222dfa1568b506_javid%20cover.webp', alt: 'Satış sistemi arxitekturası' },
        { type: 'heading' as const, level: 3 as const, text: 'Peşəkar Satış Sisteminin 4 Sütunu' },
        { type: 'list' as const, items: [
          '<strong>Sürət.</strong> İlk 5 dəqiqədə alıcının ehtiyacını anlamaq. Uzun girişlər, boş söhbətlər — itirilmiş fürsət. Sürətli cavab, düzgün sual, effektiv dialoq.',
          '<strong>Broker Şəbəkəsi.</strong> Yalnız daxili komanda yox, xarici brokerlər də satışa cəlb olunmalıdır. Hər brokerin öz auditoriyası var. Onları inteqrasiya etmək, məlumatlandırmaq və motivasiya etmək lazımdır.',
          '<strong>Satış Funnel-i.</strong> Müraciətdən imzaya qədər hər mərhələ ölçülməli və optimallaşdırılmalıdır. Hansı mərhələdə itki var? Səbəb nədir? Bu sualların cavabı olmadan irəliləmək qeyri-mümkündür.',
          '<strong>Məlumat Bazası.</strong> Hər alıcı, hər əlaqə, hər görüş qeydə alınmalıdır. CRM sistemi olmadan satış prosesi görünməz olur və idarə edilməz hala gəlir.'
        ] },
        { type: 'heading' as const, level: 2 as const, text: 'Developerlər Niyə Bu Sistemi Qurmurlar?' },
        { type: 'paragraph' as const, text: 'Çoxu bunun lazım olduğunu bilir, amma hərəsi bir səbəbdən geri çəkilir. Bu geri çəkilmənin arxasında əsasən üç səbəb dayanır:' },
        { type: 'paragraph' as const, text: '<strong>"Hər şey qaydasındadır" illüziyası.</strong> Mövcud satışlar davam edir, amma onların potensialın yalnız 20-30%-ni təşkil edir. Bunu görmək üçün dataya baxmaq lazımdır, çoxu isə baxmır.' },
        { type: 'paragraph' as const, text: '<strong>Nəzarəti itirmək qorxusu.</strong> Sistemi qurmaq deməkdir ki, hər şey şəffaf olacaq. Bəzi developerlər isə qeyri-şəffaf proseslərdən faydalanır. Amma bu, qısa müddətli strategiyadır, uzun müddətdə itirən tərəf olacaqsınız.' },
        { type: 'paragraph' as const, text: '<strong>Daimi "yanğın söndürmə" rejimi.</strong> Hər gün yeni problem, hər gün yeni təcili qərar. Strateji planlama üçün vaxt qalmır. Bu rejim davam etdikcə, komanda yorulur və satışlar daha da düşür.' },
        { type: 'heading' as const, level: 3 as const, text: 'Alıcı Artıq Müqayisə Edir' },
        { type: 'paragraph' as const, text: 'Bakıdakı alıcılar artıq bir layihə ilə kifayətlənmir. Onlar müqayisə edir, araşdırır, soruşur. Əgər sizin satış sisteminiz alıcının suallarına vaxtında və peşəkar cavab vermirsə, rəqibinizə uduzursuz. Alıcı artıq "ən yaxşını" axtarır və bu "ən yaxşı" təcrübəni təqdim edən developer qazanır.' },
        { type: 'heading' as const, level: 3 as const, text: 'İki Yol Var. Üçüncüsü Yoxdur.' },
        { type: 'paragraph' as const, text: 'Birincisi — sistemi özünüz qurmaqdır. Bu, vaxt, resurs və ekspertiza tələb edir. Əgər bu üçünüz varsa, əla. Amma unutmayın ki, bu, bir dəfəlik iş deyil, davamlı inkişaf tələb edir.' },
        { type: 'paragraph' as const, text: 'İkincisi — artıq qurulmuş bir platformaya qoşulmaqdır. Bu halda, sistemi sıfırdan qurmağa ehtiyac yoxdur. Mövcud infrastrukturdan istifadə edərək, satışlarınızı artıra bilərsiniz. TREVA məhz bu model üzərində qurulub.' },
        { type: 'paragraph' as const, text: 'Hər iki yol legitimdir. Əsas olan hansını seçməyiniz deyil, seçməyinizdir. Seçimsiz qalmaq isə ən pis seçimdir.' },
        { type: 'heading' as const, level: 3 as const, text: 'Niyə Məhz İndi?' },
        { type: 'paragraph' as const, text: 'Bakı bazarının qalibləri bu gün formalaşır. Qarşıdakı 2-3 ildə bazar daha da rəqabətli olacaq. O developerlər ki, bu gün satış sistemlərini quracaq, sabah bu bazarda lider olacaq. Gecikmək isə bahalı başa gəlir — hər itirilmiş gün, itirilmiş satışdır.' },
        { type: 'image' as const, url: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e23b2e65222dfa1568b506_javid%20cover.webp', alt: 'TREVA platforması' },
        { type: 'heading' as const, level: 2 as const, text: 'TREVA Nədir?' },
        { type: 'paragraph' as const, text: 'TREVA bir agentlik deyil, bir platformadır. O, developerlərə satış infrastrukturu təqdim edir: peşəkar broker şəbəkəsi, CRM inteqrasiyası, avtomatlaşdırılmış satış prosesi və real-vaxt analitikası. TREVA ilə siz satışlarınıza nəzarət edə bilərsiniz, həm də brokerlərinizin performansını izləyə bilərsiniz.' },
        { type: 'paragraph' as const, text: 'Bəzi developerlər bizə sistem qurduqdan sonra satşların 3-4 dəfə artdığını deyir. Bu, həddindən artıq iddia kimi səslənə bilər, amma real nəticələr bunu təsdiqləyir. Səbəb sadədir — düzgün sistem, düzgün nəticə verir.' },
      ],
    },
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
    },
    {
      slug: 'investisiya-ucun-niye-mehz-sea-breeze',
      title: 'İnvestisiya üçün niyə məhz Sea Breeze?',
      category: 'Bloq',
      date: '06.04.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69d387faabd8941c551800fa_turkan%20cover%20(1).webp',
      authorSlug: 'turkan-mamedova',
      headerPosition: 'right',
      headerOrder: 3,
      keywords: ['sea-breeze', 'investisiya', 'bloq'],
    },
    {
      slug: 'bakida-menzil-qiymetleri-2026-serfeli-layiheler',
      title: 'Bakıda Mənzil Qiymətləri 2026: Sərfəli Layihələr',
      category: 'Bloq',
      date: '23.04.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e9dc5d25a4d7cb27fafcbc_leyla%20cover.webp',
      authorSlug: 'leyla-bagirzade',
      headerPosition: 'right',
      headerOrder: 4,
      keywords: ['bakida-evler', 'layihe', 'bloq'],
    },
    {
      slug: 'arabian-ranches-de-30-70-kampaniyasi',
      title: 'Arabian Ranches-də 30/70 Kampaniyası: Aylıq Ödənişsiz Mənzil Sahibi Olun',
      category: 'Kampaniya',
      date: '12.05.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6a03037f2071a1acdd345f50_arabian%2016x9.webp',
      headerPosition: 'week',
      headerOrder: 1,
      keywords: ['kampaniya', 'investisiya'],
    },
    {
      slug: 'bazarda-niye-bezi-developerler-daha-suretli-satir',
      title: 'Bazarda niyə bəzi developerlər daha sürətli satır?',
      category: 'Bloq',
      date: '29.04.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69f2106019e67e1ea891fccf_tural%20necefov%20coverr.webp',
      authorSlug: 'tural-necfov',
      headerPosition: 'week',
      headerOrder: 2,
      keywords: ['bloq', 'investisiya'],
    },
    {
      slug: 'satisdan-sonraki-seffafliq',
      title: 'Satışdan Sonrakı Şəffaflıq: Müştəri Məmnuniyyəti Şirkətin Nüfuzunu Necə Müəyyən Edir?',
      category: 'Bloq',
      date: '19.03.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69bbea28ae4fb211e7614275_cover%20sebine.webp',
      authorSlug: 'sebine-muxtarova',
      keywords: ['bloq', 'dasinmaz-emlak'],
    },
    {
      slug: 'baki-dasinmaz-emlak-bazari',
      title: 'Bakı Daşınmaz Əmlak Bazarı: İnvestisiya İmkanları və Off-plan Trendi',
      category: 'Bloq',
      date: '13.03.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69b419b1ccd29af57469cce0_batula%20cover.webp',
      authorSlug: 'batula-mohubbi',
      keywords: ['dasinmaz-emlak', 'investisiya', 'bloq'],
    },
    {
      slug: 'ugurlu-investisiya-imkani',
      title: 'Uğurlu İnvestisiya İmkanı: Marina Village-də Xanımlar üçün 8 Mart Kampaniyası',
      category: 'Kampaniya',
      date: '06.03.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69aad644a4043868699c2dc8_G%C3%9CLC%C3%9C%20TEKL%C4%B0F%20AZ.webp',
      keywords: ['kampaniya', 'investisiya'],
    },
    {
      slug: 'dasinmaz-emlak-almaq-isteyen-insanlar-ilk-novbede-ne-ile-maraqlanirlar',
      title: 'Daşınmaz əmlak almaq istəyən insanlar ilk növbədə nə ilə maraqlanırlar?',
      category: 'Bloq',
      date: '04.03.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69b0356bc47fd3803791ac60_Gemini_Generated_Image_tcieq9tcieq9tcie.webp',
      authorSlug: 'ilhame-paszazade',
      keywords: ['dasinmaz-emlak', 'bloq'],
    },
    {
      slug: 'treva-real-estate-daskendde',
      title: 'Treva Real Estate Daşkənddə keçirilən "Dvizhenie" beynəlxalq forumunda iştirak etdi',
      category: 'Tədbir',
      date: '24.02.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/699da3a67e74e27a7ab28be0_2%20(1).webp',
      keywords: ['tedbir'],
    },
    {
      slug: 'arabian-ranches-sea-breeze-de-investisiya',
      title: 'Arabian Ranches Sea Breeze-də investisiya edib Dohaya səyahət qazanmaq mümkündürmü?',
      category: 'Kampaniya',
      date: '17.02.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69941644ea2d8a06b09eefc2_arabian%2016x9%20az.webp',
      keywords: ['kampaniya', 'investisiya', 'sea-breeze'],
    },
    {
      slug: 'dasinmaz-emlak-bazarinda-brokerlerle-islemek',
      title: 'Daşınmaz əmlak bazarında brokerlərlə işləmək niyə daha aktualdır?',
      category: 'Bloq',
      date: '10.02.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/698b3024d7c6aebd7f7d6138_freepik_medium_shot_of_an_azerbaijani_real_estate_broker_i_96816.webp',
      authorSlug: 'terlan-kerimov',
      keywords: ['dasinmaz-emlak', 'bloq'],
    },
    {
      slug: 'size-uygun-menzil-novu-hansidir',
      title: 'Sizə uyğun mənzil növü hansıdır?',
      category: 'Bloq',
      date: '02.02.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6985f7a8016aab013f18eb73_Narmin_sazmani_upscale_upscales%20(1)%20(1)%20(1)%20(1)%20(1)%20(1).png',
      authorSlug: 'hecer-nagiyeva',
      keywords: ['bakida-evler', 'bloq'],
    },
    {
      slug: 'deniz-menzereli-townhouse-nedir',
      title: 'Dəniz mənzərəli townhouse nədir və niyə Sea Breeze-də bu qədər seçilir?',
      category: 'Bloq',
      date: '22.01.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6989e187812b56c36e0e41d1_farid.png',
      authorSlug: 'farid-alipanahov',
      keywords: ['sea-breeze', 'premium-emlak', 'bloq'],
    },
    {
      slug: 'the-magic-of-the-new-year-begins-at-arabian-ranches',
      title: 'Yeni ilin sehri Arabian Ranches-də başlayır',
      category: 'Kampaniya',
      date: '01.12.2025',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/693fdfb9f77b1667a95f0007_arabian.avif',
      keywords: ['kampaniya'],
    },
    {
      slug: 'exclusive-launch-event-in-dubai',
      title: 'Panorama by ELIE SAAB — Dubayda eksklüziv launch tədbiri',
      category: 'Tədbir',
      date: '18.11.2025',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/695e5cb0a51c55b235b51fbf_Panorama%20007.webp',
      keywords: ['tedbir', 'premium-emlak'],
    },
    {
      slug: 'a-new-platform-for-real-estate-brokers-in-azerbaijan',
      title: 'Broker X — Azərbaycanda daşınmaz əmlak brokerləri üçün yeni platformanın təqdimatı',
      category: 'Tədbir',
      date: '24.10.2025',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/694902ab712ca619de7d1ffe_DSC0343611.png',
      keywords: ['tedbir', 'dasinmaz-emlak'],
    },
    {
      slug: 'marina-village-de-sahilyani-heyat-ve-10000-azn-deyerinde-xususi-teklif',
      title: 'Marina Village-də sahilyanı həyat və 10.000 AZN dəyərində xüsusi təklif',
      category: 'Kampaniya',
      date: '15.09.2025',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/695e616d5b02837fd07709da_trevaaa.jpg',
      keywords: ['kampaniya'],
    },
    {
      slug: '2026-baxisi-treva-ve-azerbaycanin-dasinmaz-emlak-bazarinin-sistemli-transformasiyasi',
      title: '2026 Vizyonu: TREVA və Azərbaycanın Daşınmaz Əmlak Bazarının Sistemli Transformasiyası',
      category: 'Bloq',
      date: '26.01.2026',
      coverImage: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/697773c2eeb67ee81daa27ef_Treva%2002.webp',
      keywords: ['bloq', 'investisiya', 'dasinmaz-emlak'],
    },
  ];

  for (const a of ARTICLES_DATA) {
    const { authorSlug, keywords: kwSlugs, date: dateStr, ...articleData } = a;
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
  console.log('✅ Pulse articles seeded (22)');

  console.log('\n🎉 Pulse CMS seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
