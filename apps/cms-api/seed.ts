import { BulletType, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const t = (az: string, en = az, ru = en) => ({ az, en, ru });

async function seedAdmin() {
  const password = await bcrypt.hash('Admin123', 10);

  await prisma.user.upsert({
    where: { email: 'wearetrenders@gmail.com' },
    update: {},
    create: {
      email: 'wearetrenders@gmail.com',
      password,
    },
  });

  console.log('OK user');
}

async function seedFaqs() {
  if ((await prisma.faq.count()) > 0) return;

  const faqs = [
    {
      question: t('Sualiniz nedir?', 'What is your question?', 'Kakov vash vopros?'),
      answer: t('Cavabiniz budur.', 'Here is your answer.', 'Vot vash otvet.'),
      order: 1,
      isVisible: true,
    },
    {
      question: t(
        'Nece elaqe saxlaya bilerem?',
        'How can I contact you?',
        'Kak ya mogu svyazatsya s vami?',
      ),
      answer: t(
        'Bizimle email vasitesile elaqe saxlaya bilersiniz.',
        'You can contact us via email.',
        'Vy mozhete svyazatsya s nami po elektronnoy pochte.',
      ),
      order: 2,
      isVisible: true,
    },
  ];

  for (const faq of faqs) {
    await prisma.faq.create({ data: faq });
  }

  console.log('OK faqs');
}

async function seedTestimonials() {
  if ((await prisma.testimonial.count()) > 0) return;

  await prisma.testimonialsSection.create({
    data: {
      title: t('Reyler', 'Testimonials', 'Otzivy'),
      description: t(
        'Musterilerimizin reyleri',
        'What our clients say',
        'Chto govoryat nashi klienty',
      ),
      testimonials: {
        create: [
          {
            image: '/uploads/testimonial-1.jpg',
            altText: 'Client photo',
            order: 1,
            name: t('Eli Hesenov', 'Ali Hasanov', 'Ali Gasanov'),
            role: t('CEO'),
            company: t('ABC Sirketi', 'ABC Company', 'Kompaniya ABC'),
            quote: t('Ela xidmet!', 'Excellent service!', 'Otlichnyy servis!'),
          },
          {
            image: '/uploads/testimonial-2.jpg',
            altText: 'Client photo',
            order: 2,
            name: t('Leyla Eliyeva', 'Leyla Aliyeva', 'Leyla Alieva'),
            role: t('Marketing Direktoru', 'Marketing Director', 'Direktor po marketingu'),
            company: t('XYZ MMC', 'XYZ LLC', 'OOO XYZ'),
            quote: t(
              'Cox pesekar komanda!',
              'Very professional team!',
              'Ochen professionalnaya komanda!',
            ),
          },
        ],
      },
    },
  });

  console.log('OK testimonials');
}

async function seedVacancy() {
  let category = await prisma.vacancyCategory.findFirst({
    orderBy: { order: 'asc' },
  });

  if (!category) {
    category = await prisma.vacancyCategory.create({
      data: {
        name: t('Texnologiya', 'Technology', 'Tekhnologii'),
        order: 1,
      },
    });
  }

  if ((await prisma.vacancyFilterTag.count()) === 0) {
    const filterTags = [
      { label: t('Remote'), order: 0, isActive: true },
      { label: t('Full-time', 'Full-time', 'Polnaya zanyatost'), order: 1, isActive: true },
      { label: t('Baku'), order: 2, isActive: false },
    ];

    for (const tag of filterTags) {
      await prisma.vacancyFilterTag.create({ data: tag });
    }
  }

  const activeFilterTags = await prisma.vacancyFilterTag.findMany({
    orderBy: { order: 'asc' },
    take: 2,
  });

  const vacancies = [
    {
      title: t('Frontend Developer', 'Frontend Developer', 'Frontend razrabotchik'),
      slug: 'frontend-developer',
      tags: ['React', 'Next.js'],
      isNew: true,
      order: 1,
      aboutRole: t(
        'Frontend developer rolu haqqinda melumat.',
        'About the frontend developer role.',
        'O roli frontend razrabotchika.',
      ),
      requirements: [
        t('React bilikleri', 'React knowledge', 'Znanie React'),
        t('TypeScript'),
        t('2+ il tecrube', '2+ years experience', 'Opyt 2+ goda'),
      ],
      responsible: [
        t('UI komponentler yaratmaq', 'Create UI components', 'Sozdavat UI komponenty'),
        t('API integrasiyasi', 'API integration', 'Integratsiya API'),
      ],
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
    },
    {
      title: t('Backend Developer', 'Backend Developer', 'Backend razrabotchik'),
      slug: 'backend-developer',
      tags: ['Node.js', 'NestJS'],
      isNew: false,
      order: 2,
      aboutRole: t(
        'Backend developer rolu haqqinda melumat.',
        'About the backend developer role.',
        'O roli backend razrabotchika.',
      ),
      requirements: [
        t('Node.js bilikleri', 'Node.js knowledge', 'Znanie Node.js'),
        t('PostgreSQL'),
        t('API tecrubesi', 'API experience', 'Opyt raboty s API'),
      ],
      responsible: [
        t('API qurmaq', 'Build APIs', 'Razrabatyvat API'),
        t('Verilenler bazasi dizayni', 'Design databases', 'Proektirovat bazy dannykh'),
      ],
      skills: ['Node.js', 'NestJS', 'PostgreSQL'],
    },
    {
      title: t('UI/UX Designer', 'UI/UX Designer', 'UI/UX dizayner'),
      slug: 'ui-ux-designer',
      tags: ['Figma', 'Design Systems'],
      isNew: false,
      order: 3,
      aboutRole: t(
        'UI/UX designer rolu haqqinda melumat.',
        'About the UI/UX designer role.',
        'O roli UI/UX dizaynera.',
      ),
      requirements: [
        t('Figma bilikleri', 'Figma knowledge', 'Znanie Figma'),
        t('Portfolio tecrubesi', 'Portfolio experience', 'Opyt s portfolio'),
      ],
      responsible: [
        t('Istifadeci axinlari qurmaq', 'Design user flows', 'Proektirovat user flow'),
        t('Interfeys dizayn etmek', 'Design interfaces', 'Razrabatyvat interfeysy'),
      ],
      skills: ['Figma', 'UX Research', 'Prototyping'],
    },
  ];

  for (const item of vacancies) {
    await prisma.vacancy.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        title: item.title,
        slug: item.slug,
        tags: item.tags,
        isNew: item.isNew,
        isVisible: true,
        order: item.order,
        categoryId: category.id,
        aboutRole: item.aboutRole,
        newLabel: t('Yeni', 'New', 'Novoe'),
        requirements: item.requirements,
        requirementsType: BulletType.BULLET,
        responsible: item.responsible,
        responsibleType: BulletType.BULLET,
        skills: item.skills,
        filterTags: {
          connect: activeFilterTags.map((filterTag) => ({ id: filterTag.id })),
        },
      },
    });
  }

  if ((await prisma.vacancyPageHeader.count()) === 0) {
    await prisma.vacancyPageHeader.create({
      data: { title: t('Vakansiyalar', 'Vacancies', 'Vakansii') },
    });
  }

  if (!(await prisma.vacancySettings.findFirst())) {
    await prisma.vacancySettings.create({
      data: {
        backLabel: t('Geri', 'Back', 'Nazad'),
        detailButtonLabel: t('Etrafli bax', 'View details', 'Smotret podrobnee'),
        dropdownLabel: t('Kateqoriya secin', 'Select category', 'Vyberite kategoriyu'),
        applyTitle: t('Muraciet et', 'Apply now', 'Podat zayavku'),
        aboutRoleLabel: t('Rol haqqinda', 'About the role', 'O roli'),
        skillsLabel: t('Bacariqlar', 'Skills', 'Navyki'),
        responsibleLabel: t('Mesuliyyetler', 'Responsibilities', 'Obyazannosti'),
        requirementsLabel: t('Telebler', 'Requirements', 'Trebovaniya'),
        email: 'hr@example.com',
        emailHref: 'mailto:hr@example.com',
        phone: '+994 50 000 00 00',
        phoneHref: 'tel:+994500000000',
        location: t('Baki, Azerbaycan', 'Baku, Azerbaijan', 'Baku, Azerbaydzhan'),
        emailLabel: t('Email'),
        phoneLabel: t('Telefon', 'Phone', 'Telefon'),
        locationLabel: t('Unvan', 'Location', 'Adres'),
        formCvLabel: t('CV'),
        formCvPlaceholder: t('CV yukleyin', 'Upload CV', 'Zagruzite rezyume'),
        formEmailLabel: t('Email'),
        formEmailPlaceholder: t('emailiniz@mail.com', 'your@email.com', 'vash@email.com'),
        formMessageLabel: t('Mesaj', 'Message', 'Soobshchenie'),
        formMessagePlaceholder: t(
          'Mesajinizi yazin',
          'Write your message',
          'Napishete vashe soobshchenie',
        ),
        formNameLabel: t('Ad', 'Name', 'Imya'),
        formNamePlaceholder: t('Adiniz', 'Your name', 'Vashe imya'),
        formPhoneLabel: t('Telefon', 'Phone', 'Telefon'),
        formPhonePlaceholder: t('+994 XX XXX XX XX'),
        formSubmitLabel: t('Gonder', 'Submit', 'Otpravit'),
      },
    });
  }

  console.log('OK vacancy');
}

