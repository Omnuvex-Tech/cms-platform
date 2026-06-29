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
  for (const faq of faqs) {
    await prisma.faq.create({ data: faq });
  }
  console.log('✅ FAQs seeded');

  // ─────────────────────────────────────────
  // TESTIMONIALS
  // ─────────────────────────────────────────
  const testimonialsSection = await prisma.testimonialsSection.create({
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
  console.log('✅ Testimonials seeded');

  // ─────────────────────────────────────────
  // VACANCY CATEGORY & VACANCIES
  // ─────────────────────────────────────────
  const vacancyCategory = await prisma.vacancyCategory.create({
    data: {
      name: { az: 'Texnologiya', en: 'Technology', ru: 'Технологии' },
      order: 1,
    },
  });

  await prisma.vacancy.create({
    data: {
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
  await prisma.vacancyPageHeader.create({
    data: {
      title: { az: 'Vakansiyalar', en: 'Vacancies', ru: 'Вакансии' },
    },
  });

  // ─────────────────────────────────────────
  // VACANCY SETTINGS
  // ─────────────────────────────────────────
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
  console.log('✅ Vacancy settings seeded');

  // ─────────────────────────────────────────
  // PORTFOLIO SETTINGS
  // ─────────────────────────────────────────
  await prisma.portfolioSettings.create({
    data: {
      sectionTitle: { az: 'Portfel', en: 'Portfolio', ru: 'Портфолио' },
      dropdownLabel: { az: 'Kateqoriya', en: 'Category', ru: 'Категория' },
      moreButtonLabel: { az: 'Daha çox', en: 'Load More', ru: 'Загрузить ещё' },
    },
  });

  // ─────────────────────────────────────────
  // PORTFOLIO
  // ─────────────────────────────────────────
  await prisma.portfolio.create({
    data: {
      title: { az: 'Layihə 1', en: 'Project 1', ru: 'Проект 1' },
      slug: 'project-1',
      tags: ['web', 'design'],
      coverImage: '/uploads/portfolio-1.jpg',
      coverImageAlt: { az: 'Layihə 1 şəkli', en: 'Project 1 image', ru: 'Изображение проекта 1' },
      order: 1,
      isVisible: true,
      isHomepage: true,
      sections: [],
    },
  });
  console.log('✅ Portfolio seeded');

  // ─────────────────────────────────────────
  // PARTNER SECTION & PARTNERS
  // ─────────────────────────────────────────
  const partnerSection = await prisma.partnerSection.create({
    data: {
      title: { az: 'Tərəfdaşlarımız', en: 'Our Partners', ru: 'Наши партнёры' },
      description: {
        az: 'Etibarlı tərəfdaşlarımız',
        en: 'Our trusted partners',
        ru: 'Наши надёжные партнёры',
      },
      partners: {
        create: [
          {
            image: '/uploads/partner-1.png',
            altText: { az: 'Tərəfdaş 1', en: 'Partner 1', ru: 'Партнёр 1' },
            name: { az: 'Tərəfdaş 1', en: 'Partner 1', ru: 'Партнёр 1' },
            order: 1,
            isHomepage: true,
            isVisible: true,
          },
          {
            image: '/uploads/partner-2.png',
            altText: { az: 'Tərəfdaş 2', en: 'Partner 2', ru: 'Партнёр 2' },
            name: { az: 'Tərəfdaş 2', en: 'Partner 2', ru: 'Партнёр 2' },
            order: 2,
            isHomepage: true,
            isVisible: true,
          },
        ],
      },
    },
  });
  console.log('✅ Partners seeded');

  // ─────────────────────────────────────────
  // SERVICE
  // ─────────────────────────────────────────
  await prisma.service.create({
    data: {
      number: '01',
      slug: 'web-development',
      badge: { az: 'Veb', en: 'Web', ru: 'Веб' },
      title: { az: 'Veb Tərtibat', en: 'Web Development', ru: 'Веб-разработка' },
      description: {
        az: 'Müasir veb həllər.',
        en: 'Modern web solutions.',
        ru: 'Современные веб-решения.',
      },
      image: '/uploads/service-1.jpg',
      imageAlt: { az: 'Veb Tərtibat', en: 'Web Development', ru: 'Веб-разработка' },
      features: [
        { az: 'Responsive dizayn', en: 'Responsive design', ru: 'Адаптивный дизайн' },
        { az: 'SEO optimallaşdırma', en: 'SEO optimization', ru: 'SEO-оптимизация' },
      ],
      portfolioButtonText: { az: 'Portfeli gör', en: 'View Portfolio', ru: 'Смотреть портфолио' },
      detailButtonText: { az: 'Ətraflı', en: 'Learn More', ru: 'Подробнее' },
      order: 1,
      isVisible: true,
      sections: [],
    },
  });
  console.log('✅ Services seeded');

  // ─────────────────────────────────────────
  // BLOG AUTHOR
  // ─────────────────────────────────────────
  const blogAuthor = await prisma.blogAuthor.create({
    data: {
      name: { az: 'Əli Məmmədov', en: 'Ali Mammadov', ru: 'Али Мамедов' },
      role: { az: 'Baş Redaktor', en: 'Editor in Chief', ru: 'Главный редактор' },
      slug: 'ali-mammadov',
      bio: {
        az: 'Texnologiya üzrə yazıçı.',
        en: 'Tech writer and blogger.',
        ru: 'Автор статей о технологиях.',
      },
      avatar: '/uploads/author-1.jpg',
      avatarAlt: { az: 'Əli Məmmədov', en: 'Ali Mammadov', ru: 'Али Мамедов' },
      skillsTitle: { az: 'Bacarıqlar', en: 'Skills', ru: 'Навыки' },
      skills: [
        { az: 'Yazı', en: 'Writing', ru: 'Написание' },
        { az: 'SEO', en: 'SEO', ru: 'SEO' },
      ],
      linkedinHref: 'https://linkedin.com',
      isOurTeam: true,
      isVisible: true,
      order: 1,
    },
  });

  // ─────────────────────────────────────────
  // BLOG CATEGORY
  // ─────────────────────────────────────────
  const blogCategory = await prisma.blogCategory.create({
    data: {
      label: { az: 'Texnologiya', en: 'Technology', ru: 'Технологии' },
      slug: 'technology',
      order: 1,
    },
  });

  // ─────────────────────────────────────────
  // BLOG
  // ─────────────────────────────────────────
  await prisma.blog.create({
    data: {
      title: { az: 'İlk Bloq Yazısı', en: 'First Blog Post', ru: 'Первая запись в блоге' },
      slug: 'first-blog-post',
      badge: { az: 'Yeni', en: 'New', ru: 'Новое' },
      excerpt: {
        az: 'Bu ilk bloq yazısının xülasəsidir.',
        en: 'This is the excerpt of the first blog post.',
        ru: 'Это краткое содержание первой записи в блоге.',
      },
      coverImage: { az: '/uploads/blog-1.jpg', en: '/uploads/blog-1.jpg', ru: '/uploads/blog-1.jpg' },
      coverImageAlt: { az: 'Bloq şəkli', en: 'Blog image', ru: 'Изображение блога' },
      isVisible: true,
      isFeaturedMain: true,
      authorId: blogAuthor.id,
      categoryId: blogCategory.id,
      sections: [],
      order: 1,
    },
  });
  console.log('✅ Blog seeded');

  // ─────────────────────────────────────────
  // BLOG SETTINGS
  // ─────────────────────────────────────────
  await prisma.blogSettings.create({
    data: {
      pageTitle: { az: 'Bloq', en: 'Blog', ru: 'Блог' },
      buttonText: { az: 'Portfeli gör', en: 'View Portfolio', ru: 'Портфолио' },
      buttonLink: '/portfolio',
      quoteText: { az: 'Sitat mətni', en: 'Quote text', ru: 'Текст цитаты' },
      quoteImage: { az: '/uploads/quote.jpg', en: '/uploads/quote.jpg', ru: '/uploads/quote.jpg' },
      quoteImageAlt: { az: 'Sitat şəkli', en: 'Quote image', ru: 'Изображение цитаты' },
      searchPlaceholder: { az: 'Axtar...', en: 'Search...', ru: 'Поиск...' },
      categoriesLabel: { az: 'Kateqoriyalar', en: 'Categories', ru: 'Категории' },
      pickOfWeekLabel: { az: 'Həftənin seçimi', en: 'Pick of the Week', ru: 'Выбор недели' },
      moreBlogsButtonText: { az: 'Daha çox bloq', en: 'More Blogs', ru: 'Больше статей' },
    },
  });
  console.log('✅ Blog settings seeded');


  await prisma.ourTeamSettings.create({
    data: {
      title: { az: 'Komandamız', en: 'Our Team', ru: 'Наша команда' },
      description: {
        az: 'Peşəkar komandamızla tanış olun.',
        en: 'Meet our professional team.',
        ru: 'Познакомьтесь с нашей командой.',
      },
      moreBtn: { az: 'Daha çox', en: 'See More', ru: 'Подробнее' },
    },
  });
  console.log('✅ OurTeam settings seeded');

  await prisma.aboutSettings.create({
    data: {
      heroImage: '/uploads/about-hero.jpg',
      heroImageAlt: { az: 'Haqqımızda', en: 'About Us', ru: 'О нас' },
      heroBadge: { az: 'Haqqımızda', en: 'About Us', ru: 'О нас' },
      heroTitle: { az: 'Biz kimik?', en: 'Who Are We?', ru: 'Кто мы?' },
      heroParagraphs: [
        { az: 'Şirkətimiz haqqında məlumat.', en: 'Information about our company.', ru: 'Информация о нашей компании.' },
      ],
      storyBlocks: [],
      teamTitle: { az: 'Komandamız', en: 'Our Team', ru: 'Наша команда' },
      teamDescription: {
        az: 'Güclü komandamızla tanış olun.',
        en: 'Meet our strong team.',
        ru: 'Познакомьтесь с нашей командой.',
      },
      teamCtaLabel: { az: 'Komandaya bax', en: 'View Team', ru: 'Смотреть команду' },
      teamCtaHref: '/team',
      heroStats: [],
    },
  });
  console.log('✅ About settings seeded');

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
  console.log('✅ Navbar seeded');

  // ─────────────────────────────────────────
  // FOOTER SETTINGS
  // ─────────────────────────────────────────
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
    { name: 'Əli Məmmədov', slug: 'ali-mammadov', title: 'Baş redaktor', description: 'Pulse baş redaktoru' },
    { name: 'Leyla Hüseynova', slug: 'leyla-huseynova', title: 'Müəllif', description: 'Texnologiya üzrə müəllif' },
    { name: 'Kənan Rəhimov', slug: 'kenan-rahimov', title: 'Müəllif', description: 'Biznes üzrə müəllif' },
  ];
  for (const author of pulseAuthors) {
    await prisma.pulseAuthor.upsert({
      where: { slug: author.slug },
      update: {},
      create: author,
    });
  }
  console.log('✅ Pulse authors seeded');

  const pulseKeywords = [
    { name: 'Texnologiya', slug: 'texnologiya' },
    { name: 'Biznes', slug: 'biznes' },
    { name: 'Marketing', slug: 'marketing' },
    { name: 'Startap', slug: 'startap' },
    { name: 'Rəqəmsal', slug: 'reqemsal' },
  ];
  for (const kw of pulseKeywords) {
    await prisma.pulseKeyword.upsert({
      where: { slug: kw.slug },
      update: {},
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
      headerPosition: 'left',
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
      headerPosition: 'center',
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
      headerPosition: 'right',
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
      headerPosition: 'week',
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
      const { slug, title, category, excerpt, authorId, published, featured, headerPosition, headerOrder, blocks } = article;
      await prisma.pulseArticle.create({
        data: {
          slug, title, category, excerpt, authorId, published, featured, headerPosition, headerOrder, blocks,
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