import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const projectDetails = [
  {
    categorySlug: "panorama-by-elie-saab",
    heroTitle: "PANORAMA BY ELIE SAAB",
    heroDesktopDesc: "Y\u00fcks\u00e9k moda estetikas\u0131 il\u00e9 m\u00fcasir memarl\u0131\u011f\u0131n d\u00e9niz sahilind\u00e9ki harmoniyas\u0131.",
    heroMobileDesc: "Curated real estate investments and tailored lifestyle solutions.",
    heroImages: [
      { url: "/uploads/layihelerimiz/panorama-cover.png", alt: "Panorama by Elie Saab" },
    ],
    heroCtaText: "GET A CONSULTATION",
    heroCtaLink: "/consultation",

    overviewTitleLight: "Layih\u00e9y\u00e9 ",
    overviewTitleBold: "\u00dcmumi Bax\u0131\u015f",
    overviewBrandName: "Panorama by ELIE SAAB",
    overviewDebutText: " layih\u00e9si Sea Breeze-in x\u00fcsusi n\u00f6qt\u00e9sind\u00e9, ",
    overviewLocationText: "branded residences",
    overviewDebutTextEnd: " olaraq ucal\u0131r.",
    overviewDescription:
      "Haute Couture d\u00fcnyas\u0131n\u0131n zamans\u0131z z\u00e9rifliyi f\u00e9rdi ya\u015fay\u0131\u015f sah\u00e9l\u00e9rin\u00e9 k\u00f6\u00e7\u00fcr\u00fcl\u00e9r\u00e9k qlobal h\u00e9yat standartlar\u0131n\u0131 yenid\u00e9n formala\u015f\u0131d\u0131r\u0131r.",
    overviewImageLarge: "/images/project-overview/po1.jpg",
    overviewImageLargeLabel: "M\u00fcasir memarl\u0131q strukturu",
    overviewImageMedium: "/images/project-overview/po2.jpg",
    overviewImageMediumLabel: "Z\u00e9rif h\u00e9yat t\u00e9rzi",
    overviewImageSmall: "/images/project-overview/po3.jpg",
    overviewImageSmallLabel: "Unikal d\u00e9niz m\u00e9nz\u00e9r\u00e9si",
    overviewDataRows: [
      { key: "Layih\u00e9nin N\u00f6v\u00fc", value: "Ya\u015fay\u0131\u015f Kompleksi" },
      { key: "T\u00e9hvil Verilm\u00e9 Tarixi", value: "2030-cu il" },
      { key: "Qiym\u00e9t Aral\u0131\u011f\u0131", value: "MIN \u2014 188 784 USD, MAX \u2014 849 849 USD" },
    ],

    featuresHeaderMain:
      "Kompleksin t\u00e9qdim etdiyi m\u00fcasir infrastruktur h\u00e9ll\u00e9ri, daxili m\u00e9kanlarda ELIE SAAB d\u00fcnyas\u0131n\u0131n f\u00e9rdi moda z\u00e9rifliyin\u00e9 sahib interyer dizayn\u0131 il\u00e9 tamamlan\u0131r.",
    featuresHeaderSub:
      "Sah\u00e9si 50 m\u00b2 il\u00e9 428 m\u00b2 aras\u0131nda d\u00e9yi\u015f\u00e9n f\u00e9rdi m\u00e9nzill\u00e9rd\u00e9, y\u00fcks\u00e9k t\u00e9hl\u00fck\u00e9sizlik standartlar\u0131ndan tutmus siz\u00e9 \u00f6z\u00e9l istirah\u00e9t zonalar\u0131na q\u00e9d\u00e9r h\u00e9r bir texniki detal tam rahatl\u0131\u011f\u0131n\u0131z \u00fc\u00e7\u00fcn t\u00e9nziml\u00e9nmi\u015fdir.",
    featuresTitleLight: "Layih\u00e9nin ",
    featuresTitleBold: "Detallar\u0131",
    featuresSections: [
      {
        id: "01",
        titleItalic: "F\u00e9rdi Komfort",
        titleRest: " v\u00e9 T\u00e9hl\u00fck\u00e9sizlik",
        subtitle: "H\u00e9r bir detalda tam rahatl\u0131q t\u00e9min olunur.",
        items: [
          "Yeralt\u0131 avtomobil dayanaca\u011f\u0131 sah\u00e9si",
          "24/7 f\u00e9aliyy\u00e9t g\u00f6st\u00e9r\u00e9n m\u00fchafiz\u00e9 sistemi",
          "\u0130\u015f\u00fczar m\u00fchit v\u00e9 s\u00e9m\u00e9r\u00e9li i\u015f m\u00e9kanlar\u0131",
          "Sakinl\u00e9rin dinc\u00e9lm\u00e9si \u00fc\u00e7\u00fcn geni\u015f istirah\u00e9t zonalar\u0131",
        ],
        dark: true,
        image: "/images/project-details/pd1.jpg",
        imageLeft: true,
      },
      {
        id: "02",
        titleItalic: "Sa\u011flaml\u0131q",
        titleRest: " v\u00e9 Asud\u00e9 Vaxt",
        subtitle: "Sakitlik v\u00e9 fiziki yenil\u00e9nm\u00e9 m\u00fchiti.",
        items: [
          "Geni\u015f panoramaya malik iki \u00e9d\u00e9d \"infinity\" hovuzu",
          "X\u00fcsusi daxili hamamlar, spa v\u00e9 sauna gu\u015f\u00e9l\u00e9ri",
          "Su idman\u0131 n\u00f6vl\u00e9ri \u00fc\u00e7\u00fcn infrastruktur",
          "Land\u015f\u00eft memarl\u0131\u011f\u0131 \u00e9sas\u0131nda sal\u0131nm\u0131\u015f ba\u011flar v\u00e9 f\u00e9vvar\u00e9l\u00e9r",
        ],
        dark: false,
        image: "/images/project-details/pd2.jpg",
        imageLeft: false,
      },
      {
        id: "03",
        titleItalic: "Aktiv H\u00e9yat",
        titleRest: " v\u00e9 \u0130dman",
        subtitle: "Dinamikan\u0131n \u00f6n planda oldu\u011fu m\u00e9kanlar.",
        items: [
          "M\u00fcasir avadanl\u0131qlarla t\u00e9chiz olunmu\u015f fitnes zal\u0131",
          "Pe\u015f\u00e9kar standartlara cavab ver\u00e9n idman sah\u00e9si",
          "Masa\u00fcst\u00fc tennis \u00fc\u00e7\u00fcn ayr\u0131lm\u0131\u015f x\u00fcsusi zona",
          "U\u015faqlar \u00fc\u00e7\u00fcn t\u00e9hl\u00fck\u00e9siz \u00e9yl\u00e9nc\u00e9 v\u00e9 oyun m\u00e9kanlar\u0131",
        ],
        dark: true,
        image: "/images/project-details/pd3.jpg",
        imageLeft: true,
      },
      {
        id: "04",
        titleItalic: "Strateji",
        titleRest: " Yerl\u00e9\u015fm\u00e9",
        subtitle: "\u015e\u00e9h\u00e9rin aktiv n\u00f6qt\u00e9l\u00e9rin\u00e9 rahat \u00e7\u0131x\u0131\u015f.",
        items: [
          "Crescent Island \u2014 5 d\u00e9qiq\u00e9lik m\u00e9saf\u00e9",
          "Dream Arena \u2014 7 d\u00e9qiq\u00e9lik m\u00e9saf\u00e9",
          "Royale Casino \u2014 4 d\u00e9qiq\u00e9lik m\u00e9saf\u00e9",
          "Heyd\u00e9r \u0130liyev Beyn\u00e9lxalq Hava Liman\u0131 \u2014 15 d\u00e9qiq\u00e9lik m\u00e9saf\u00e9",
        ],
        dark: false,
        image: "/images/project-details/pd4.jpg",
        imageLeft: false,
      },
    ],

    locationTitleLight: "Layih\u00e9nin ",
    locationTitleBold: "Co\u011frafi M\u00f6vqeyi",
    locationBrandName: "Panorama by ELIE SAAB",
    locationMainLead:
      "sits in the elite heart of Sea Breeze, just behind the iconic Crescent.",
    locationSubText:
      "Bu unikal co\u011frafi m\u00f6vq\u00e9 x\u00fcsusi layih\u00e9l\u00e9ndirilmi\u015f m\u00fchiti X\u00e9z\u00e9r d\u00e9nizinin f\u00fcsunk\u00e9r panoramas\u0131 il\u00e9 vizual olaraq bir araya g\u00e9tirir.",
    locationMapImage: "/images/property-location/pl.png",
    locationFooterAddress: "Sea Breeze Resort, Nardaran District, Baku, Azerbaijan",
    locationGoogleMapsUrl: "https://www.google.com/maps/place/Sea+Breeze+Resort/@40.5187,49.8671,15z",

    seoTitle: "Panorama by Elie Saab | TREVA Real Estate",
    seoDescription: "A sophisticated blend of high-fashion aesthetics and modern luxury.",
    ogImage: "/uploads/layihelerimiz/panorama-cover.png",
  },
  {
    categorySlug: "treva-residences",
    heroTitle: "TREVA RESIDENCES",
    heroDesktopDesc: "Premium coastal living in the heart of Sea Breeze with panoramic Caspian views.",
    heroMobileDesc: "Exclusive residences designed for modern luxury living.",
    heroImages: [
      { url: "/uploads/layihelerimiz/reportage-cover.jpg", alt: "TREVA Residences" },
    ],
    heroCtaText: "GET A CONSULTATION",
    heroCtaLink: "/consultation",

    overviewTitleLight: "Project ",
    overviewTitleBold: "Overview",
    overviewBrandName: "TREVA Residences",
    overviewDebutText: " introduces ",
    overviewLocationText: "a new standard of living",
    overviewDebutTextEnd: "at Sea Breeze.",
    overviewDescription:
      "TREVA Residences combines contemporary architecture with the serene beauty of coastal Azerbaijan. Every space is thoughtfully designed to offer comfort, elegance, and an unparalleled lifestyle experience.",
    overviewImageLarge: "/images/project-overview/po1.jpg",
    overviewImageLargeLabel: "Contemporary architecture",
    overviewImageMedium: "/images/project-overview/po2.jpg",
    overviewImageMediumLabel: "Luxury interiors",
    overviewImageSmall: "/images/project-overview/po3.jpg",
    overviewImageSmallLabel: "Caspian Sea view",
    overviewDataRows: [
      { key: "Project Type", value: "Residential complex" },
      { key: "Year of Completion", value: "2028" },
      { key: "Price Range", value: "MIN \u2014 150 000 USD, MAX \u2014 600 000 USD" },
    ],

    featuresHeaderMain:
      "TREVA Residences delivers a comprehensive suite of amenities designed to enhance everyday living.",
    featuresHeaderSub:
      "Every detail is carefully planned to provide the highest level of comfort, security, and convenience.",
    featuresTitleLight: "Project ",
    featuresTitleBold: "Details",
    featuresSections: [
      {
        id: "01",
        titleItalic: "Comfort",
        titleRest: " and Safety",
        subtitle: "Built with you in mind.",
        items: [
          "24/7 security and surveillance",
          "Underground parking",
          "Smart home integration",
          "Central heating and cooling",
        ],
        dark: true,
        image: "/images/project-details/pd1.jpg",
        imageLeft: true,
      },
      {
        id: "02",
        titleItalic: "Wellness",
        titleRest: " and Leisure",
        subtitle: "Relax and recharge.",
        items: [
          "Outdoor swimming pool",
          "Fully equipped gym",
          "SPA and sauna",
          "Children's playground",
        ],
        dark: false,
        image: "/images/project-details/pd2.jpg",
        imageLeft: false,
      },
      {
        id: "03",
        titleItalic: "Location",
        titleRest: " Advantages",
        subtitle: "Connected to everything.",
        items: [
          "Direct beach access",
          "Proximity to Baku city center",
          "Nearby schools and hospitals",
          "Easy highway access",
        ],
        dark: true,
        image: "/images/project-details/pd3.jpg",
        imageLeft: true,
      },
      {
        id: "04",
        titleItalic: "Design",
        titleRest: " and Quality",
        subtitle: "Crafted for perfection.",
        items: [
          "Premium European finishes",
          "Floor-to-ceiling windows",
          "Open-plan living spaces",
          "Private balconies with sea views",
        ],
        dark: false,
        image: "/images/project-details/pd4.jpg",
        imageLeft: false,
      },
    ],

    locationTitleLight: "Property ",
    locationTitleBold: "Location",
    locationMainLead:
      "TREVA Residences is strategically located within the prestigious Sea Breeze resort.",
    locationSubText:
      "Enjoy seamless access to the Caspian coastline, world-class dining, and premium entertainment.",
    locationMapImage: "/images/property-location/pl.png",
    locationFooterAddress: "Sea Breeze Resort, Nardaran District, Baku, Azerbaijan",
    locationGoogleMapsUrl: "https://www.google.com/maps/place/Sea+Breeze+Resort/@40.5187,49.8671,15z",

    seoTitle: "TREVA Residences | TREVA Real Estate",
    seoDescription: "Premium coastal living in the heart of Sea Breeze.",
    ogImage: "/uploads/layihelerimiz/reportage-cover.jpg",
  },
  {
    categorySlug: "reportage-heights",
    heroTitle: "REPORTAGE HEIGHTS",
    heroDesktopDesc: "Modern waterfront living on the Caspian coast, where architecture meets the sea.",
    heroMobileDesc: "Elevated living spaces with stunning sea views.",
    heroImages: [
      { url: "/uploads/layihelerimiz/reportage-cover.jpg", alt: "Reportage Heights" },
    ],
    heroCtaText: "GET A CONSULTATION",
    heroCtaLink: "/consultation",

    overviewTitleLight: "Project ",
    overviewTitleBold: "Overview",
    overviewBrandName: "Reportage Heights",
    overviewDebutText: " brings ",
    overviewLocationText: "modern waterfront living",
    overviewDebutTextEnd: "to Baku's coastline.",
    overviewDescription:
      "Reportage Heights represents a new paradigm in coastal residential development. With its striking modern architecture and premium amenities, this project redefines urban waterfront living in Azerbaijan.",
    overviewImageLarge: "/images/project-overview/po1.jpg",
    overviewImageLargeLabel: "Waterfront architecture",
    overviewImageMedium: "/images/project-overview/po2.jpg",
    overviewImageMediumLabel: "Modern interiors",
    overviewImageSmall: "/images/project-overview/po3.jpg",
    overviewImageSmallLabel: "Sea panorama",
    overviewDataRows: [
      { key: "Project Type", value: "Residential towers" },
      { key: "Year of Completion", value: "2029" },
      { key: "Price Range", value: "MIN \u2014 120 000 USD, MAX \u2014 550 000 USD" },
    ],

    featuresHeaderMain:
      "A full spectrum of premium amenities designed to elevate your daily experience.",
    featuresHeaderSub:
      "From wellness facilities to smart home technology, every feature is built for modern living.",
    featuresTitleLight: "Project ",
    featuresTitleBold: "Details",
    featuresSections: [
      {
        id: "01",
        titleItalic: "Comfort",
        titleRest: " and Security",
        subtitle: "Safe and modern living.",
        items: [
          "Multi-tier security system",
          "Covered parking garage",
          "High-speed elevators",
          "24/7 concierge service",
        ],
        dark: true,
        image: "/images/project-details/pd1.jpg",
        imageLeft: true,
      },
      {
        id: "02",
        titleItalic: "Leisure",
        titleRest: " and Recreation",
        subtitle: "Enjoy life to the fullest.",
        items: [
          "Rooftop infinity pool",
          "State-of-the-art fitness center",
          "Yoga and meditation studio",
          "Landscaped terraces",
        ],
        dark: false,
        image: "/images/project-details/pd2.jpg",
        imageLeft: false,
      },
      {
        id: "03",
        titleItalic: "Sports",
        titleRest: " and Fitness",
        subtitle: "Stay active every day.",
        items: [
          "Indoor basketball court",
          "Tennis and padel courts",
          "Running track along the waterfront",
          "Outdoor fitness stations",
        ],
        dark: true,
        image: "/images/project-details/pd3.jpg",
        imageLeft: true,
      },
      {
        id: "04",
        titleItalic: "Location",
        titleRest: " Highlights",
        subtitle: "Connected to the city.",
        items: [
          "Direct beach access",
          "15 minutes to Baku city center",
          "Near Baku Crystal Hall",
          "Easy access to Heydar Aliyev Airport",
        ],
        dark: false,
        image: "/images/project-details/pd4.jpg",
        imageLeft: false,
      },
    ],

    locationTitleLight: "Property ",
    locationTitleBold: "Location",
    locationMainLead:
      "Reportage Heights occupies a prime waterfront position on the Caspian Sea.",
    locationSubText:
      "The location offers a perfect balance of tranquil coastal living and urban convenience.",
    locationMapImage: "/images/property-location/pl.png",
    locationFooterAddress: "Sea Breeze Resort, Nardaran District, Baku, Azerbaijan",
    locationGoogleMapsUrl: "https://www.google.com/maps/place/Sea+Breeze+Resort/@40.5187,49.8671,15z",

    seoTitle: "Reportage Heights | TREVA Real Estate",
    seoDescription: "Modern waterfront living on the Caspian coast.",
    ogImage: "/uploads/layihelerimiz/reportage-cover.jpg",
  },
  {
    categorySlug: "arabian-ranches",
    heroTitle: "ARABIAN RANCHES",
    heroDesktopDesc: "Exclusive villa living inspired by Arabian elegance in the heart of Sea Breeze.",
    heroMobileDesc: "Private villas with landscaped gardens and sea views.",
    heroImages: [
      { url: "/uploads/layihelerimiz/arabian-cover.jpg", alt: "Arabian Ranches" },
    ],
    heroCtaText: "GET A CONSULTATION",
    heroCtaLink: "/consultation",

    overviewTitleLight: "Project ",
    overviewTitleBold: "Overview",
    overviewBrandName: "Arabian Ranches",
    overviewDebutText: " reimagines ",
    overviewLocationText: "villa living",
    overviewDebutTextEnd: "with Arabian-inspired design.",
    overviewDescription:
      "Arabian Ranches draws inspiration from traditional Arabian architecture, blending it with modern luxury to create a unique residential experience. Each villa is surrounded by beautifully landscaped gardens, offering privacy and tranquility.",
    overviewImageLarge: "/images/project-overview/po1.jpg",
    overviewImageLargeLabel: "Arabian-inspired villas",
    overviewImageMedium: "/images/project-overview/po2.jpg",
    overviewImageMediumLabel: "Landscaped gardens",
    overviewImageSmall: "/images/project-overview/po3.jpg",
    overviewImageSmallLabel: "Private pool area",
    overviewDataRows: [
      { key: "Project Type", value: "Villas and townhouses" },
      { key: "Year of Completion", value: "2028" },
      { key: "Price Range", value: "MIN \u2014 250 000 USD, MAX \u2014 1 200 000 USD" },
    ],

    featuresHeaderMain:
      "Arabian Ranches offers an extensive range of premium amenities that redefine villa living.",
    featuresHeaderSub:
      "Every detail, from private pools to landscaped courtyards, is designed for an exceptional lifestyle.",
    featuresTitleLight: "Project ",
    featuresTitleBold: "Details",
    featuresSections: [
      {
        id: "01",
        titleItalic: "Villa",
        titleRest: " Features",
        subtitle: "Luxury in every detail.",
        items: [
          "Private swimming pools",
          "Landscaped garden terraces",
          "Smart home automation",
          "Premium European kitchen fittings",
        ],
        dark: true,
        image: "/images/project-details/pd1.jpg",
        imageLeft: true,
      },
      {
        id: "02",
        titleItalic: "Community",
        titleRest: " Amenities",
        subtitle: "A world within reach.",
        items: [
          "Community clubhouse",
          "Children's play areas",
          "Jogging and cycling paths",
          "Community garden spaces",
        ],
        dark: false,
        image: "/images/project-details/pd2.jpg",
        imageLeft: false,
      },
      {
        id: "03",
        titleItalic: "Security",
        titleRest: " and Privacy",
        subtitle: "Your sanctuary, protected.",
        items: [
          "Gated community with 24/7 security",
          "CCTV surveillance",
          "Private driveways",
          "Intercom systems",
        ],
        dark: true,
        image: "/images/project-details/pd3.jpg",
        imageLeft: true,
      },
      {
        id: "04",
        titleItalic: "Location",
        titleRest: " Advantages",
        subtitle: "Close to everything, away from it all.",
        items: [
          "Within Sea Breeze resort",
          "Beach access within minutes",
          "Proximity to schools and retail",
          "Easy highway connectivity",
        ],
        dark: false,
        image: "/images/project-details/pd4.jpg",
        imageLeft: false,
      },
    ],

    locationTitleLight: "Property ",
    locationTitleBold: "Location",
    locationMainLead:
      "Arabian Ranches is nestled within the expansive Sea Breeze resort, offering privacy and natural beauty.",
    locationSubText:
      "With direct beach access and proximity to Baku, it perfectly balances seclusion and connectivity.",
    locationMapImage: "/images/property-location/pl.png",
    locationFooterAddress: "Sea Breeze Resort, Nardaran District, Baku, Azerbaijan",
    locationGoogleMapsUrl: "https://www.google.com/maps/place/Sea+Breeze+Resort/@40.5187,49.8671,15z",

    seoTitle: "Arabian Ranches | TREVA Real Estate",
    seoDescription: "Exclusive villa living inspired by Arabian elegance.",
    ogImage: "/uploads/layihelerimiz/arabian-cover.jpg",
  },
  {
    categorySlug: "marina-village",
    heroTitle: "MARINA VILLAGE",
    heroDesktopDesc: "Yacht club living on the Caspian \u2014 where coastal luxury meets maritime lifestyle.",
    heroMobileDesc: "Waterfront residences with yacht club access.",
    heroImages: [
      { url: "/uploads/layihelerimiz/marina-cover.jpg", alt: "Marina Village" },
    ],
    heroCtaText: "GET A CONSULTATION",
    heroCtaLink: "/consultation",

    overviewTitleLight: "Project ",
    overviewTitleBold: "Overview",
    overviewBrandName: "Marina Village",
    overviewDebutText: " creates ",
    overviewLocationText: "marina-front living",
    overviewDebutTextEnd: "at Sea Breeze.",
    overviewDescription:
      "Marina Village offers an unparalleled lifestyle centered around Azerbaijan's premier yacht club. Each residence is designed to maximize waterfront views and provide direct access to the marina promenade.",
    overviewImageLarge: "/images/project-overview/po1.jpg",
    overviewImageLargeLabel: "Marina waterfront",
    overviewImageMedium: "/images/project-overview/po2.jpg",
    overviewImageMediumLabel: "Yacht club lifestyle",
    overviewImageSmall: "/images/project-overview/po3.jpg",
    overviewImageSmallLabel: "Coastal promenade",
    overviewDataRows: [
      { key: "Project Type", value: "Waterfront residences" },
      { key: "Year of Completion", value: "2029" },
      { key: "Price Range", value: "MIN \u2014 170 000 USD, MAX \u2014 750 000 USD" },
    ],

    featuresHeaderMain:
      "Marina Village offers a unique blend of maritime lifestyle and modern residential comfort.",
    featuresHeaderSub:
      "Every amenity is curated to complement the marina lifestyle, from yacht services to waterfront dining.",
    featuresTitleLight: "Project ",
    featuresTitleBold: "Details",
    featuresSections: [
      {
        id: "01",
        titleItalic: "Marina",
        titleRest: " Lifestyle",
        subtitle: "Life by the water.",
        items: [
          "Private yacht berths",
          "Marina promenade access",
          "Waterfront dining and cafes",
          "Boat rental services",
        ],
        dark: true,
        image: "/images/project-details/pd1.jpg",
        imageLeft: true,
      },
      {
        id: "02",
        titleItalic: "Residences",
        titleRest: " Features",
        subtitle: "Modern coastal living.",
        items: [
          "Open-plan layouts",
          "Floor-to-ceiling glass facades",
          "Premium kitchen appliances",
          "Private balconies with sea views",
        ],
        dark: false,
        image: "/images/project-details/pd2.jpg",
        imageLeft: false,
      },
      {
        id: "03",
        titleItalic: "Wellness",
        titleRest: " and Recreation",
        subtitle: "Rejuvenate your senses.",
        items: [
          "Beachfront swimming pool",
          "Full-service SPA",
          "Fitness center with sea views",
          "Water sports facilities",
        ],
        dark: true,
        image: "/images/project-details/pd3.jpg",
        imageLeft: true,
      },
      {
        id: "04",
        titleItalic: "Location",
        titleRest: " Highlights",
        subtitle: "Connected to the coast.",
        items: [
          "Direct marina access",
          "Beach within walking distance",
          "15 minutes to Baku downtown",
          "Near Sea Breeze Casino & Resort",
        ],
        dark: false,
        image: "/images/project-details/pd4.jpg",
        imageLeft: false,
      },
    ],

    locationTitleLight: "Property ",
    locationTitleBold: "Location",
    locationMainLead:
      "Marina Village occupies a prime position along the Sea Breeze marina promenade.",
    locationSubText:
      "Steps away from the yacht club, beaches, and a curated selection of restaurants and boutiques.",
    locationMapImage: "/images/property-location/pl.png",
    locationFooterAddress: "Marina Village, Sea Breeze Resort, Nardaran, Baku 1097",
    locationGoogleMapsUrl: "https://www.google.com/maps/place/Sea+Breeze+Marina/@40.5187,49.8671,15z",

    seoTitle: "Marina Village | TREVA Real Estate",
    seoDescription: "Yacht club living on the Caspian coast.",
    ogImage: "/uploads/layihelerimiz/marina-cover.jpg",
  },
  {
    categorySlug: "brabus-island",
    heroTitle: "BRABUS ISLAND",
    heroDesktopDesc: "An iconic man-made island concept featuring exclusive villas and residences.",
    heroMobileDesc: "Exclusive island living on a man-made island.",
    heroImages: [
      { url: "/uploads/layihelerimiz/brabus-cover.jpg", alt: "Brabus Island" },
    ],
    heroCtaText: "GET A CONSULTATION",
    heroCtaLink: "/consultation",

    overviewTitleLight: "Project ",
    overviewTitleBold: "Overview",
    overviewBrandName: "Brabus Island",
    overviewDebutText: " introduces ",
    overviewLocationText: "island living",
    overviewDebutTextEnd: "to the Caspian Sea.",
    overviewDescription:
      "Brabus Island is a bold architectural statement \u2014 an entirely man-made island dedicated to ultra-exclusive villa and residence living. The project embodies a unique blend of extreme aesthetics and uncompromising luxury.",
    overviewImageLarge: "/images/project-overview/po1.jpg",
    overviewImageLargeLabel: "Island concept",
    overviewImageMedium: "/images/project-overview/po2.jpg",
    overviewImageMediumLabel: "Exclusive villas",
    overviewImageSmall: "/images/project-overview/po3.jpg",
    overviewImageSmallLabel: "Aerial island view",
    overviewDataRows: [
      { key: "Project Type", value: "Island villas" },
      { key: "Year of Completion", value: "2031" },
      { key: "Price Range", value: "MIN \u2014 500 000 USD, MAX \u2014 3 000 000 USD" },
    ],

    featuresHeaderMain:
      "Brabus Island redefines ultra-luxury living with amenities found nowhere else in the region.",
    featuresHeaderSub:
      "From private beaches to helipad access, every feature is designed for the most discerning residents.",
    featuresTitleLight: "Project ",
    featuresTitleBold: "Details",
    featuresSections: [
      {
        id: "01",
        titleItalic: "Island",
        titleRest: " Amenities",
        subtitle: "A world apart.",
        items: [
          "Private beaches for each villa cluster",
          "Helipad and yacht docking",
          "Underwater viewing galleries",
          "Exclusive beach clubs",
        ],
        dark: true,
        image: "/images/project-details/pd1.jpg",
        imageLeft: true,
      },
      {
        id: "02",
        titleItalic: "Villa",
        titleRest: " Design",
        subtitle: "Beyond architecture.",
        items: [
          "Bespoke villa designs",
          "Private infinity pools",
          "Rooftop entertainment terraces",
          "Smart home technology throughout",
        ],
        dark: false,
        image: "/images/project-details/pd2.jpg",
        imageLeft: false,
      },
      {
        id: "03",
        titleItalic: "Security",
        titleRest: " and Access",
        subtitle: "Ultimate privacy.",
        items: [
          "Island-wide security perimeter",
          "Biometric access control",
          "Private ferry and boat transfers",
          "24/7 surveillance system",
        ],
        dark: true,
        image: "/images/project-details/pd3.jpg",
        imageLeft: true,
      },
      {
        id: "04",
        titleItalic: "Location",
        titleRest: " Access",
        subtitle: "Connected by sea.",
        items: [
          "10 minutes by boat to mainland",
          "Direct access to Sea Breeze resort",
          "Scenic coastal route to Baku",
          "Private marina for residents",
        ],
        dark: false,
        image: "/images/project-details/pd4.jpg",
        imageLeft: false,
      },
    ],

    locationTitleLight: "Property ",
    locationTitleBold: "Location",
    locationMainLead:
      "Brabus Island is situated in the Caspian Sea, just off the coast of the Sea Breeze resort.",
    locationSubText:
      "Accessible by private boat, the island offers complete seclusion while remaining close to mainland amenities.",
    locationMapImage: "/images/property-location/pl.png",
    locationFooterAddress: "Brabus Island, Caspian Sea, near Sea Breeze Resort, Baku",
    locationGoogleMapsUrl: "https://www.google.com/maps/place/Sea+Breeze+Resort/@40.5187,49.8671,15z",

    seoTitle: "Brabus Island | TREVA Real Estate",
    seoDescription: "An iconic man-made island concept with exclusive villas.",
    ogImage: "/uploads/layihelerimiz/brabus-cover.jpg",
  },
  {
    categorySlug: "sabah-residence",
    heroTitle: "SABAH RESIDENCE",
    heroDesktopDesc: "Where the sea breeze meets city dynamics \u2014 a completed premium residence.",
    heroMobileDesc: "Completed premium residence with sea and city views.",
    heroImages: [
      { url: "/uploads/layihelerimiz/sabah-cover.png", alt: "Sabah Residence" },
    ],
    heroCtaText: "GET A CONSULTATION",
    heroCtaLink: "/consultation",

    overviewTitleLight: "Project ",
    overviewTitleBold: "Overview",
    overviewBrandName: "Sabah Residence",
    overviewDebutText: " delivers ",
    overviewLocationText: "ready-to-move luxury",
    overviewDebutTextEnd: "in a prime location.",
    overviewDescription:
      "Sabah Residence stands as a testament to quality construction and modern design. Already completed and ready for occupancy, this premium residence offers the perfect blend of sea proximity and urban accessibility.",
    overviewImageLarge: "/images/project-overview/po1.jpg",
    overviewImageLargeLabel: "Completed residence",
    overviewImageMedium: "/images/project-overview/po2.jpg",
    overviewImageMediumLabel: "Premium interiors",
    overviewImageSmall: "/images/project-overview/po3.jpg",
    overviewImageSmallLabel: "City and sea views",
    overviewDataRows: [
      { key: "Project Type", value: "Residential complex" },
      { key: "Year of Completion", value: "Completed" },
      { key: "Price Range", value: "MIN \u2014 95 000 USD, MAX \u2014 400 000 USD" },
    ],

    featuresHeaderMain:
      "Sabah Residence is fully completed with all amenities operational and ready for residents.",
    featuresHeaderSub:
      "Move in immediately and enjoy a complete lifestyle with everything at your doorstep.",
    featuresTitleLight: "Project ",
    featuresTitleBold: "Details",
    featuresSections: [
      {
        id: "01",
        titleItalic: "Ready",
        titleRest: " to Move",
        subtitle: "Move in today.",
        items: [
          "Fully completed construction",
          "Ready for immediate occupancy",
          "All utilities connected",
          "Furnished options available",
        ],
        dark: true,
        image: "/images/project-details/pd1.jpg",
        imageLeft: true,
      },
      {
        id: "02",
        titleItalic: "Living",
        titleRest: " Amenities",
        subtitle: "Complete lifestyle.",
        items: [
          "Swimming pool and fitness center",
          "Underground parking",
          "Children's play area",
          "24/7 security service",
        ],
        dark: false,
        image: "/images/project-details/pd2.jpg",
        imageLeft: false,
      },
      {
        id: "03",
        titleItalic: "Quality",
        titleRest: " Finishes",
        subtitle: "Built to last.",
        items: [
          "European-standard materials",
          "Energy-efficient windows",
          "Acoustic insulation",
          "Modern bathroom fixtures",
        ],
        dark: true,
        image: "/images/project-details/pd3.jpg",
        imageLeft: true,
      },
      {
        id: "04",
        titleItalic: "Location",
        titleRest: " Benefits",
        subtitle: "Best of both worlds.",
        items: [
          "5 minutes to the beach",
          "Near Baku city center",
          "Public transport accessibility",
          "Close to schools and shopping",
        ],
        dark: false,
        image: "/images/project-details/pd4.jpg",
        imageLeft: false,
      },
    ],

    locationTitleLight: "Property ",
    locationTitleBold: "Location",
    locationMainLead:
      "Sabah Residence enjoys a strategic position with both sea and city connectivity.",
    locationSubText:
      "Located on Mikayil Mushfig street, it offers easy access to both the coastline and downtown Baku.",
    locationMapImage: "/images/property-location/pl.png",
    locationFooterAddress: "Mikayil Mushfig kuchesi, Nardaran, Baku 1097",
    locationGoogleMapsUrl: "https://www.google.com/maps/place/Nardaran,+Baku/@40.5500,49.8800,14z",

    seoTitle: "Sabah Residence | TREVA Real Estate",
    seoDescription: "Completed premium residence with sea and city proximity.",
    ogImage: "/uploads/layihelerimiz/sabah-cover.png",
  },
  {
    categorySlug: "toronto",
    heroTitle: "TORONTO",
    heroDesktopDesc: "A visionary residential project bringing international living standards to Baku.",
    heroMobileDesc: "International-standard living in the heart of Baku.",
    heroImages: [
      { url: "/uploads/layihelerimiz/reportage-cover.jpg", alt: "Toronto" },
    ],
    heroCtaText: "GET A CONSULTATION",
    heroCtaLink: "/consultation",

    overviewTitleLight: "Project ",
    overviewTitleBold: "Overview",
    overviewBrandName: "Toronto",
    overviewDebutText: " redefines ",
    overviewLocationText: "urban living",
    overviewDebutTextEnd: "in Azerbaijan.",
    overviewDescription:
      "Toronto brings a fresh perspective to residential development in Baku, combining international design standards with local craftsmanship. The project offers a dynamic urban lifestyle in a meticulously planned community.",
    overviewImageLarge: "/images/project-overview/po1.jpg",
    overviewImageLargeLabel: "Modern urban design",
    overviewImageMedium: "/images/project-overview/po2.jpg",
    overviewImageMediumLabel: "Community spaces",
    overviewImageSmall: "/images/project-overview/po3.jpg",
    overviewImageSmallLabel: "City views",
    overviewDataRows: [
      { key: "Project Type", value: "Residential complex" },
      { key: "Year of Completion", value: "2029" },
      { key: "Price Range", value: "MIN \u2014 110 000 USD, MAX \u2014 480 000 USD" },
    ],

    featuresHeaderMain:
      "Toronto offers a comprehensive range of amenities designed for modern urban lifestyles.",
    featuresHeaderSub:
      "From co-working spaces to recreational facilities, every feature caters to contemporary needs.",
    featuresTitleLight: "Project ",
    featuresTitleBold: "Details",
    featuresSections: [
      {
        id: "01",
        titleItalic: "Urban",
        titleRest: " Living",
        subtitle: "City life, elevated.",
        items: [
          "Rooftop lounge and garden",
          "Co-working spaces",
          "High-speed internet infrastructure",
          "Smart building management",
        ],
        dark: true,
        image: "/images/project-details/pd1.jpg",
        imageLeft: true,
      },
      {
        id: "02",
        titleItalic: "Fitness",
        titleRest: " and Wellness",
        subtitle: "Stay healthy and active.",
        items: [
          "Modern gym with personal training",
          "Indoor heated pool",
          "Steam room and sauna",
          "Outdoor yoga deck",
        ],
        dark: false,
        image: "/images/project-details/pd2.jpg",
        imageLeft: false,
      },
      {
        id: "03",
        titleItalic: "Family",
        titleRest: " Friendly",
        subtitle: "Designed for families.",
        items: [
          "Children's indoor play area",
          "Outdoor playground",
          "Kids' swimming pool",
          "Family entertainment zone",
        ],
        dark: true,
        image: "/images/project-details/pd3.jpg",
        imageLeft: true,
      },
      {
        id: "04",
        titleItalic: "Location",
        titleRest: " and Access",
        subtitle: "Connected to the city.",
        items: [
          "Central Baku location",
          "Walking distance to metro",
          "Near major shopping centers",
          "Easy access to business district",
        ],
        dark: false,
        image: "/images/project-details/pd4.jpg",
        imageLeft: false,
      },
    ],

    locationTitleLight: "Property ",
    locationTitleBold: "Location",
    locationMainLead:
      "Toronto is centrally located in Baku, offering unmatched connectivity to the city's key destinations.",
    locationSubText:
      "Surrounded by schools, hospitals, shopping centers, and entertainment venues, it places the city at your fingertips.",
    locationMapImage: "/images/property-location/pl.png",
    locationFooterAddress: "Baku, Azerbaijan",
    locationGoogleMapsUrl: "https://www.google.com/maps/place/Baku/@40.4093,49.8671,12z",

    seoTitle: "Toronto | TREVA Real Estate",
    seoDescription: "International-standard residential living in Baku.",
    ogImage: "/uploads/layihelerimiz/reportage-cover.jpg",
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