async function seedServicesAndPortfolio() {
  const services = [
    {
      number: '01',
      slug: 'web-development',
      badge: t('Veb', 'Web', 'Veb'),
      title: t('Veb Tertibat', 'Web Development', 'Veb-razrabotka'),
      description: t(
        'Muasir veb heller.',
        'Modern web solutions.',
        'Sovremennye veb-resheniya.',
      ),
      image: '/uploads/service-1.jpg',
      imageAlt: t('Veb Tertibat', 'Web Development', 'Veb-razrabotka'),
      homeCoverImage: '/uploads/service-home-cover.jpg',
      features: [
        t('Responsive dizayn', 'Responsive design', 'Adaptivnyy dizayn'),
        t('SEO optimallasdirma', 'SEO optimization', 'SEO-optimizatsiya'),
      ],
      order: 1,
    },
    {
      number: '02',
      slug: 'branding',
      badge: t('Brend', 'Brand', 'Brend'),
      title: t('Brendinq', 'Branding', 'Brending'),
      description: t(
        'Brend strategiyasi ve vizual kimlik.',
        'Brand strategy and visual identity.',
        'Brend strategiya i vizualnaya identichnost.',
      ),
      image: '/uploads/service-2.jpg',
      imageAlt: t('Brendinq', 'Branding', 'Brending'),
      homeCoverImage: '/uploads/service-home-cover-2.jpg',
      features: [
        t('Logo sistemi', 'Logo systems', 'Logo sistema'),
        t('Vizual dil', 'Visual language', 'Vizualnyy yazyk'),
      ],
      order: 2,
    },
    {
      number: '03',
      slug: 'digital-marketing',
      badge: t('Marketinq', 'Marketing', 'Marketing'),
      title: t('Reqemsal Marketinq', 'Digital Marketing', 'Tsifrovoy marketing'),
      description: t(
        'Performans ve boyume yonumlu marketinq.',
        'Performance and growth-focused marketing.',
        'Marketing, orientirovannyy na rost i effektivnost.',
      ),
      image: '/uploads/service-3.jpg',
      imageAlt: t('Reqemsal Marketinq', 'Digital Marketing', 'Tsifrovoy marketing'),
      homeCoverImage: '/uploads/service-home-cover-3.jpg',
      features: [
        t('Media planlama', 'Media planning', 'Mediaplanirovanie'),
        t('Analitika', 'Analytics', 'Analitika'),
      ],
      order: 3,
    },
  ];

  const createdServices: Array<{ id: number; slug: string }> = [];

  for (const item of services) {
    const service = await prisma.service.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        number: item.number,
        slug: item.slug,
        badge: item.badge,
        title: item.title,
        description: item.description,
        image: item.image,
        imageAlt: item.imageAlt,
        homeCoverImage: item.homeCoverImage,
        features: item.features,
        portfolioButtonText: t('Portfeli gor', 'View portfolio', 'Smotret portfolio'),
        detailButtonText: t('Etrafli', 'Learn more', 'Podrobnee'),
        order: item.order,
        isVisible: true,
        sections: [],
      },
    });

    createdServices.push({ id: service.id, slug: service.slug });
  }

  if (!(await prisma.portfolioSettings.findFirst())) {
    await prisma.portfolioSettings.create({
      data: {
        sectionTitle: t('Portfel', 'Portfolio', 'Portfolio'),
        dropdownLabel: t('Kateqoriya', 'Category', 'Kategoriya'),
        moreButtonLabel: t('Daha cox', 'Load more', 'Zagruzit eshche'),
      },
    });
  }

  const portfolios = [
    {
      title: t('Layihe 1', 'Project 1', 'Proekt 1'),
      slug: 'project-1',
      coverImage: '/uploads/portfolio-1.jpg',
      coverImageAlt: t('Layihe 1 sekli', 'Project 1 image', 'Izobrazhenie proekta 1'),
      order: 1,
      serviceSlug: 'web-development',
    },
    {
      title: t('Brand Refresh', 'Brand Refresh', 'Obnovlenie Brenda'),
      slug: 'brand-refresh',
      coverImage: '/uploads/portfolio-2.jpg',
      coverImageAlt: t('Brand refresh sekli', 'Brand refresh image', 'Izobrazhenie obnovleniya brenda'),
      order: 2,
      serviceSlug: 'branding',
    },
    {
      title: t('Growth Campaign', 'Growth Campaign', 'Growth Campaign'),
      slug: 'growth-campaign',
      coverImage: '/uploads/portfolio-3.jpg',
      coverImageAlt: t('Growth campaign sekli', 'Growth campaign image', 'Izobrazhenie growth campaign'),
      order: 3,
      serviceSlug: 'digital-marketing',
    },
  ];

  for (const item of portfolios) {
    const portfolio = await prisma.portfolio.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        title: item.title,
        slug: item.slug,
        coverImage: item.coverImage,
        coverImageAlt: item.coverImageAlt,
        order: item.order,
        isVisible: true,
        isHomepage: item.order === 1,
        sections: [],
      },
    });

    const linkedService = createdServices.find((service) => service.slug === item.serviceSlug);

    if (linkedService) {
      await prisma.portfolioService.upsert({
        where: {
          portfolioId_serviceId: {
            portfolioId: portfolio.id,
            serviceId: linkedService.id,
          },
        },
        update: {},
        create: {
          portfolioId: portfolio.id,
          serviceId: linkedService.id,
          coverImage: item.coverImage,
          coverImageAlt: item.coverImageAlt,
        },
      });
    }
  }

  console.log('OK services and portfolio');
}

