import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

function wrap(val: string | null | undefined): any {
  if (!val || typeof val !== 'string') return val ?? null;
  return { az: val, en: val, ru: val };
}

async function main() {
  console.log("Seeding multilingual categories...");

  const categories = [
    { slug: "reportage-heights", title: { az: "Reportage Heights", en: "Reportage Heights", ru: "Reportage Heights" }, brand: { az: "Reportage Properties", en: "Reportage Properties", ru: "Reportage Properties" }, description: { az: "Dubayın ən hündür yaşayış kompleksi", en: "Dubai's tallest residential complex", ru: "Самый высокий жилой комплекс Дубая" }, image: "/uploads/layihelerimiz/reportage-heights-cover.jpg", brandTextColor: "white", order: 0 },
    { slug: "arabian-ranches", title: { az: "Arabian Ranches", en: "Arabian Ranches", ru: "Arabian Ranches" }, brand: { az: "Emaar Properties", en: "Emaar Properties", ru: "Emaar Properties" }, description: { az: "Lüks yaşayış kompleksi", en: "Luxury residential community", ru: "Роскошное жилое сообщество" }, image: "/uploads/layihelerimiz/arabian-ranches-cover.jpg", brandTextColor: "white", order: 1 },
    { slug: "marina-village", title: { az: "Marina Village", en: "Marina Village", ru: "Marina Village" }, brand: { az: "Nakheel", en: "Nakheel", ru: "Nakheel" }, description: { az: "Dəniz kənarında həyat tərzi", en: "Waterfront living", ru: "Прибрежный образ жизни" }, image: "/uploads/layihelerimiz/marina-village-cover.jpg", brandTextColor: "white", order: 2 },
    { slug: "brabus-island", title: { az: "BRABUS Island", en: "BRABUS Island", ru: "BRABUS Island" }, brand: { az: "BRABUS", en: "BRABUS", ru: "BRABUS" }, description: { az: "Eksklüziv ada həyat tərzi", en: "Exclusive island lifestyle", ru: "Эксклюзивный островной образ жизни" }, image: "/uploads/layihelerimiz/brabus-island-cover.jpg", brandTextColor: "white", order: 3 },
    { slug: "sabah-residence", title: { az: "Sabah Residence", en: "Sabah Residence", ru: "Sabah Residence" }, brand: { az: "Sabah", en: "Sabah", ru: "Sabah" }, description: { az: "Müasir yaşayış kompleksi", en: "Modern residential complex", ru: "Современный жилой комплекс" }, image: "/uploads/layihelerimiz/sabah-residence-cover.png", brandTextColor: "white", order: 4 },
    { slug: "panorama-by-elie-saab", title: { az: "Panorama by ELIE SAAB", en: "Panorama by ELIE SAAB", ru: "Panorama by ELIE SAAB" }, brand: { az: "ELIE SAAB", en: "ELIE SAAB", ru: "ELIE SAAB" }, description: { az: "Yüksək moda estetikası ilə müasir memarlığın dəniz sahilindəki harmoniyası", en: "Where haute couture aesthetics meet modern architecture on the coastline", ru: "Где эстетика haute couture встречается с современной архитектурой на побережье" }, image: "/uploads/layihelerimiz/panorama-cover.png", brandTextColor: "white", order: 5 },
    { slug: "treva-residences", title: { az: "Treva Residences", en: "Treva Residences", ru: "Treva Residences" }, brand: { az: "Treva", en: "Treva", ru: "Treva" }, description: { az: "Premium yaşayış kompleksi", en: "Premium residential complex", ru: "Премиальный жилой комплекс" }, image: "/uploads/layihelerimiz/treva-cover.jpg", brandTextColor: "white", order: 6 },
    { slug: "toronto", title: { az: "Toronto", en: "Toronto", ru: "Торонто" }, brand: { az: "Treva", en: "Treva", ru: "Treva" }, description: { az: "Şəhər mərkəzində premium layihə", en: "Premium project in city center", ru: "Премиальный проект в центре города" }, image: "/uploads/layihelerimiz/toronto-cover.jpg", brandTextColor: "white", order: 7 },
  ];

  for (const cat of categories) {
    await prisma.layihelerimizCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: { id: cat.slug, ...cat },
    });
  }
  console.log(`Seeded ${categories.length} categories`);

  console.log("Seeding multilingual project details...");

  const projectDetails = [
    {
      categorySlug: "panorama-by-elie-saab",
      heroTitle: { az: "PANORAMA BY ELIE SAAB", en: "PANORAMA BY ELIE SAAB", ru: "PANORAMA BY ELIE SAAB" },
      heroDesktopDesc: { az: "Yüksək moda estetikası ilə müasir memarlığın dəniz sahilindəki harmoniyası.", en: "Where haute couture aesthetics meet modern architecture on the coastline.", ru: "Где эстетика haute couture встречается с современной архитектурой на побережье." },
      heroMobileDesc: { az: "Curated real estate investments and tailored lifestyle solutions.", en: "Curated real estate investments and tailored lifestyle solutions.", ru: "Избранные инвестиции в недвижимость и индивидуальные решения для жизни." },
      heroImages: [{ url: "/uploads/layihelerimiz/panorama-cover.png", alt: "Panorama by Elie Saab" }],
      heroCtaText: { az: "MÜŞAVIRƏ ALIN", en: "GET A CONSULTATION", ru: "ПОЛУЧИТЬ КОНСУЛЬТАЦИЮ" },
      heroCtaLink: "/consultation",

      overviewTitleLight: { az: "Layihəyə ", en: "Project ", ru: "Обзор " },
      overviewTitleBold: { az: "Ümumi Baxış", en: "Overview", ru: "Проекта" },
      overviewBrandName: { az: "Panorama by ELIE SAAB", en: "Panorama by ELIE SAAB", ru: "Panorama by ELIE SAAB" },
      overviewDebutText: { az: " layihəsi Sea Breeze-in xüsusi nöqtəsində, ", en: " project is located in a special point of Sea Breeze, ", ru: " проект расположен в уникальной точке Sea Breeze, " },
      overviewLocationText: { az: "branded residences", en: "branded residences", ru: "брендовые резиденции" },
      overviewDebutTextEnd: { az: " olaraq ucalır.", en: " rising as.", ru: " возвышаясь как." },
      overviewDescription: { az: "Haute Couture dünyasının zamansız zərifliyi fərdi yaşayış sahələrinə köçürülərək qlobal həyat standartlarını yenidən formalaşdırır.", en: "The timeless elegance of the haute couture world is transferred to individual living spaces, redefining global lifestyle standards.", ru: "Безвременная элегантность мира haute couture переносится в индивидуальные жилые пространства, переосмысливая мировые стандарты жизни." },
      overviewImageLarge: "/images/project-overview/po1.jpg",
      overviewImageLargeLabel: { az: "Müasir memarlıq strukturu", en: "Modern architecture", ru: "Современная архитектура" },
      overviewImageMedium: "/images/project-overview/po2.jpg",
      overviewImageMediumLabel: { az: "Zərif həyat tərzi", en: "Refined lifestyle", ru: "Изысканный образ жизни" },
      overviewImageSmall: "/images/project-overview/po3.jpg",
      overviewImageSmallLabel: { az: "Unikal dəniz mənzərəsi", en: "Unique sea view", ru: "Уникальный вид на море" },
      overviewDataRows: [
        { key: "Layihənin Növü", value: "Yaşayış Kompleksi" },
        { key: "Təhvil Verilmə Tarixi", value: "2030-cu il" },
        { key: "Qiymət Aralığı", value: "MIN — 188 784 USD, MAX — 849 849 USD" },
      ],

      featuresHeaderMain: { az: "Kompleksin təqdim etdiyi müasir infrastruktur həlləri, daxili məkanlarda ELIE SAAB dünyasının fərdi moda zərifliyinə sahib interyer dizaynı ilə tamamlanır.", en: "The modern infrastructure solutions offered by the complex are complemented by interior design bearing the unique fashion elegance of the ELIE SAAB world.", ru: "Современные инфраструктурные решения комплекса дополняются интерьерным дизайном, несущим уникальную модную элегантность мира ELIE SAAB." },
      featuresHeaderSub: { az: "Sahəsi 50 m² ilə 428 m² arasında dəyişən fərdi mənzillərdə, yüksək təhlükəsizlik standartlarından tutmus sizə özəl istirahət zonalarına qədər hər bir texniki detallı tam rahatlığınız üçün tənzimlənmişdir.", en: "In individual apartments ranging from 50 m² to 428 m², every technical detail is configured for your complete comfort, from high security standards to exclusive recreation zones.", ru: "В индивидуальных квартирах площадью от 50 м² до 428 м² каждый технический деталь настроен для вашего полного комфорта — от стандартов высокой безопасности до эксклюзивных зон отдыха." },
      featuresTitleLight: { az: "Layihənin ", en: "Project ", ru: "Детали " },
      featuresTitleBold: { az: "Detalları", en: "Details", ru: "Проекта" },
      featuresSections: [
        { id: "01", titleItalic: "Fərdi Komfort", titleRest: " və Təhlükəsizlik", subtitle: "Hər bir detalda tam rahatlıq təmin olunur.", items: ["Yeraltı avtomobil dayanacağı sahəsi", "24/7 fəaliyyət göstərən mühafizə sistemi", "İşlükar mühit və səmərəli iş məkanları", "Sakinlərin dincəlməsi üçün geniş istirahət zonaları"], dark: true, image: "/images/project-details/pd1.jpg", imageLeft: true },
        { id: "02", titleItalic: "Sağlamlıq", titleRest: " və Asudə Vaxt", subtitle: "Sakitlik və fiziki yenilənmə mühiti.", items: ["Geniş panoramaya malik iki ədəd infinity hovuzu", "Xüsusi daxili hamamlar, spa və sauna guşələri", "Su idmanı növləri üçün infrastruktur", "Landşaft memarlığı əsasında salınmış baqlar və fəvvarələr"], dark: false, image: "/images/project-details/pd2.jpg", imageLeft: false },
        { id: "03", titleItalic: "Aktiv Həyat", titleRest: " və İdman", subtitle: "Dinamikanın ön planda olduğu məkanlar.", items: ["Müasir avadanlıqlarla təchiz olunmuş fitnes zalı", "Peşəkar standartlara cavab verən idman sahəsi", "Masaüstü tennis üçün ayrılmış xüsusi zona", "Uşaqlar üçün təhlükəsiz əyləncə və oyun məkanları"], dark: true, image: "/images/project-details/pd3.jpg", imageLeft: true },
        { id: "04", titleItalic: "Strateji", titleRest: " Yerləşmə", subtitle: "Şəhərin aktiv nöqtələrinə rahat çıxış.", items: ["Crescent Island — 5 dəqiqəlik məsafə", "Dream Arena — 7 dəqiqəlik məsafə", "Royale Casino — 4 dəqiqəlik məsafə", "Heydər Əliyev Beynəlxalq Hava Limanı — 15 dəqiqəlik məsafə"], dark: false, image: "/images/project-details/pd4.jpg", imageLeft: false },
      ],

      locationTitleLight: { az: "Layihənin ", en: "Property ", ru: "Расположение " },
      locationTitleBold: { az: "Coğrafi Mövqeyi", en: "Location", ru: "Проекта" },
      locationBrandName: { az: "Panorama by ELIE SAAB", en: "Panorama by ELIE SAAB", ru: "Panorama by ELIE SAAB" },
      locationMainLead: { az: "sits in the elite heart of Sea Breeze, just behind the iconic Crescent.", en: "sits in the elite heart of Sea Breeze, just behind the iconic Crescent.", ru: "расположен в элитном сердце Sea Breeze, прямо за культовым Полумесяцем." },
      locationSubText: { az: "Bu unikal coğrafi mövqə xüsusi layihələndirilmiş mühiti Xəzər dənizinin füsunkər panoraması ilə vizual olaraq bir araya gətirir.", en: "This unique geographical location brings together specially designed environments with the magnificent panorama of the Caspian Sea.", ru: "Это уникальное географическое положение объединяет специально разработанные пространства с великолепной панорамой Каспийского моря." },
      locationMapImage: "/images/property-location/pl.png",
      locationFooterAddress: { az: "Sea Breeze Resort, Nardaran District, Baku, Azerbaijan", en: "Sea Breeze Resort, Nardaran District, Baku, Azerbaijan", ru: "Sea Breeze Resort, Нардаранский район, Баку, Азербайджан" },
      locationGoogleMapsUrl: "https://www.google.com/maps/place/Sea+Breeze+Resort/@40.5187,49.8671,15z",

      seoTitle: { az: "Panorama by Elie Saab | TREVA Real Estate", en: "Panorama by Elie Saab | TREVA Real Estate", ru: "Panorama by Elie Saab | TREVA Недвижимость" },
      seoDescription: { az: "Yüksək dəb estetikası və müasir luxury-un sophistication birləşməsi.", en: "A sophisticated blend of high-fashion aesthetics and modern luxury.", ru: "Утонченное сочетание эстетики высокой моды и современной роскоши." },
      ogImage: "/uploads/layihelerimiz/panorama-cover.png",
    },
  ];

  for (const detail of projectDetails) {
    await prisma.layihelerimizProjectDetail.upsert({
      where: { categorySlug: detail.categorySlug },
      update: detail as any,
      create: { id: detail.categorySlug, ...detail } as any,
    });
  }
  console.log(`Seeded ${projectDetails.length} project details`);

  // Seed admin user
  const hashedPassword = await bcrypt.hash('Admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@treva.az' },
    update: {},
    create: { email: 'admin@treva.az', password: hashedPassword },
  });
  console.log("Seeded admin user");

  console.log("Multilingual seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
