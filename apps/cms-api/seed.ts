import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// --- date helpers ----------------------------------------------------------
const now = Date.now();
const mins = (n: number) => new Date(now - n * 60_000);
const hours = (n: number) => new Date(now - n * 3_600_000);
const days = (n: number) => new Date(now - n * 86_400_000);
const inHours = (n: number) => new Date(now + n * 3_600_000);
const inDays = (n: number) => new Date(now + n * 86_400_000);

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@omnuvex.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123';
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const repHash = await bcrypt.hash('Sales123', 10);

  console.log('Resetting sample data...');
  // Child -> parent order so FKs never block the wipe. Projects (and their
  // bedroomPricing/standardPlans/internationalTiers children) are deliberately
  // NOT wiped here: the real, live project catalog is imported separately via
  // import-bot-projects.ts and must survive every re-seed.
  await prisma.leadTimelineEvent.deleteMany();
  await prisma.internalNote.deleteMany();
  await prisma.message.deleteMany();
  await prisma.handoff.deleteMany();
  await prisma.contactRequest.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.trevaInfo.deleteMany();

  // --- Users ---------------------------------------------------------------
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: adminHash, role: 'admin', name: 'TREVA Admin', isActive: true },
    create: {
      email: adminEmail,
      password: adminHash,
      name: 'TREVA Admin',
      role: 'admin',
      phone: '+994 12 000 0000',
      lastActivityAt: mins(5),
    },
  });

  const rep1 = await prisma.user.upsert({
    where: { email: 'nurlan@omnuvex.com' },
    update: { password: repHash, role: 'sales_rep', name: 'Nurlan Aliyev', isActive: true },
    create: {
      email: 'nurlan@omnuvex.com',
      password: repHash,
      name: 'Nurlan Aliyev',
      role: 'sales_rep',
      phone: '+994 50 123 4567',
      lastActivityAt: mins(20),
    },
  });

  const rep2 = await prisma.user.upsert({
    where: { email: 'sevinj@omnuvex.com' },
    update: { password: repHash, role: 'sales_rep', name: 'Sevinj Mammadova', isActive: true },
    create: {
      email: 'sevinj@omnuvex.com',
      password: repHash,
      name: 'Sevinj Mammadova',
      role: 'sales_rep',
      phone: '+994 55 987 6543',
      lastActivityAt: hours(2),
    },
  });

  console.log('Seeded users: admin + 2 sales reps');

  // --- TREVA Information ----------------------------------------------------
  await prisma.trevaInfo.create({
    data: {
      status: 'published',
      mission:
        'To make premium real estate in Azerbaijan accessible through honest guidance and an AI assistant that never sleeps.',
      vision:
        'To be the most trusted property partner in the Caspian region — where every buyer feels informed, not sold to.',
      whoWeAre:
        'TREVA is a Baku-based real-estate sales agency pairing seasoned human advisors with an AI sales agent that qualifies, matches and follows up with buyers across every channel.',
      whyChoose:
        'Verified listings, transparent payment plans, multilingual support (AZ / RU / EN), and a team that responds in minutes — not days.',
      website: 'https://treva.az',
      email: 'sales@treva.az',
      phone: '+994 12 555 0100',
      hotline: '*8080',
    },
  });
  console.log('Seeded TREVA information record');

  // Projects are NOT seeded here — the real, live catalog is imported via
  // import-bot-projects.ts and must persist across every re-seed. Leads below
  // reference project names as free-text (topProject/interestedProjects are
  // plain strings, not a foreign key), so they don't depend on any Project row
  // existing.

  // --- Leads ---------------------------------------------------------------
  const leadEmin = await prisma.lead.create({
    data: {
      phone: '+994 50 111 2233',
      threadId: 'wa-emin-2233',
      channel: 'whatsapp',
      topProject: 'Port Baku Residence',
      budget: '$250k – $300k',
      budgetRaw: 'around 250 up to 300 thousand dollars',
      purpose: 'Investment (rental yield)',
      bedrooms: '1-2 BR',
      location: 'Central Baku, near the sea',
      timeframe: 'Ready to buy in 1-2 months',
      language: 'en',
      interestedProjects: ['Port Baku Residence', 'Crescent Bay'],
      botNotes: 'Cash buyer, focused on rental ROI. Asked about concierge and parking.',
      salesStatus: 'qualified',
      temperature: 'hot',
      nextAction: 'Send Port Baku 2BR options + rental yield sheet.',
      ownerId: rep1.id,
      createdAt: days(3),
      timeline: {
        create: [
          { type: 'created', description: 'Lead created from WhatsApp conversation.', createdAt: days(3) },
          { type: 'phone_captured', description: 'Phone captured: +994 50 111 2233.', createdAt: days(3) },
          { type: 'project_suggested', description: 'Bot suggested Port Baku Residence (2BR).', createdAt: days(3) },
          { type: 'status_changed', description: 'Sales status changed from “new” to “qualified”.', createdAt: days(2) },
        ],
      },
    },
  });

  const leadNigar = await prisma.lead.create({
    data: {
      phone: '+994 55 222 3344',
      threadId: 'tg-nigar-3344',
      channel: 'telegram',
      topProject: 'White City Boulevard',
      budget: '$150k – $200k',
      purpose: 'Family home',
      bedrooms: '2-3 BR',
      location: 'White City',
      timeframe: '3-6 months',
      language: 'ru',
      interestedProjects: ['White City Boulevard'],
      botNotes: 'Young family, needs school nearby. Price sensitive.',
      salesStatus: 'in_follow_up',
      temperature: 'warm',
      nextAction: 'Follow up after weekend site visit.',
      ownerId: rep2.id,
      createdAt: days(6),
      timeline: {
        create: [
          { type: 'created', description: 'Lead created from Telegram conversation.', createdAt: days(6) },
          { type: 'project_suggested', description: 'Bot suggested White City Boulevard.', createdAt: days(6) },
          { type: 'status_changed', description: 'Sales status changed from “qualified” to “in_follow_up”.', createdAt: days(1) },
        ],
      },
    },
  });

  const leadLeyla = await prisma.lead.create({
    data: {
      phone: '+994 51 333 4455',
      threadId: 'ig-leyla-4455',
      channel: 'instagram',
      topProject: 'Crescent Bay',
      budget: '$400k – $520k',
      purpose: 'Luxury primary residence',
      bedrooms: '2 BR',
      location: 'Bayil',
      timeframe: 'This quarter',
      language: 'az',
      interestedProjects: ['Crescent Bay', 'Port Baku Residence'],
      botNotes: 'Negotiating on a high-floor bay-view unit. Wants a discount.',
      salesStatus: 'negotiation',
      temperature: 'hot',
      nextAction: 'Present final price with 5% loyalty discount.',
      ownerId: rep1.id,
      createdAt: days(9),
      timeline: {
        create: [
          { type: 'created', description: 'Lead created from Instagram DM.', createdAt: days(9) },
          { type: 'handoff_created', description: 'Escalated to human for pricing negotiation.', createdAt: days(4) },
          { type: 'status_changed', description: 'Sales status changed to “negotiation”.', createdAt: days(2) },
        ],
      },
    },
  });

  const leadOrxan = await prisma.lead.create({
    data: {
      phone: '+994 70 444 5566',
      threadId: 'wa-orxan-5566',
      channel: 'whatsapp',
      topProject: 'Port Baku Residence',
      budget: 'flexible',
      budgetFlexible: true,
      budgetRaw: 'not sure yet, depends on the plan',
      purpose: 'Investment',
      bedrooms: '1 BR',
      language: 'az',
      interestedProjects: ['Port Baku Residence'],
      botNotes: 'Requested a callback to discuss payment plans.',
      salesStatus: 'contact_requested',
      temperature: 'warm',
      nextAction: 'Call back re: 24-month installment plan.',
      ownerId: rep2.id,
      createdAt: days(1),
      timeline: {
        create: [
          { type: 'created', description: 'Lead created from WhatsApp conversation.', createdAt: days(1) },
          { type: 'contact_requested', description: 'Customer asked to be called back.', createdAt: hours(20) },
        ],
      },
    },
  });

  const leadRashad = await prisma.lead.create({
    data: {
      threadId: 'web-rashad-7788',
      channel: 'web',
      topProject: 'Sea Breeze Resort',
      budget: '$120k – $160k',
      purpose: 'Holiday home',
      bedrooms: 'Studio',
      language: 'ru',
      interestedProjects: ['Sea Breeze Resort'],
      botNotes: 'Browsing, early stage. No phone yet.',
      salesStatus: 'new',
      temperature: 'cold',
      ownerId: null,
      createdAt: hours(8),
      timeline: {
        create: [
          { type: 'created', description: 'Lead created from web chat.', createdAt: hours(8) },
        ],
      },
    },
  });

  const leadAysel = await prisma.lead.create({
    data: {
      phone: '+994 55 666 7788',
      threadId: 'web-aysel-8899',
      channel: 'web',
      topProject: 'White City Boulevard',
      budget: '$250k',
      purpose: 'Family home',
      bedrooms: '3 BR',
      language: 'az',
      interestedProjects: ['White City Boulevard'],
      botNotes: 'Site visit booked for Saturday.',
      salesStatus: 'visit_scheduled',
      temperature: 'warm',
      nextAction: 'Confirm Saturday 14:00 visit.',
      ownerId: rep1.id,
      createdAt: days(5),
      timeline: {
        create: [
          { type: 'created', description: 'Lead created from web chat.', createdAt: days(5) },
          { type: 'status_changed', description: 'Sales status changed to “visit_scheduled”.', createdAt: days(1) },
        ],
      },
    },
  });

  const leadKamran = await prisma.lead.create({
    data: {
      phone: '+994 50 777 8899',
      threadId: 'phone-kamran-9900',
      channel: 'phone',
      topProject: 'Port Baku Residence',
      budget: '$520k',
      purpose: 'Primary residence',
      bedrooms: '3 BR',
      language: 'en',
      interestedProjects: ['Port Baku Residence'],
      botNotes: 'Deal closed — 3BR unit reserved.',
      salesStatus: 'won',
      temperature: 'hot',
      ownerId: rep1.id,
      createdAt: days(20),
      timeline: {
        create: [
          { type: 'created', description: 'Lead created.', createdAt: days(20) },
          { type: 'status_changed', description: 'Sales status changed to “won”. 🎉', createdAt: days(2) },
        ],
      },
    },
  });

  const leadTural = await prisma.lead.create({
    data: {
      threadId: 'tg-tural-0011',
      channel: 'telegram',
      budget: 'unknown',
      language: 'ru',
      interestedProjects: [],
      botNotes: 'Spam / not a genuine buyer.',
      salesStatus: 'invalid',
      temperature: 'cold',
      createdAt: days(4),
      timeline: {
        create: [
          { type: 'created', description: 'Lead created from Telegram.', createdAt: days(4) },
          { type: 'status_changed', description: 'Marked invalid (spam).', createdAt: days(3) },
        ],
      },
    },
  });

  console.log('Seeded 8 leads with timelines');

  // --- Conversations + messages -------------------------------------------
  const convEmin = await prisma.conversation.create({
    data: {
      threadId: 'wa-emin-2233',
      channel: 'whatsapp',
      language: 'en',
      status: 'assigned',
      customerHandle: 'Emin A.',
      customerPhone: '+994 50 111 2233',
      stage: 'matching',
      budget: '$250k – $300k',
      botActive: false,
      unreadCount: 0,
      assignedToId: rep1.id,
      leadId: leadEmin.id,
      lastMessageAt: hours(3),
      createdAt: days(3),
      messages: {
        create: [
          { role: 'user', content: 'Hi, I saw Port Baku Residence. Do you have 2-bedroom units available?', channel: 'whatsapp', createdAt: days(3) },
          { role: 'bot', content: 'Hello Emin! Yes — Port Baku Residence has 2BR units from 95m² starting at $340,000. Are you buying to live in or to invest?', channel: 'whatsapp', createdAt: days(3) },
          { role: 'user', content: 'Investment. What rental yield can I expect?', channel: 'whatsapp', createdAt: days(3) },
          { role: 'bot', content: 'Great question. Units in the Port Baku cluster typically yield 7-9% gross. I can connect you with a sales advisor for exact figures.', channel: 'whatsapp', createdAt: days(3) },
          { role: 'human', content: 'Hi Emin, this is Nurlan from TREVA. I can share a rental-yield breakdown for a 2BR today — what’s the best time to call?', channel: 'whatsapp', createdAt: hours(3) },
        ],
      },
      notes: {
        create: [
          { authorId: rep1.id, body: 'Serious cash buyer. Prioritise — wants ROI numbers before committing.', createdAt: hours(3) },
        ],
      },
    },
  });

  const convLeyla = await prisma.conversation.create({
    data: {
      threadId: 'ig-leyla-4455',
      channel: 'instagram',
      language: 'az',
      status: 'waiting_for_human',
      customerHandle: '@leyla.h',
      customerPhone: '+994 51 333 4455',
      stage: 'objection',
      budget: '$400k – $520k',
      botActive: false,
      unreadCount: 2,
      assignedToId: rep1.id,
      leadId: leadLeyla.id,
      lastMessageAt: mins(35),
      createdAt: days(9),
      messages: {
        create: [
          { role: 'user', content: 'Crescent Bay-də yüksək mərtəbəli mənzil istəyirəm, amma qiymət yüksəkdir.', channel: 'instagram', createdAt: hours(6) },
          { role: 'bot', content: 'Anladım. Crescent Bay-də 2 otaqlı mənzillər $380k-dan başlayır. Sizə endirim variantlarını danışmaq üçün mütəxəssislə əlaqələndirim?', channel: 'instagram', createdAt: hours(6) },
          { role: 'user', content: 'Bəli, xahiş edirəm. Endirim mümkündürsə maraqlanıram.', channel: 'instagram', createdAt: mins(35) },
        ],
      },
    },
  });

  const convOrxan = await prisma.conversation.create({
    data: {
      threadId: 'wa-orxan-5566',
      channel: 'whatsapp',
      language: 'az',
      status: 'waiting_for_human',
      customerHandle: 'Orxan N.',
      customerPhone: '+994 70 444 5566',
      stage: 'phone capture',
      botActive: true,
      unreadCount: 1,
      leadId: leadOrxan.id,
      lastMessageAt: hours(20),
      createdAt: days(1),
      messages: {
        create: [
          { role: 'user', content: 'Ödəniş planları haqqında məlumat verə bilərsiniz?', channel: 'whatsapp', createdAt: days(1) },
          { role: 'bot', content: 'Əlbəttə! Port Baku üçün 30% ilkin ödənişlə 12 aylıq plan mövcuddur. Sizə zəng edək?', channel: 'whatsapp', createdAt: days(1) },
          { role: 'user', content: 'Bəli, sabah günortadan sonra zəng edin.', channel: 'whatsapp', createdAt: hours(20) },
        ],
      },
    },
  });

  const convNigar = await prisma.conversation.create({
    data: {
      threadId: 'tg-nigar-3344',
      channel: 'telegram',
      language: 'ru',
      status: 'assigned',
      customerHandle: '@nigar_m',
      customerPhone: '+994 55 222 3344',
      stage: 'qualification',
      budget: '$150k – $200k',
      botActive: false,
      unreadCount: 0,
      assignedToId: rep2.id,
      leadId: leadNigar.id,
      lastMessageAt: days(1),
      createdAt: days(6),
      messages: {
        create: [
          { role: 'user', content: 'Здравствуйте, ищу 2-комнатную квартиру для семьи в White City.', channel: 'telegram', createdAt: days(6) },
          { role: 'bot', content: 'Здравствуйте! В White City Boulevard есть 2-комнатные от 78м² по цене от $165,000. Рядом международная школа. Показать варианты?', channel: 'telegram', createdAt: days(6) },
          { role: 'human', content: 'Добрый день, это Севиндж из TREVA. Организую для вас просмотр на выходных 🙂', channel: 'telegram', createdAt: days(1) },
        ],
      },
    },
  });

  const convRashad = await prisma.conversation.create({
    data: {
      threadId: 'web-rashad-7788',
      channel: 'web',
      language: 'ru',
      status: 'active',
      customerHandle: 'Web visitor',
      stage: 'greeting',
      botActive: true,
      unreadCount: 0,
      leadId: leadRashad.id,
      lastMessageAt: hours(8),
      createdAt: hours(8),
      messages: {
        create: [
          { role: 'user', content: 'Сколько стоит студия в Sea Breeze?', channel: 'web', createdAt: hours(8) },
          { role: 'bot', content: 'Студии в Sea Breeze Resort начинались от $98,000. Обратите внимание: первая фаза распродана. Хотите узнать о новых фазах?', channel: 'web', createdAt: hours(8) },
        ],
      },
    },
  });

  const convSpam = await prisma.conversation.create({
    data: {
      threadId: 'tg-tural-0011',
      channel: 'telegram',
      language: 'ru',
      status: 'spam',
      customerHandle: '@tural_promo',
      botActive: false,
      unreadCount: 0,
      leadId: leadTural.id,
      lastMessageAt: days(4),
      createdAt: days(4),
      messages: {
        create: [
          { role: 'user', content: '🔥🔥 Buy crypto now! Best rates! t.me/promo', channel: 'telegram', createdAt: days(4) },
          { role: 'system', content: 'Thread flagged as spam by the agent.', createdAt: days(4) },
        ],
      },
    },
  });

  const convKamran = await prisma.conversation.create({
    data: {
      threadId: 'phone-kamran-9900',
      channel: 'phone',
      language: 'en',
      status: 'resolved',
      customerHandle: 'Kamran I.',
      customerPhone: '+994 50 777 8899',
      stage: 'close',
      budget: '$520k',
      botActive: false,
      unreadCount: 0,
      assignedToId: rep1.id,
      leadId: leadKamran.id,
      lastMessageAt: days(2),
      createdAt: days(20),
      messages: {
        create: [
          { role: 'human', content: 'Kamran, confirming your 3BR reservation at Port Baku Residence. Congratulations!', channel: 'phone', createdAt: days(2) },
          { role: 'user', content: 'Thank you Nurlan, excellent service.', channel: 'phone', createdAt: days(2) },
          { role: 'system', content: 'Conversation resolved — deal won.', channel: 'phone', createdAt: days(2) },
        ],
      },
    },
  });

  console.log('Seeded 7 conversations with messages + notes');

  // --- Handoffs ------------------------------------------------------------
  await prisma.handoff.create({
    data: {
      conversationId: convLeyla.id,
      status: 'new',
      priority: 'urgent',
      slaState: 'breached',
      reason: 'Customer requested a discount on a high-value unit — needs human pricing authority.',
      dueAt: hours(2), // due 2h ago -> breached
      createdAt: hours(6),
    },
  });

  await prisma.handoff.create({
    data: {
      conversationId: convOrxan.id,
      status: 'new',
      priority: 'high',
      slaState: 'due_soon',
      reason: 'Callback requested to discuss payment plans.',
      dueAt: inHours(1),
      createdAt: hours(20),
    },
  });

  await prisma.handoff.create({
    data: {
      conversationId: convEmin.id,
      status: 'assigned',
      priority: 'normal',
      slaState: 'on_track',
      reason: 'Investor wants exact rental-yield figures.',
      notes: 'Picked up by Nurlan. Sending yield sheet.',
      assignedToId: rep1.id,
      dueAt: inHours(6),
      createdAt: hours(4),
    },
  });

  await prisma.handoff.create({
    data: {
      conversationId: convKamran.id,
      status: 'resolved',
      priority: 'normal',
      slaState: 'on_track',
      reason: 'Final paperwork for reservation.',
      notes: 'Resolved — deal won.',
      assignedToId: rep1.id,
      resolvedAt: days(2),
      createdAt: days(3),
    },
  });

  console.log('Seeded 4 handoffs (urgent+breached, high, normal, resolved)');

  // --- Contact Requests ----------------------------------------------------
  await prisma.contactRequest.create({
    data: {
      customerPhone: '+994 51 333 4455',
      preferredChannel: 'phone',
      availabilityText: 'Yesterday afternoon',
      availabilityAt: hours(20), // in the past -> overdue
      status: 'new',
      customerWords: 'Please call me about the discount, I am ready to decide.',
      conversationId: convLeyla.id,
      leadId: leadLeyla.id,
      createdAt: days(1),
    },
  });

  await prisma.contactRequest.create({
    data: {
      customerPhone: '+994 70 444 5566',
      preferredChannel: 'whatsapp',
      availabilityText: 'Today after 2pm',
      availabilityAt: inHours(3), // later today -> due today
      status: 'assigned',
      ownerId: rep2.id,
      customerWords: 'Sabah günortadan sonra zəng edin.',
      conversationId: convOrxan.id,
      leadId: leadOrxan.id,
      createdAt: hours(20),
    },
  });

  await prisma.contactRequest.create({
    data: {
      customerPhone: '+994 50 111 2233',
      preferredChannel: 'phone',
      availabilityText: 'This week, mornings',
      availabilityAt: inDays(2),
      status: 'scheduled',
      ownerId: rep1.id,
      customerWords: 'Prefer a morning call to go through numbers.',
      conversationId: convEmin.id,
      leadId: leadEmin.id,
      createdAt: hours(5),
    },
  });

  await prisma.contactRequest.create({
    data: {
      customerPhone: '+994 55 666 7788',
      preferredChannel: 'phone',
      availabilityText: 'Flexible',
      isFlexible: true,
      status: 'completed',
      ownerId: rep1.id,
      customerWords: 'Any time works.',
      followUpOutcome: 'Called — confirmed Saturday 14:00 site visit for White City 3BR.',
      leadId: leadAysel.id,
      createdAt: days(2),
    },
  });

  await prisma.contactRequest.create({
    data: {
      customerPhone: '+994 55 222 3344',
      preferredChannel: 'telegram',
      availabilityText: 'Weekends',
      availabilityAt: days(1),
      status: 'no_answer',
      ownerId: rep2.id,
      customerWords: 'Свяжитесь на выходных.',
      followUpOutcome: 'No answer on first attempt — will retry.',
      conversationId: convNigar.id,
      leadId: leadNigar.id,
      createdAt: days(3),
    },
  });

  await prisma.contactRequest.create({
    data: {
      customerPhone: '+994 50 777 8899',
      preferredChannel: 'phone',
      availabilityText: 'Flexible',
      isFlexible: true,
      status: 'cancelled',
      ownerId: rep1.id,
      customerWords: 'Actually already decided, no need to call.',
      leadId: leadKamran.id,
      createdAt: days(6),
    },
  });

  console.log('Seeded 6 contact requests (overdue / due-today / scheduled / completed / no-answer / cancelled)');

  console.log('\n✅ Seed complete.');
  console.log('   Admin login:', adminEmail, '/', adminPassword);
  console.log('   Sales reps:  nurlan@omnuvex.com, sevinj@omnuvex.com / Sales123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