async function seedPartners() {
  if ((await prisma.partnerSection.count()) > 0) return;

  await prisma.partnerSection.create({
    data: {
      title: t('Terefdaslarimiz', 'Our partners', 'Nashi partnery'),
      description: t(
        'Etibarli terefdaslarimiz',
        'Our trusted partners',
        'Nashi nadezhnye partnery',
      ),
      partners: {
        create: [
          {
            image: '/uploads/partner-1.png',
            altText: t('Terefdas 1', 'Partner 1', 'Partner 1'),
            name: t('Terefdas 1', 'Partner 1', 'Partner 1'),
            order: 1,
            isHomepage: true,
            isVisible: true,
          },
          {
            image: '/uploads/partner-2.png',
            altText: t('Terefdas 2', 'Partner 2', 'Partner 2'),
            name: t('Terefdas 2', 'Partner 2', 'Partner 2'),
            order: 2,
            isHomepage: true,
            isVisible: true,
          },
        ],
      },
    },
  });

  console.log('OK partners');
}

async function seedBlog() {
  const authors = [
    {
      slug: 'ali-mammadov',
      name: t('Eli Memmedov', 'Ali Mammadov', 'Ali Mamedov'),
      role: t('Bas Redaktor', 'Editor in Chief', 'Glavnyy redaktor'),
      bio: t(
        'Texnologiya uzre yazici.',
        'Tech writer and blogger.',
        'Avtor statey o tekhnologiyakh.',
      ),
      avatar: '/uploads/author-1.jpg',
      order: 1,
    },
    {
      slug: 'nermin-aliyeva',
      name: t('Nermin Eliyeva', 'Nermin Aliyeva', 'Nermin Alieva'),
      role: t('Strategiya Yazari', 'Strategy Writer', 'Strategicheskiy avtor'),
      bio: t(
        'Brend ve strategiya movzularinda yazir.',
        'Writes about brand and strategy.',
        'Pishet o brende i strategii.',
      ),
      avatar: '/uploads/author-2.jpg',
      order: 2,
    },
    {
      slug: 'kamran-jafarov',
      name: t('Kamran Ceferov', 'Kamran Jafarov', 'Kamran Dzhafarov'),
      role: t('Marketinq Uzre Muellif', 'Marketing Author', 'Avtor po marketingu'),
      bio: t(
        'Performans marketinq ve boyume uzre yazir.',
        'Writes about performance marketing and growth.',
        'Pishet o performans marketinge i roste.',
      ),
      avatar: '/uploads/author-3.jpg',
      order: 3,
    },
  ];

  const createdAuthors: Array<{ id: number; slug: string }> = [];

  for (const item of authors) {
    const author = await prisma.blogAuthor.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        name: item.name,
        role: item.role,
        slug: item.slug,
        bio: item.bio,
        avatar: item.avatar,
        avatarAlt: item.name,
        skillsTitle: t('Bacariqlar', 'Skills', 'Navyki'),
        skills: [t('Yazi', 'Writing', 'Pisatelstvo'), t('SEO')],
        linkedinHref: 'https://linkedin.com',
        isOurTeam: true,
        isVisible: true,
        order: item.order,
      },
    });

    createdAuthors.push({ id: author.id, slug: author.slug ?? item.slug });
  }

  const categories = [
    { slug: 'technology', label: t('Texnologiya', 'Technology', 'Tekhnologiya'), order: 1 },
    { slug: 'branding', label: t('Brendinq', 'Branding', 'Brending'), order: 2 },
    { slug: 'strategy', label: t('Strategiya', 'Strategy', 'Strategiya'), order: 3 },
  ];

  const createdCategories: Array<{ id: number; slug: string }> = [];

  for (const item of categories) {
    const category = await prisma.blogCategory.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        label: item.label,
        slug: item.slug,
        order: item.order,
      },
    });

    createdCategories.push({ id: category.id, slug: category.slug });
  }

  const blogs = [
    {
      slug: 'first-blog-post',
      title: t('Ilk Bloq Yazisi', 'First Blog Post', 'Pervaya zapis v bloge'),
      excerpt: t(
        'Bu ilk bloq yazisinin xulasasidir.',
        'This is the excerpt of the first blog post.',
        'Eto kratkoe soderzhanie pervoy zapisi v bloge.',
      ),
      order: 1,
      authorSlug: 'ali-mammadov',
      categorySlug: 'technology',
      isFeaturedMain: true,
    },
    {
      slug: 'branding-for-growth',
      title: t('Boyume ucun Brendinq', 'Branding for Growth', 'Brending dlya rosta'),
      excerpt: t(
        'Brendinq boyume strategiyasinda nece rol oynayir.',
        'How branding supports growth strategy.',
        'Kak brending pomogaet strategii rosta.',
      ),
      order: 2,
      authorSlug: 'nermin-aliyeva',
      categorySlug: 'branding',
      isFeaturedMain: false,
    },
    {
      slug: 'performance-marketing-basics',
      title: t('Performance Marketing Basics', 'Performance Marketing Basics', 'Osnovy performance marketing'),
      excerpt: t(
        'Performans marketinqe qisa giris.',
        'A short introduction to performance marketing.',
        'Kratkoe vvedenie v performance marketing.',
      ),
      order: 3,
      authorSlug: 'kamran-jafarov',
      categorySlug: 'strategy',
      isFeaturedMain: false,
    },
  ];

  for (const item of blogs) {
    const author = createdAuthors.find((entry) => entry.slug === item.authorSlug);
    const category = createdCategories.find((entry) => entry.slug === item.categorySlug);

    if (!author || !category) continue;

    await prisma.blog.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        title: item.title,
        slug: item.slug,
        badge: t('Yeni', 'New', 'Novoe'),
        excerpt: item.excerpt,
        coverImage: {
          az: `/uploads/${item.slug}.jpg`,
          en: `/uploads/${item.slug}.jpg`,
          ru: `/uploads/${item.slug}.jpg`,
        },
        coverImageAlt: t('Bloq sekli', 'Blog image', 'Izobrazhenie bloga'),
        isVisible: true,
        isFeaturedMain: item.isFeaturedMain,
        authorId: author.id,
        categoryId: category.id,
        sections: [],
        order: item.order,
      },
    });
  }

  if (!(await prisma.blogSettings.findFirst())) {
    await prisma.blogSettings.create({
      data: {
        pageTitle: t('Bloq', 'Blog', 'Blog'),
        buttonText: t('Portfeli gor', 'View portfolio', 'Smotret portfolio'),
        buttonLink: '/portfolio',
        quoteText: t('Sitat metni', 'Quote text', 'Tekst tsitaty'),
        quoteImage: {
          az: '/uploads/quote.jpg',
          en: '/uploads/quote.jpg',
          ru: '/uploads/quote.jpg',
        },
        quoteImageAlt: t('Sitat sekli', 'Quote image', 'Izobrazhenie tsitaty'),
        searchPlaceholder: t('Axtar...', 'Search...', 'Poisk...'),
        categoriesLabel: t('Kateqoriyalar', 'Categories', 'Kategorii'),
        pickOfWeekLabel: t('Heftenin secimi', 'Pick of the week', 'Vybor nedeli'),
        moreBlogsButtonText: t('Daha cox bloq', 'More blogs', 'Bolshe statey'),
      },
    });
  }

  if (!(await prisma.ourTeamSettings.findFirst())) {
    await prisma.ourTeamSettings.create({
      data: {
        title: t('Komandamiz', 'Our team', 'Nasha komanda'),
        description: t(
          'Peseqar komandamizla tanis olun.',
          'Meet our professional team.',
          'Poznakomtes s nashey komandoy.',
        ),
        moreBtn: t('Daha cox', 'See more', 'Podrobnee'),
      },
    });
  }

  if (!(await prisma.authorSettings.findFirst())) {
    await prisma.authorSettings.create({
      data: {
        readArticleLabel: t('Meqaleni oxu', 'Read article', 'Chitat statyu'),
        recentBlogsTitle: t('Son yazilar', 'Recent blogs', 'Poslednie statyi'),
        otherBlogsTitle: t('Diger yazilar', 'Other blogs', 'Drugie statyi'),
      },
    });
  }

  console.log('OK blog');
}

