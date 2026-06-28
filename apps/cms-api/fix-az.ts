import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const data = {
    heroDesktopDesc: "Panorama by ELIE SAAB layih\u0131si Sea Breeze-in x\u00fcsusi n\u00f6qt\u0131sind\u0131, Az\u0131rbaycan\u0131n ilk r\u00e9smi brend rezidensiyas\u0131 olaraq ucal\u0131r. Haute Couture d\u00fcnyas\u0131n\u0131n zamans\u0131z z\u00e9rifliyi f\u00e9rdi ya\u015fay\u0131\u015f sah\u00e9l\u00e9rin\u00e9 k\u00f6\u00e7\u00fcr\u00fcl\u00e9r\u00e9k qlobal h\u00e9yat standartlar\u0131n\u0131 yenid\u00e9n formala\u015f\u0131d\u0131r\u0131r.",
  };
  // Just log what we have to debug
  console.log("Test:", data.heroDesktopDesc);
}

main().catch(console.error).finally(() => prisma.$disconnect());
