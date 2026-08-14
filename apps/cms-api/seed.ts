import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('Admin123', 10);
  await prisma.user.upsert({
    where: { email: 'wearetrenders@gmail.com' },
    update: {},
    create: {
      email: 'wearetrenders@gmail.com',
      password: hashedPassword,
    },
  });
  console.log('✅ User seeded');

  // ─────────────────────────────────────────
  // FAQ
  // ─────────────────────────────────────────
  const faqs = [
    {
      question: { az: 'Sualınız nədir?', en: 'What is your question?', ru: 'Каков ваш вопрос?' },
      answer: { az: 'Cavabınız budur.', en: 'Here is your answer.', ru: 'Вот ваш ответ.' },
      order: 1,
      isVisible: true,
    },
    {
      question: { az: 'Necə əlaqə saxlaya bilərəm?', en: 'How can I contact you?', ru: 'Как я могу с вами связаться?' },
      answer: { az: 'Bizimlə email vasitəsilə əlaqə saxlaya bilərsiniz.', en: 'You can contact us via email.', ru: 'Вы можете связаться с нами по электронной почте.' },
      order: 2,
      isVisible: true,
    },
  ];
  if ((await prisma.faq.count()) === 0) {
    for (const faq of faqs) {
      await prisma.faq.create({ data: faq });
    }
  }
  console.log('✅ FAQs seeded');

  // ─────────────────────────────────────────
  // TESTIMONIALS
  // ─────────────────────────────────────────
  if ((await prisma.testimonialsSection.count()) === 0) {
    await prisma.testimonialsSection.create({
      data: {
        title: { az: 'Rəylər', en: 'Testimonials', ru: 'Отзывы' },
        description: {
          az: 'Müştərilərimizin rəyləri',
          en: 'What our clients say',
          ru: 'Что говорят наши клиенты',
        },
        testimonials: {
          create: [
            {
              image: '/uploads/testimonial-1.jpg',
              altText: 'Client photo',
              order: 1,
              name: { az: 'Əli Həsənov', en: 'Ali Hasanov', ru: 'Али Гасанов' },
              role: { az: 'CEO', en: 'CEO', ru: 'Генеральный директор' },
              company: { az: 'ABC Şirkəti', en: 'ABC Company', ru: 'Компания ABC' },
              quote: {
                az: 'Əla xidmət!',
                en: 'Excellent service!',
                ru: 'Отличный сервис!',
              },
            },
            {
              image: '/uploads/testimonial-2.jpg',
              altText: 'Client photo',
              order: 2,
              name: { az: 'Leyla Əliyeva', en: 'Leyla Aliyeva', ru: 'Лейла Алиева' },
              role: { az: 'Marketing Direktoru', en: 'Marketing Director', ru: 'Директор по маркетингу' },
              company: { az: 'XYZ MMC', en: 'XYZ LLC', ru: 'ООО XYZ' },
              quote: {
                az: 'Çox peşəkar komanda!',
                en: 'Very professional team!',
                ru: 'Очень профессиональная команда!',
              },
            },
          ],
        },
      },
    });
  }
  console.log('✅ Testimonials seeded');

  // ─────────────────────────────────────────
  // VACANCY CATEGORY & VACANCIES
  // ─────────────────────────────────────────
  const vacancyCategory =
    (await prisma.vacancyCategory.findFirst({
      orderBy: { order: 'asc' },
    })) ??
    (await prisma.vacancyCategory.create({
      data: {
        name: { az: 'Texnologiya', en: 'Technology', ru: 'Технологии' },
        order: 1,
      },
    }));

  await prisma.vacancy.upsert({
    where: { slug: 'frontend-developer' },
    update: {
      title: { az: 'Frontend Developer', en: 'Frontend Developer', ru: 'Frontend разработчик' },
      tags: { az: ['React', 'Next.js'], en: ['React', 'Next.js'], ru: ['React', 'Next.js'] },
      isNew: true,
      isVisible: true,
      order: 1,
      categoryId: vacancyCategory.id,
      aboutRole: {
        az: 'Frontend developer rolü haqqında məlumat.',
        en: 'About the frontend developer role.',
        ru: 'О роли frontend разработчика.',
      },
      requirements: {
        az: ['React bilikləri', 'TypeScript', '2+ il təcrübə'],
        en: ['React knowledge', 'TypeScript', '2+ years experience'],
        ru: ['Знание React', 'TypeScript', 'Опыт 2+ года'],
      },
      responsible: {
        az: ['UI komponentlər yaratmaq', 'API inteqrasiyası'],
        en: ['Create UI components', 'API integration'],
        ru: ['Создание UI компонентов', 'Интеграция API'],
      },
      skills: {
        az: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
        en: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
        ru: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
      },
    },
    create: {
      title: { az: 'Frontend Developer', en: 'Frontend Developer', ru: 'Frontend разработчик' },
      slug: 'frontend-developer',
      tags: { az: ['React', 'Next.js'], en: ['React', 'Next.js'], ru: ['React', 'Next.js'] },
      isNew: true,
      isVisible: true,
      order: 1,
      categoryId: vacancyCategory.id,
      aboutRole: {
        az: 'Frontend developer rolü haqqında məlumat.',
        en: 'About the frontend developer role.',
        ru: 'О роли frontend разработчика.',
      },
      requirements: {
        az: ['React bilikləri', 'TypeScript', '2+ il təcrübə'],
        en: ['React knowledge', 'TypeScript', '2+ years experience'],
        ru: ['Знание React', 'TypeScript', 'Опыт 2+ года'],
      },
      responsible: {
        az: ['UI komponentlər yaratmaq', 'API inteqrasiyası'],
        en: ['Create UI components', 'API integration'],
        ru: ['Создание UI компонентов', 'Интеграция API'],
      },
      skills: {
        az: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
        en: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
        ru: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
      },
    },
  });
  console.log('✅ Vacancies seeded');

  // ─────────────────────────────────────────
  // VACANCY PAGE HEADER
  // ─────────────────────────────────────────
  if ((await prisma.vacancyPageHeader.count()) === 0) {
    await prisma.vacancyPageHeader.create({
      data: {
        title: { az: 'Vakansiyalar', en: 'Vacancies', ru: 'Вакансии' },
      },
    });
  }

  // ─────────────────────────────────────────
  // VACANCY SETTINGS
  // ─────────────────────────────────────────
  if ((await prisma.vacancySettings.count()) === 0) {
    await prisma.vacancySettings.create({
      data: {
        backLabel: { az: 'Geri', en: 'Back', ru: 'Назад' },
        applyTitle: { az: 'Müraciət et', en: 'Apply Now', ru: 'Подать заявку' },
        aboutRoleLabel: { az: 'Rol haqqında', en: 'About the Role', ru: 'О роли' },
        skillsLabel: { az: 'Bacarıqlar', en: 'Skills', ru: 'Навыки' },
        responsibleLabel: { az: 'Məsuliyyətlər', en: 'Responsibilities', ru: 'Обязанности' },
        requirementsLabel: { az: 'Tələblər', en: 'Requirements', ru: 'Требования' },
        email: 'hr@example.com',
        emailHref: 'mailto:hr@example.com',
        phone: '+994 50 000 00 00',
        phoneHref: 'tel:+994500000000',
        location: { az: 'Bakı, Azərbaycan', en: 'Baku, Azerbaijan', ru: 'Баку, Азербайджан' },
        emailLabel: { az: 'Email', en: 'Email', ru: 'Почта' },
        phoneLabel: { az: 'Telefon', en: 'Phone', ru: 'Телефон' },
        locationLabel: { az: 'Ünvan', en: 'Location', ru: 'Адрес' },
        formCvLabel: { az: 'CV', en: 'CV', ru: 'Резюме' },
        formCvPlaceholder: { az: 'CV yükləyin', en: 'Upload CV', ru: 'Загрузить резюме' },
        formEmailLabel: { az: 'Email', en: 'Email', ru: 'Почта' },
        formEmailPlaceholder: { az: 'emailiniz@mail.com', en: 'your@email.com', ru: 'ваш@email.com' },
        formMessageLabel: { az: 'Mesaj', en: 'Message', ru: 'Сообщение' },
        formMessagePlaceholder: { az: 'Mesajınızı yazın', en: 'Write your message', ru: 'Напишите сообщение' },
        formNameLabel: { az: 'Ad', en: 'Name', ru: 'Имя' },
        formNamePlaceholder: { az: 'Adınız', en: 'Your name', ru: 'Ваше имя' },
        formPhoneLabel: { az: 'Telefon', en: 'Phone', ru: 'Телефон' },
        formPhonePlaceholder: { az: '+994 XX XXX XX XX', en: '+994 XX XXX XX XX', ru: '+994 XX XXX XX XX' },
        formSubmitLabel: { az: 'Göndər', en: 'Submit', ru: 'Отправить' },
      },
    });
  }
  console.log('✅ Vacancy settings seeded');

  // v2 qeydi: Portfolio / Partners / Service / Blog / OurTeam / About seed blokları
  // silindi — həmin modellər artıq schema-da yoxdur.

  if ((await prisma.navbarSettings.count()) === 0) {
    await prisma.navbarSettings.create({
      data: {
        logoImage: '/uploads/logo.svg',
        logoImageAlt: { az: 'Logo', en: 'Logo', ru: 'Логотип' },
        showSearch: true,
        showLang: true,
        links: {
          create: [
            { label: { az: 'Ana səhifə', en: 'Home', ru: 'Главная' }, href: '/', order: 1, isVisible: true },
            { label: { az: 'Haqqımızda', en: 'About', ru: 'О нас' }, href: '/about', order: 2, isVisible: true },
            { label: { az: 'Xidmətlər', en: 'Services', ru: 'Услуги' }, href: '/services', order: 3, isVisible: true },
            { label: { az: 'Portfel', en: 'Portfolio', ru: 'Портфолио' }, href: '/portfolio', order: 4, isVisible: true },
            { label: { az: 'Bloq', en: 'Blog', ru: 'Блог' }, href: '/blog', order: 5, isVisible: true },
            { label: { az: 'Əlaqə', en: 'Contact', ru: 'Контакт' }, href: '/contact', order: 6, isVisible: true },
          ],
        },
      },
    });
  }
  console.log('✅ Navbar seeded');

  // ─────────────────────────────────────────
  // FOOTER SETTINGS
  // ─────────────────────────────────────────
  if ((await prisma.footerSettings.count()) === 0) {
    await prisma.footerSettings.create({
      data: {
        logoImage: '/uploads/logo.svg',
        logoAlt: { az: 'Logo', en: 'Logo', ru: 'Логотип' },
        description: {
          az: 'Şirkətimizin qısa təsviri.',
          en: 'Brief description of our company.',
          ru: 'Краткое описание нашей компании.',
        },
        copyrightText: { az: '© 2025 Şirkət. Bütün hüquqlar qorunur.', en: '© 2025 Company. All rights reserved.', ru: '© 2025 Компания. Все права защищены.' },
        privacyText: { az: 'Gizlilik Siyasəti', en: 'Privacy Policy', ru: 'Политика конфиденциальности' },
        locationLabel: { az: 'Ünvan', en: 'Location', ru: 'Адрес' },
        phoneLabel: { az: 'Telefon', en: 'Phone', ru: 'Телефон' },
        emailLabel: { az: 'Email', en: 'Email', ru: 'Почта' },
        locationValue: { az: 'Bakı, Azərbaycan', en: 'Baku, Azerbaijan', ru: 'Баку, Азербайджан' },
        phoneValue: { az: '+994 50 000 00 00', en: '+994 50 000 00 00', ru: '+994 50 000 00 00' },
        emailValue: { az: 'info@example.com', en: 'info@example.com', ru: 'info@example.com' },
        navLinks: {
          create: [
            { label: { az: 'Ana səhifə', en: 'Home', ru: 'Главная' }, href: '/', order: 1 },
            { label: { az: 'Haqqımızda', en: 'About', ru: 'О нас' }, href: '/about', order: 2 },
            { label: { az: 'Əlaqə', en: 'Contact', ru: 'Контакт' }, href: '/contact', order: 3 },
          ],
        },
        socialLinks: {
          create: [
            { icon: '/uploads/instagram.svg', href: 'https://instagram.com', order: 1 },
            { icon: '/uploads/linkedin.svg', href: 'https://linkedin.com', order: 2 },
          ],
        },
      },
    });
  }
  console.log('✅ Footer seeded');

  // ─────────────────────────────────────────
  // PULSE CMS
  // ─────────────────────────────────────────
  const pulseCategories = [
    { name: 'Bloq', slug: 'blog' },
    { name: 'Kampaniya', slug: 'kampaniya' },
    { name: 'Tədbir', slug: 'tedbir' },
    { name: 'Analizlər', slug: 'analizler' },
    { name: 'Xəbərlər', slug: 'xeberler' },
  ];
  for (const cat of pulseCategories) {
    await prisma.pulseCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Pulse categories seeded');

  const pulseAuthors = [
    { name: { az: 'Əli Məmmədov', en: 'Əli Məmmədov', ru: 'Əli Məmmədov' }, slug: 'ali-mammadov', title: { az: 'Baş redaktor', en: 'Baş redaktor', ru: 'Baş redaktor' }, description: { az: 'Pulse baş redaktoru', en: 'Pulse baş redaktoru', ru: 'Pulse baş redaktoru' } },
    { name: { az: 'Leyla Hüseynova', en: 'Leyla Hüseynova', ru: 'Leyla Hüseynova' }, slug: 'leyla-huseynova', title: { az: 'Müəllif', en: 'Müəllif', ru: 'Müəllif' }, description: { az: 'Texnologiya üzrə müəllif', en: 'Texnologiya üzrə müəllif', ru: 'Texnologiya üzrə müəllif' } },
    { name: { az: 'Kənan Rəhimov', en: 'Kənan Rəhimov', ru: 'Kənan Rəhimov' }, slug: 'kenan-rahimov', title: { az: 'Müəllif', en: 'Müəllif', ru: 'Müəllif' }, description: { az: 'Biznes üzrə müəllif', en: 'Biznes üzrə müəllif', ru: 'Biznes üzrə müəllif' } },
  ];
  for (const author of pulseAuthors) {
    await prisma.pulseAuthor.upsert({
      where: { slug: author.slug },
      update: { name: author.name, title: author.title, description: author.description },
      create: author,
    });
  }
  console.log('✅ Pulse authors seeded');

  const pulseKeywords = [
    { name: { az: 'Texnologiya', en: 'Texnologiya', ru: 'Texnologiya' }, slug: 'texnologiya' },
    { name: { az: 'Biznes', en: 'Biznes', ru: 'Biznes' }, slug: 'biznes' },
    { name: { az: 'Marketing', en: 'Marketing', ru: 'Marketing' }, slug: 'marketing' },
    { name: { az: 'Startap', en: 'Startap', ru: 'Startap' }, slug: 'startap' },
    { name: { az: 'Rəqəmsal', en: 'Rəqəmsal', ru: 'Rəqəmsal' }, slug: 'reqemsal' },
  ];
  for (const kw of pulseKeywords) {
    await prisma.pulseKeyword.upsert({
      where: { slug: kw.slug },
      update: { name: kw.name },
      create: kw,
    });
  }
  console.log('✅ Pulse keywords seeded');

  const ali = await prisma.pulseAuthor.findUnique({ where: { slug: 'ali-mammadov' } });
  const texnologiya = await prisma.pulseKeyword.findUnique({ where: { slug: 'texnologiya' } });
  const biznes = await prisma.pulseKeyword.findUnique({ where: { slug: 'biznes' } });

  const pulseArticles = [
    {
      slug: 'rəqəmsal transformasiya',
      title: 'Rəqəmsal Transformasiya: 2026-cı ilin Trendləri',
      category: 'Analizlər',
      excerpt: 'Müasir şirkətlər rəqəmsal transformasiya prosesini necə sürətləndirir.',
      authorId: ali?.id,
      published: true,
      featured: true,
      headerPositions: ['left'],
      headerOrder: 1,
      blocks: [
        { type: 'heading', content: 'Rəqəmsal Transformasiya', level: 2 },
        { type: 'paragraph', content: 'Müasir dünyada rəqəmsal transformasiya şirkətlərin rəqabət qabiliyyətini artırmaq üçün vacibdir.' },
        { type: 'paragraph', content: 'Bu məqalədə 2026-cı ilin əsas trendlərini nəzərdən keçirəcəyik.' },
      ],
    },
    {
      slug: 'startap-ekosistemi',
      title: 'Azərbaycan Startap Ekosistemi',
      category: 'Bloq',
      excerpt: 'Ölkəmizdə startap ekosisteminin inkişafı haqqında.',
      authorId: ali?.id,
      published: true,
      featured: true,
      headerPositions: ['center'],
      headerOrder: 1,
      blocks: [
        { type: 'heading', content: 'Startap Ekosistemi', level: 2 },
        { type: 'paragraph', content: 'Azərbaycan son illərdə startap ekosisteminə ciddi investisiyalar qoyur.' },
      ],
    },
    {
      slug: 'kampaniya-yay-2026',
      title: 'Yay Kampaniyası: Endirimlər',
      category: 'Kampaniya',
      excerpt: 'Bu yay üçün xüsusi endirim kampaniyamız.',
      authorId: ali?.id,
      published: true,
      featured: false,
      headerPositions: ['right'],
      headerOrder: 1,
      blocks: [
        { type: 'heading', content: 'Yay Kampaniyası', level: 2 },
        { type: 'paragraph', content: 'Endirimlər 30% endirimlə başlayır.' },
      ],
    },
    {
      slug: 'həftənin-seçimi-1',
      title: 'Həftənin Seçimi: Süni İntellekt',
      category: 'Xəbərlər',
      excerpt: 'Süni intellektin business-a təsiri.',
      authorId: ali?.id,
      published: true,
      featured: true,
      headerPositions: ['week'],
      headerOrder: 1,
      blocks: [
        { type: 'heading', content: 'Süni İntellekt', level: 2 },
        { type: 'paragraph', content: 'AI technologies are reshaping how businesses operate.' },
      ],
    },
  ];

  for (const article of pulseArticles) {
    const existing = await prisma.pulseArticle.findUnique({ where: { slug: article.slug } });
    if (!existing) {
      const { slug, title, category, excerpt, authorId, published, featured, headerPositions, headerOrder, blocks } = article;
      await prisma.pulseArticle.create({
        data: {
          slug, title, category, excerpt, authorId, published, featured, headerPositions, headerOrder, blocks,
          keywords: { connect: texnologiya ? [{ id: texnologiya.id }] : [] },
        },
      });
    }
  }
  console.log('✅ Pulse articles seeded');

  console.log('\n🎉 All done! Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