async function seedAbout() {
  if (await prisma.aboutSettings.findFirst()) return;

  await prisma.aboutSettings.create({
    data: {
      heroImage: '/uploads/about-hero.jpg',
      heroImageAlt: t('Haqqimizda', 'About us', 'O nas'),
      heroBadge: t('Haqqimizda', 'About us', 'O nas'),
      heroTitle: t('Biz kimik?', 'Who are we?', 'Kto my?'),
      heroParagraphs: [
        t(
          'Sirketimiz haqqinda melumat.',
          'Information about our company.',
          'Informatsiya o nashey kompanii.',
        ),
      ],
      storyBlocks: [],
      teamTitle: t('Komandamiz', 'Our team', 'Nasha komanda'),
      teamDescription: t(
        'Guclu komandamizla tanis olun.',
        'Meet our strong team.',
        'Poznakomtes s nashey silnoy komandoy.',
      ),
      teamCtaLabel: t('Komandaya bax', 'View team', 'Smotret komandu'),
      teamCtaHref: '/team',
      heroStats: [],
    },
  });

  console.log('OK about');
}

async function seedNavbar() {
  if (await prisma.navbarSettings.findFirst()) return;

  await prisma.navbarSettings.create({
    data: {
      logoImage: '/uploads/logo.svg',
      logoImageAlt: t('Logo'),
      showSearch: true,
      showLang: true,
      links: {
        create: [
          { label: t('Ana sehife', 'Home', 'Glavnaya'), href: '/', order: 1, isVisible: true },
          { label: t('Haqqimizda', 'About', 'O nas'), href: '/about', order: 2, isVisible: true },
          { label: t('Xidmetler', 'Services', 'Uslugi'), href: '/services', order: 3, isVisible: true },
          { label: t('Portfel', 'Portfolio', 'Portfolio'), href: '/portfolio', order: 4, isVisible: true },
          { label: t('Bloq', 'Blog', 'Blog'), href: '/blog', order: 5, isVisible: true },
          { label: t('Elaqe', 'Contact', 'Kontakt'), href: '/contact', order: 6, isVisible: true },
        ],
      },
    },
  });

  console.log('OK navbar');
}

