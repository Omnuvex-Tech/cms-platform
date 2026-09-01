/**
 * Fake / demo data seed for local development (cms-api).
 *
 * Fills the tables the regular seeds leave empty — form submissions,
 * subscribers, hero/home settings, page SEO meta — and tops up FAQ,
 * testimonials and vacancies so lists have something to paginate.
 *
 * Idempotent: writes are upserts, or guarded by an existence check.
 *
 * Run:  npm run seed:fake      (from apps/cms-api)
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Deterministic pseudo-random so re-runs produce the same dataset. */
let seedState = 20260818;
function rnd(): number {
  seedState = (seedState * 1103515245 + 12345) % 2147483648;
  return seedState / 2147483648;
}
function pick<T>(items: readonly T[]): T {
  return items[Math.floor(rnd() * items.length)]!;
}
function between(min: number, max: number): number {
  return Math.floor(rnd() * (max - min + 1)) + min;
}
/** Date N days ago — keeps createdAt spread out instead of all "now". */
function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

const FIRST = ['Elvin', 'Nigar', 'Rəşad', 'Aysel', 'Kamran', 'Leyla', 'Tural', 'Günel', 'Orxan', 'Səbinə', 'Fərid', 'Aytən', 'Murad', 'Lalə'];
const LAST = ['Məmmədov', 'Əliyeva', 'Hüseynov', 'Quliyeva', 'Rzayev', 'İsmayılova', 'Cəfərov', 'Kərimova', 'Abbasov', 'Nəbiyeva'];
const OPS = ['050', '051', '055', '070', '077'];

function fullName(i: number): string {
  return `${FIRST[i % FIRST.length]} ${LAST[(i + 3) % LAST.length]}`;
}
function email(i: number): string {
  const slug = ['elvin', 'nigar', 'rashad', 'aysel', 'kamran', 'leyla', 'tural', 'gunel', 'orxan', 'sabina', 'farid', 'ayten', 'murad', 'lala'][i % 14];
  return `${slug}.${LAST[(i + 3) % LAST.length]!.toLowerCase().replace(/[^a-z]/g, '')}${i}@example.az`;
}
function phone(i: number): string {
  return `+994 ${OPS[i % OPS.length]} ${300 + (i * 7) % 600} ${10 + (i * 13) % 89} ${10 + (i * 17) % 89}`;
}

const L = (az: string, en: string, ru: string) => ({ az, en, ru });

