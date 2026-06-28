import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const projectDetails = [
  {
    categorySlug: "panorama-by-elie-saab",
    heroTitle: "PANORAMA BY ELIE SAAB",
    heroDesktopDesc: "A sophisticated blend of high-fashion aesthetics and modern luxury.",
    heroMobileDesc: "Curated real estate investments and tailored lifestyle solutions.",
    heroImages: [
      { url: "/uploads/layihelerimiz/panorama-cover.png", alt: "Panorama by Elie Saab" },
    ],
    heroCtaText: "GET A CONSULTATION",
    heroCtaLink: "/consultation",

    overviewTitleLight: "Project ",
    overviewTitleBold: "Overview",
    overviewBrandName: "Panorama by ELIE SAAB",
    overviewDebutText: " marks the debut of ",
    overviewLocationText: "branded residences",
    overviewDebutTextEnd: "at Sea Breeze.",
    overviewDescription:
      "This landmark project translates the legendary designer's \"timeless elegance\" from Haute Couture into exclusive coastal living. Every detail is meticulously crafted to define a new global standard of sophisticated lifestyle.",
    overviewImageLarge: "/images/project-overview/po1.jpg",
    overviewImageLargeLabel: "Modern architecture of buildings",
    overviewImageMedium: "/images/project-overview/po2.jpg",
    overviewImageMediumLabel: "Elegant living",
    overviewImageSmall: "/images/project-overview/po3.jpg",
    overviewImageSmallLabel: "Incredible view",
    overviewDataRows: [
      { key: "Project Type", value: "Residential complex" },
      { key: "Year of Completion", value: "2030" },
      { key: "Price Range", value: "MIN — 188 874 USD, MAX — 849 849 USD" },
    ],

    featuresHeaderMain:
      "The project's architecture is harmoniously complemented by a world-class infrastructure designed to anticipate your every need.",
    featuresHeaderSub:
      "From high-tech security to premium leisure zones, every technical specification is engineered for absolute comfort and peace of mind.",
    featuresTitleLight: "Project ",
    featuresTitleBold: "Details",
    featuresSections: [
      {
        id: "01",
        titleItalic: "Comfort",
        titleRest: " and Safety",
        subtitle: "Excellence in every detail.",
        items: [
          "Underground parking space",
          "24/7 Security system",
          "Business center and workspaces",
          "Lounge and relaxation areas",
        ],
        dark: true,
        image: "/images/project-details/pd1.jpg",
        imageLeft: true,
      },
      {
        id: "02",
        titleItalic: "Wellness",
        titleRest: " and Leisure",
        subtitle: "An oasis of tranquility and relaxation.",
        items: [
          'Two spacious "infinity" pools',
          "Private SPA and wellness zone",
          "Water sports center",
          "Landscaped gardens and fountains",
        ],
        dark: false,
        image: "/images/project-details/pd2.jpg",
        imageLeft: false,
      },
      {
        id: "03",
        titleItalic: "Sports",
        titleRest: " and Activity",
        subtitle: "Energy and movement in every space.",
        items: [
          "Fully equipped gym & fitness center",
          "Professional squash court",
          "Table tennis area",
          "Kids' entertainment and play zones",
        ],
        dark: true,
        image: "/images/project-details/pd3.jpg",
        imageLeft: true,
      },
      {
        id: "04",
        titleItalic: "Location",
        titleRest: " Highlights",
        subtitle: "The perfect balance of city and sea.",
        items: [
          "Crescent Island — within walking distance",
          "Dream Arena — within walking distance",
          "Sea Breeze Casino — within walking distance",
          "Baku Airport (GYD) — easily accessible",
        ],
        dark: false,
        image: "/images/project-details/pd4.jpg",
        imageLeft: false,
      },
    ],

    locationTitleLight: "Property ",
    locationTitleBold: "Location",
    locationMainLead:
      "Panorama by ELIE SAAB sits in the elite heart of Sea Breeze, just behind the iconic Crescent.",
    locationSubText:
      "Its unique position ensures a seamless blend of breathtaking Caspian panoramas and lush, meticulously designed landscapes.",
    locationMapImage: "/images/property-location/pl.png",
    locationFooterAddress: "Sea Breeze Resort, Nardaran District, Baku, Azerbaijan",
    locationGoogleMapsUrl: "",

    seoTitle: "Panorama by Elie Saab | TREVA Real Estate",
    seoDescription: "A sophisticated blend of high-fashion aesthetics and modern luxury.",
    ogImage: "/images/projects/project1.jpg",
  },
];

async function main() {
  console.log("Seeding project details...");

  for (const detail of projectDetails) {
    const existing = await prisma.layihelerimizProjectDetail.findUnique({
      where: { categorySlug: detail.categorySlug },
    });

    if (existing) {
      console.log(`  Already exists: ${detail.categorySlug}`);
      continue;
    }

    await prisma.layihelerimizProjectDetail.create({ data: detail });
    console.log(`  Created: ${detail.categorySlug}`);
  }

  console.log("Project details seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