async function seedFooter() {
  if (await prisma.footerSettings.findFirst()) return;

  await prisma.footerSettings.create({
    data: {
      logoImage: '/uploads/logo.svg',
      logoAlt: t('Logo'),
      description: t(
        'Sirketimizin qisa tesviri.',
        'Brief description of our company.',
        'Kratkoe opisanie nashey kompanii.',
      ),
      copyrightText: t(
        '© 2026 Sirket. Butun huquqlar qorunur.',
        '© 2026 Company. All rights reserved.',
        '© 2026 Kompaniya. Vse prava zashchishcheny.',
      ),
      privacyText: t('Gizlilik Siyaseti', 'Privacy policy', 'Politika konfidentsialnosti'),
      locationLabel: t('Unvan', 'Location', 'Adres'),
      phoneLabel: t('Telefon', 'Phone', 'Telefon'),
      emailLabel: t('Email'),
      locationValue: t('Baki, Azerbaycan', 'Baku, Azerbaijan', 'Baku, Azerbaydzhan'),
      phoneValue: t('+994 50 000 00 00'),
      emailValue: t('info@example.com'),
      navLinks: {
        create: [
          { label: t('Ana sehife', 'Home', 'Glavnaya'), href: '/', order: 1 },
          { label: t('Haqqimizda', 'About', 'O nas'), href: '/about', order: 2 },
          { label: t('Elaqe', 'Contact', 'Kontakt'), href: '/contact', order: 3 },
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

  console.log('OK footer');
}

async function seedContact() {
  if (await prisma.contactSettings.findFirst()) return;

  await prisma.contactSettings.create({
    data: {
      title: t('Bizimle elaqe', 'Contact us', 'Svyazhites s nami'),
      description: t(
        'Suallariniz ucun bizimle elaqe saxlayin.',
        'Get in touch with us for any questions.',
        'Svyazhites s nami po lyubym voprosam.',
      ),
      emailLabel: t('Email'),
      emailValue: t('info@example.com'),
      phoneLabel: t('Telefon', 'Phone', 'Telefon'),
      phoneValue: t('+994 50 000 00 00'),
      locationLabel: t('Unvan', 'Location', 'Adres'),
      locationValue: t('Baki, Azerbaycan', 'Baku, Azerbaijan', 'Baku, Azerbaydzhan'),
      hoursLabel: t('Is saatlari', 'Working hours', 'Rabochie chasy'),
      hoursValue: t(
        'Be - Cume: 09:00 - 18:00',
        'Mon - Fri: 09:00 - 18:00',
        'Pn - Pt: 09:00 - 18:00',
      ),
      followUsLabel: t('Bizi izleyin', 'Follow us', 'Sledite za nami'),
      tags: ['web', 'design', 'development'],
      image: '/uploads/contact-image.jpg',
      imageAlt: t('Elaqe sekli', 'Contact image', 'Izobrazhenie kontakta'),
      formNameLabel: t('Ad', 'Name', 'Imya'),
      formNamePlaceholder: t('Adiniz', 'Your name', 'Vashe imya'),
      formEmailLabel: t('Email'),
      formEmailPlaceholder: t('emailiniz@mail.com', 'your@email.com', 'vash@email.com'),
      formPhoneLabel: t('Telefon', 'Phone', 'Telefon'),
      formPhonePlaceholder: t('+994 XX XXX XX XX'),
      formServiceLabel: t('Xidmet', 'Service', 'Usluga'),
      formServicePlaceholder: t('Xidmeti secin', 'Select service', 'Vyberite uslugu'),
      formBudgetLabel: t('Budce', 'Budget', 'Byudzhet'),
      formBudgetPlaceholder: t('Budcenizi secin', 'Select your budget', 'Vyberite byudzhet'),
      formTimelineLabel: t('Muddet', 'Timeline', 'Sroki'),
      formTimelinePlaceholder: t('Muddeti secin', 'Select timeline', 'Vyberite srok'),
      formMessageLabel: t('Mesaj', 'Message', 'Soobshchenie'),
      formMessagePlaceholder: t(
        'Mesajinizi yazin...',
        'Write your message...',
        'Napishete vashe soobshchenie...',
      ),
      formSubmitLabel: t('Gonder', 'Send message', 'Otpravit'),
      socialLinks: {
        create: [
          { icon: '/uploads/instagram.svg', href: 'https://instagram.com', order: 1 },
          { icon: '/uploads/linkedin.svg', href: 'https://linkedin.com', order: 2 },
        ],
      },
      budgetOptions: {
        create: [
          { label: t('$1,000 - $5,000'), order: 1 },
          { label: t('$5,000 - $10,000'), order: 2 },
          { label: t('$10,000+'), order: 3 },
        ],
      },
      timelineOptions: {
        create: [
          { label: t('1-3 ay', '1-3 months', '1-3 mesyatsa'), order: 1 },
          { label: t('3-6 ay', '3-6 months', '3-6 mesyatsev'), order: 2 },
          { label: t('6+ ay', '6+ months', '6+ mesyatsev'), order: 3 },
        ],
      },
    },
  });

  console.log('OK contact');
}

async function seedHeroAndHome() {
  if (!(await prisma.heroSettings.findFirst())) {
    await prisma.heroSettings.create({
      data: {
        title: t('Boyume ucun reqemsal heller', 'Digital solutions for growth', 'Tsifrovye resheniya dlya rosta'),
        description: t(
          'Brend, mehsul ve marketinq ucun strateji ve kreativ isler.',
          'Strategy and creative work for brand, product and marketing.',
          'Strategiya i kreativ dlya brenda, produkta i marketinga.',
        ),
        primaryBtnText: t('Bizimle elaqe', 'Contact us', 'Svyazhites s nami'),
        primaryBtnLink: '/contact',
        secondaryBtnText: t('Xidmetler', 'Services', 'Uslugi'),
        secondaryBtnLink: '/services',
      },
    });
  }

  if (!(await prisma.homeSettings.findFirst())) {
    await prisma.homeSettings.create({
      data: {
        projectsTitle: t('Secilmis isler', 'Featured works', 'Izbrannye raboty'),
        projectsBtnText: t('Butun portfeli gor', 'View all portfolio', 'Smotret vse portfolio'),
        projectsBtnLink: '/portfolio',
        teamTitle: t('Komandamiz', 'Our team', 'Nasha komanda'),
        teamBtnText: t('Komandaya bax', 'View team', 'Smotret komandu'),
        teamBtnLink: '/team',
        teamImage: '/uploads/home-team.jpg',
        blogsTitle: t('Bloq', 'Blog', 'Blog'),
        blogsBtnText: t('Butun meqaleler', 'View all articles', 'Vse statyi'),
        blogsBtnLink: '/blog',
      },
    });
  }

  console.log('OK hero and home');
}

async function seedPageMeta() {
  const pages = [
    'home',
    'about',
    'services',
    'portfolio',
    'blog',
    'contact',
    'team',
    'vacancy',
  ];

  for (const pageKey of pages) {
    await prisma.pageMeta.upsert({
      where: { pageKey },
      update: {},
      create: {
        pageKey,
        seoTitle: t(`${pageKey} seo title`),
        seoDescription: t(`${pageKey} seo description`),
        seoKeywords: t(`${pageKey}, trenders, cms`),
      },
    });
  }

  console.log('OK page meta');
}

async function main() {
  console.log('Seeding database...');

  await seedAdmin();
  await seedFaqs();
  await seedTestimonials();
  await seedVacancy();
  await seedServicesAndPortfolio();
  await seedPartners();
  await seedBlog();
  await seedAbout();
  await seedNavbar();
  await seedFooter();
  await seedContact();
  await seedHeroAndHome();
  await seedPageMeta();

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