async function main() {
  console.log('🌱 Fake data seed başlayır (cms-api)...\n');

  // ── Contact submissions ───────────────────────────────────
  const services = ['Veb sayt', 'Mobil tətbiq', 'Brendinq', 'SEO', 'Marketinq', 'UI/UX dizayn'];
  const budgets = ['1.000 - 5.000 AZN', '5.000 - 15.000 AZN', '15.000 - 40.000 AZN', '40.000+ AZN'];
  const timelines = ['1 ay', '2-3 ay', '3-6 ay', 'Dəqiqləşməyib'];
  const messages = [
    'Şirkətimiz üçün yeni korporativ sayt hazırlatmaq istəyirik. Təklifinizi gözləyirik.',
    'Mövcud saytımızın redizaynı və sürət optimallaşdırması lazımdır.',
    'E-ticarət platforması qurmaq istəyirik, ödəniş inteqrasiyası ilə birlikdə.',
    'Mobil tətbiq üçün UI/UX dizayn xidmətinizlə maraqlanırıq.',
    'Brend kitabçası və loqo yenilənməsi üzrə görüş təyin edə bilərikmi?',
    'SEO auditi və aylıq dəstək paketləriniz haqqında məlumat istərdik.',
  ];
  let contactCount = 0;
  for (let i = 0; i < 14; i++) {
    const name = fullName(i);
    const mail = email(i);
    const exists = await prisma.contactSubmission.findFirst({ where: { email: mail } });
    if (!exists) {
      await prisma.contactSubmission.create({
        data: {
          name,
          email: mail,
          phone: phone(i),
          service: pick(services),
          budget: pick(budgets),
          timeline: pick(timelines),
          message: pick(messages),
          createdAt: daysAgo(between(1, 90)),
        },
      });
      contactCount++;
    }
  }
  console.log(`✅ ContactSubmission: +${contactCount}`);

  // ── Subscribers ───────────────────────────────────────────
  let subCount = 0;
  for (let i = 0; i < 20; i++) {
    const mail = `subscriber${i + 1}@example.az`;
    await prisma.subscriber.upsert({
      where: { email: mail },
      update: {},
      create: { email: mail, isActive: i % 7 !== 0, createdAt: daysAgo(between(1, 180)) },
    });
    subCount++;
  }
  console.log(`✅ Subscriber: ${subCount}`);

  // ── Callback requests ─────────────────────────────────────
  const roles = ['Alıcı', 'Broker', 'İnvestor', 'Tərəfdaş', 'Digər'];
  let callbackCount = 0;
  for (let i = 0; i < 12; i++) {
    const name = fullName(i + 4);
    const ph = phone(i + 30);
    const exists = await prisma.callbackRequest.findFirst({ where: { name, phone: ph } });
    if (!exists) {
      await prisma.callbackRequest.create({
        data: { name, phone: ph, role: pick(roles), createdAt: daysAgo(between(1, 60)) },
      });
      callbackCount++;
    }
  }
  console.log(`✅ CallbackRequest: +${callbackCount}`);

  // ── Broker registrations ──────────────────────────────────
  const cities = ['Bakı', 'Sumqayıt', 'Gəncə', 'Şəki', 'Lənkəran'];
  const brokerTypes = ['Fərdi broker', 'Agentlik', 'Sərbəst məsləhətçi'];
  const experiences = ['1 ildən az', '1-3 il', '3-5 il', '5+ il'];
  let brokerCount = 0;
  for (let i = 0; i < 10; i++) {
    const mail = `broker${i + 1}@example.az`;
    const exists = await prisma.brokerRegistration.findFirst({ where: { email: mail } });
    if (!exists) {
      await prisma.brokerRegistration.create({
        data: {
          name: fullName(i + 6),
          email: mail,
          phone: phone(i + 45),
          city: pick(cities),
          brokerType: pick(brokerTypes),
          experience: pick(experiences),
          website: i % 3 === 0 ? `https://broker${i + 1}.example.az` : null,
          message: 'Əməkdaşlıq şərtləri ilə tanış olmaq istəyirəm.',
          createdAt: daysAgo(between(1, 120)),
        },
      });
      brokerCount++;
    }
  }
  console.log(`✅ BrokerRegistration: +${brokerCount}`);

  // ── Vacancy submissions ───────────────────────────────────
  const vacancies = await prisma.vacancy.findMany({ select: { id: true, title: true } });
  let vsCount = 0;
  for (let i = 0; i < 12; i++) {
    const mail = `applicant${i + 1}@example.az`;
    const exists = await prisma.vacancySubmission.findFirst({ where: { email: mail } });
    if (!exists) {
      const vac = vacancies.length ? vacancies[i % vacancies.length]! : null;
      const vacTitle = vac ? (vac.title as any)?.az ?? null : null;
      await prisma.vacancySubmission.create({
        data: {
          name: fullName(i + 8),
          email: mail,
          phone: phone(i + 60),
          message: pick([
            'Vakansiya ilə maraqlanıram, CV-mi əlavə etdim.',
            'Bu sahədə 3 illik təcrübəm var, müsahibəyə hazıram.',
            'Portfoliomu da baxmağınızı xahiş edirəm.',
            null as any,
          ]),
          cvUrl: `/uploads/demo/cv-${i + 1}.pdf`,
          vacancyId: vac?.id ?? null,
          vacancyTitle: vacTitle,
          createdAt: daysAgo(between(1, 45)),
        },
      });
      vsCount++;
    }
  }
  console.log(`✅ VacancySubmission: +${vsCount}`);

  // ── Hero settings (singleton) ─────────────────────────────
  await prisma.heroSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: L(
        'Rəqəmsal məhsullar qururuq',
        'We build digital products',
        'Мы создаём цифровые продукты',
      ),
      description: L(
        'Strategiyadan dizayna, dizayndan koda qədər — brendinizi onlayn məkanda güclü edən komanda.',
        'From strategy to design, from design to code — the team that makes your brand strong online.',
        'От стратегии до дизайна, от дизайна до кода — команда, которая усиливает ваш бренд онлайн.',
      ),
      primaryBtnText: L('Bizimlə əlaqə', 'Contact us', 'Связаться с нами'),
      primaryBtnLink: '/contact',
      secondaryBtnText: L('Xidmətlərimiz', 'Our services', 'Наши услуги'),
      secondaryBtnLink: '/services',
    },
  });
  console.log('✅ HeroSettings');

  // ── Home settings (singleton) ─────────────────────────────
  await prisma.homeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      projectsTitle: L('Seçilmiş layihələr', 'Selected projects', 'Избранные проекты'),
      projectsBtnText: L('Hamısına bax', 'View all', 'Смотреть все'),
      projectsBtnLink: '/portfolio',
      teamTitle: L('Komandamız', 'Our team', 'Наша команда'),
      teamBtnText: L('Komandanı tanı', 'Meet the team', 'Познакомиться с командой'),
      teamBtnLink: '/team',
      teamImage: '/uploads/demo/team-cover.jpg',
      blogsTitle: L('Bloqdan seçmələr', 'From the blog', 'Из блога'),
      blogsBtnText: L('Bütün yazılar', 'All posts', 'Все статьи'),
      blogsBtnLink: '/blog',
    },
  });
  console.log('✅ HomeSettings');

  // ── Page SEO meta ─────────────────────────────────────────
  const pages: Array<[string, string, string, string]> = [
    ['home', 'Ana səhifə', 'Home', 'Главная'],
    ['about', 'Haqqımızda', 'About us', 'О нас'],
    ['services', 'Xidmətlər', 'Services', 'Услуги'],
    ['portfolio', 'Portfolio', 'Portfolio', 'Портфолио'],
    ['blog', 'Bloq', 'Blog', 'Блог'],
    ['contact', 'Əlaqə', 'Contact', 'Контакты'],
    ['vacancy', 'Vakansiyalar', 'Careers', 'Вакансии'],
    ['team', 'Komanda', 'Team', 'Команда'],
  ];
  for (const [key, az, en, ru] of pages) {
    await prisma.pageMeta.upsert({
      where: { pageKey: key },
      update: {},
      create: {
        pageKey: key,
        seoTitle: L(`${az} | TREVA`, `${en} | TREVA`, `${ru} | TREVA`),
        seoDescription: L(
          `${az} səhifəsi — TREVA komandası haqqında ətraflı məlumat.`,
          `${en} page — learn more about the TREVA team.`,
          `Страница «${ru}» — подробнее о команде TREVA.`,
        ),
        seoKeywords: L('treva, rəqəmsal agentlik, bakı', 'treva, digital agency, baku', 'treva, диджитал агентство, баку'),
        schema: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: en,
          url: `https://treva.realestate/${key === 'home' ? '' : key}`,
        },
      },
    });
  }
  console.log(`✅ PageMeta: ${pages.length}`);

  // ── Extra FAQs ────────────────────────────────────────────
  const faqs = [
    [L('Layihə nə qədər çəkir?', 'How long does a project take?', 'Сколько длится проект?'),
     L('Orta hesabla 6-12 həftə, layihənin həcmindən asılı olaraq dəyişir.', 'On average 6-12 weeks, depending on scope.', 'В среднем 6-12 недель, в зависимости от объёма.')],
    [L('Ödəniş şərtləri necədir?', 'What are the payment terms?', 'Каковы условия оплаты?'),
     L('Adətən 50% avans, qalanı mərhələlər üzrə bölünür.', 'Usually 50% upfront, the rest split across milestones.', 'Обычно 50% предоплата, остальное по этапам.')],
    [L('Dəstək xidməti verirsiniz?', 'Do you provide support?', 'Предоставляете ли вы поддержку?'),
     L('Bəli, təhvildən sonra 3 ay pulsuz texniki dəstək daxildir.', 'Yes, 3 months of free technical support after delivery.', 'Да, 3 месяца бесплатной техподдержки после сдачи.')],
    [L('Hansı texnologiyalarla işləyirsiniz?', 'Which technologies do you use?', 'С какими технологиями вы работаете?'),
     L('Next.js, NestJS, PostgreSQL və React Native əsas stack-imizdir.', 'Next.js, NestJS, PostgreSQL and React Native are our main stack.', 'Next.js, NestJS, PostgreSQL и React Native — наш основной стек.')],
    [L('Müqavilə bağlayırsınızmı?', 'Do you sign a contract?', 'Заключаете ли вы договор?'),
     L('Bəli, hər layihə üçün rəsmi müqavilə və texniki tapşırıq hazırlanır.', 'Yes, every project comes with a formal contract and spec.', 'Да, для каждого проекта готовится договор и техзадание.')],
  ];
  const faqStart = await prisma.faq.count();
  let faqAdded = 0;
  for (let i = 0; i < faqs.length; i++) {
    const [question, answer] = faqs[i]!;
    const exists = await prisma.faq.findFirst({ where: { question: { equals: question } } });
    if (!exists) {
      await prisma.faq.create({ data: { question, answer, order: faqStart + i + 1, isVisible: true } });
      faqAdded++;
    }
  }
  console.log(`✅ Faq: +${faqAdded}`);

  // ── Extra testimonials ────────────────────────────────────
  let section = await prisma.testimonialsSection.findFirst();
  if (!section) {
    section = await prisma.testimonialsSection.create({
      data: {
        title: L('Müştərilərimiz nə deyir', 'What our clients say', 'Что говорят клиенты'),
        description: L('Birlikdə işlədiyimiz komandaların rəyləri.', 'Feedback from teams we worked with.', 'Отзывы команд, с которыми мы работали.'),
      },
    });
  }
  const testimonials = [
    [L('Komanda son dərəcə peşəkar idi, layihəni vaxtında təhvil verdilər.', 'The team was highly professional and delivered on time.', 'Команда была очень профессиональна и сдала проект вовремя.'),
     L('Rəşad Hüseynov', 'Rashad Huseynov', 'Рашад Гусейнов'), L('Baş direktor', 'CEO', 'Генеральный директор'), L('Nova MMC', 'Nova LLC', 'Nova ООО')],
    [L('Saytımızın konversiyası ilk ayda 40% artdı.', 'Our site conversion grew 40% in the first month.', 'Конверсия сайта выросла на 40% за первый месяц.'),
     L('Aysel Quliyeva', 'Aysel Guliyeva', 'Айсель Гулиева'), L('Marketinq rəhbəri', 'Head of Marketing', 'Руководитель маркетинга'), L('Arqon Group', 'Argon Group', 'Аргон Групп')],
    [L('Dizayn və texniki icra gözləntimizdən yüksək oldu.', 'Design and engineering exceeded our expectations.', 'Дизайн и реализация превзошли наши ожидания.'),
     L('Kamran Rzayev', 'Kamran Rzayev', 'Камран Рзаев'), L('Məhsul meneceri', 'Product Manager', 'Продакт-менеджер'), L('Delta Tech', 'Delta Tech', 'Дельта Тех')],
    [L('İllərdir əməkdaşlıq edirik, heç vaxt peşman olmamışıq.', 'We have worked together for years and never regretted it.', 'Мы сотрудничаем годами и ни разу не пожалели.'),
     L('Günel Kərimova', 'Gunel Karimova', 'Гюнель Керимова'), L('Əməliyyat direktoru', 'COO', 'Операционный директор'), L('Ferrum', 'Ferrum', 'Феррум')],
  ];
  const tStart = await prisma.testimonial.count();
  let tAdded = 0;
  for (let i = 0; i < testimonials.length; i++) {
    const [quote, name, role, company] = testimonials[i]!;
    const exists = await prisma.testimonial.findFirst({ where: { name: { equals: name } } });
    if (!exists) {
      await prisma.testimonial.create({
        data: {
          image: `/uploads/demo/testimonial-${i + 1}.jpg`,
          altText: (name as any).en,
          quote, name, role, company,
          order: tStart + i + 1,
          sectionId: section.id,
        },
      });
      tAdded++;
    }
  }
  console.log(`✅ Testimonial: +${tAdded}`);

  // ── Extra vacancies ───────────────────────────────────────
  const vacCategory = await prisma.vacancyCategory.findFirst();
  let vacAdded = 0;
  if (vacCategory) {
    const roles2 = [
      ['Frontend Developer', 'frontend-developer', ['React', 'Next.js', 'TypeScript']],
      ['Backend Developer', 'backend-developer', ['NestJS', 'PostgreSQL', 'Prisma']],
      ['UI/UX Designer', 'ui-ux-designer', ['Figma', 'Design System', 'Prototyping']],
      ['QA Engineer', 'qa-engineer', ['Playwright', 'Manual QA', 'API testing']],
    ];
    for (let i = 0; i < roles2.length; i++) {
      const [title, slug, skills] = roles2[i]! as [string, string, string[]];
      const exists = await prisma.vacancy.findUnique({ where: { slug } });
      if (!exists) {
        await prisma.vacancy.create({
          data: {
            title: L(title, title, title),
            slug,
            tags: ['Tam ştat', 'Bakı', 'Hibrid'],
            isNew: i < 2,
            isVisible: true,
            order: i + 2,
            categoryId: vacCategory.id,
            aboutRole: L(
              `${title} vəzifəsi üzrə komandamıza qoşulacaq həmkar axtarırıq.`,
              `We are looking for a ${title} to join our team.`,
              `Мы ищем ${title} в нашу команду.`,
            ),
            requirements: [
              L('Ən azı 2 il təcrübə', 'At least 2 years of experience', 'Опыт от 2 лет'),
              L('Komanda ilə işləmə bacarığı', 'Ability to work in a team', 'Умение работать в команде'),
              L('İngilis dili — orta səviyyə', 'English — intermediate', 'Английский — средний уровень'),
            ],
            responsible: [
              L('Məhsul funksiyalarının hazırlanması', 'Building product features', 'Разработка функций продукта'),
              L('Kod baxışlarında iştirak', 'Participating in code reviews', 'Участие в код-ревью'),
            ],
            skills: skills.map((s) => L(s, s, s)),
            closingDate: new Date(Date.now() + between(20, 80) * 24 * 60 * 60 * 1000),
            startDate: new Date(Date.now() + between(30, 100) * 24 * 60 * 60 * 1000),
            seoTitle: L(`${title} vakansiyası | TREVA`, `${title} job | TREVA`, `Вакансия ${title} | TREVA`),
            seoDescription: L(
              `TREVA komandasında ${title} vakansiyası açıqdır.`,
              `${title} position is open at TREVA.`,
              `В TREVA открыта вакансия ${title}.`,
            ),
          },
        });
        vacAdded++;
      }
    }
  }
  console.log(`✅ Vacancy: +${vacAdded}`);

  console.log('\n🎉 Fake data hazırdır.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
