import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    title: "Reportage Heights",
    slug: "reportage-heights",
    image: "/uploads/layihelerimiz/reportage-cover.jpg",
    description: "Xəzərin sahilində modern memarlıq və prestijli həyatın birləşdiyi yaşayış kompleksi.",
    brand: "Reportage.",
    brandSub: "Properties",
    brandClass: "brand-reportage",
    order: 0,
    isVisible: true,
  },
  {
    title: "Arabian Ranches",
    slug: "arabian-ranches",
    image: "/uploads/layihelerimiz/arabian-cover.jpg",
    description: "Şərq memarlığının elementləri ilə layihələndirilmiş, geniş şəxsi bağ sahəsi və terrasları olan özəl rezidensiya.",
    brand: "SEA BREEZE",
    brandSub: "REAL ESTATE",
    brandClass: "brand-seabreeze",
    order: 1,
    isVisible: true,
  },
  {
    title: "Marina Village",
    slug: "marina-village",
    image: "/uploads/layihelerimiz/marina-cover.jpg",
    description: "Yaxta klubuna sahib olan, tam təhvil verilməyə hazır dəniz mənzərəli fərdi yaşayış sahələri.",
    brand: "SEA BREEZE",
    brandSub: "REAL ESTATE",
    brandClass: "brand-seabreeze",
    order: 2,
    isVisible: true,
  },
  {
    title: "Panorama by Elie Saab",
    slug: "panorama-by-elie-saab",
    image: "/uploads/layihelerimiz/panorama-cover.png",
    description: "Dünyaşöhrətli dizaynerin imzasını daşıyan, Azərbaycanın ilk rəsmi brend rezidensiyası.",
    brand: "Reportage.",
    brandSub: "Properties",
    brandClass: "brand-reportage",
    order: 3,
    isVisible: true,
  },
  {
    title: "Brabus Island",
    slug: "brabus-island",
    image: "/uploads/layihelerimiz/brabus-cover.jpg",
    description: "Tamamilə süni ada üzərində qurulan, fərdi villa və rezidensiyaları ilə özünəməxsus ekstrem estetikasını əks etdirən konsept.",
    brand: "Reportage.",
    brandSub: "Properties",
    brandClass: "brand-reportage",
    order: 4,
    isVisible: true,
  },
  {
    title: "Sabah Residence",
    slug: "sabah-residence",
    image: "/uploads/layihelerimiz/sabah-cover.png",
    description: "Günbəgün artan prestiji lokasiyada dəniz havasına və mərkəzi şəhər dinamikasına malik tamamlanmış layihə.",
    brand: "SABAH",
    brandSub: "RESIDENCE",
    brandClass: "brand-reportage",
    order: 5,
    isVisible: true,
  },
];

async function main() {
  console.log("Seeding Layihelerimiz categories...");

  for (const cat of categories) {
    const existing = await prisma.layihelerimizCategory.findUnique({
      where: { slug: cat.slug },
    });

    if (existing) {
      console.log(`  Already exists: ${cat.title}`);
      continue;
    }

    await prisma.layihelerimizCategory.create({ data: cat });
    console.log(`  Created: ${cat.title}`);
  }

  console.log("Layihelerimiz seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
