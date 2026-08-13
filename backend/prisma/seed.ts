import { prisma } from "../src/db.js";

const ORG_ID = "org_demo";

async function main() {
  const month = new Date().toISOString().slice(0, 7);

  await prisma.organization.upsert({
    where: { id: ORG_ID },
    update: {},
    create: {
      id: ORG_ID,
      name: "Van Dijk Installaties",
      website: "https://vandijk-installaties.nl",
      agent: {
        create: {
          prompt:
            "Je bent de vriendelijke receptionist van Van Dijk Installaties. Beantwoord vragen kort en duidelijk. Plan afspraken alleen op werkdagen. Verbind door naar een medewerker bij klachten.",
          knowledge:
            "Van Dijk Installaties: cv-onderhoud (€119 incl. btw, ±45 min), storingsdienst 24/7, planbare klussen ma–vr en za tot 13:00.",
        },
      },
      subscription: {
        create: { plan: "COMPLEET", pricePerMonth: 249, status: "active" },
      },
    },
  });

  for (const [channel, quota] of [
    ["PHONE", 300],
    ["WHATSAPP", 200],
    ["CHAT", 500],
  ] as const) {
    await prisma.usage.upsert({
      where: {
        organizationId_channel_month: { organizationId: ORG_ID, channel, month },
      },
      update: {},
      create: { organizationId: ORG_ID, channel, month, quota, used: 0 },
    });
  }

  const count = await prisma.conversation.count({ where: { organizationId: ORG_ID } });
  if (count > 0) {
    console.log("seed: conversations already present, skipping");
    return;
  }

  await prisma.conversation.create({
    data: {
      organizationId: ORG_ID,
      channel: "PHONE",
      contact: "+31 6 1234 5678",
      summary:
        "Beller wil de afspraak van donderdag verzetten. AI heeft dinsdag 10:00 voorgesteld en bevestigd. Taak aangemaakt in CRM.",
      messages: {
        create: [
          { role: "AI", text: "Goedemorgen, u spreekt met de assistent van Van Dijk Installaties. Waarmee kan ik u helpen?" },
          { role: "CALLER", text: "Ja hallo, ik heb donderdag een afspraak staan maar dat komt toch niet uit." },
          { role: "AI", text: "Geen probleem. Ik zie een afspraak donderdag om 14:00. Schikt dinsdag om 10:00 als alternatief?" },
          { role: "CALLER", text: "Ja, dinsdag 10 uur is prima." },
          { role: "AI", text: "Dan heb ik dat aangepast. U ontvangt een bevestiging per e-mail. Fijne dag!" },
        ],
      },
      actions: {
        create: [
          { type: "Taak", detail: "Afspraak verzet naar di 10:00 — bevestiging sturen" },
          { type: "Notitie", detail: "Klant geeft voorkeur aan ochtenden" },
        ],
      },
    },
  });

  await prisma.conversation.create({
    data: {
      organizationId: ORG_ID,
      channel: "WHATSAPP",
      contact: "Sanne de Vries",
      summary:
        "Prijsvraag over cv-onderhoud. AI gaf het tarief uit de bedrijfskennis en bood een afspraak aan; klant denkt erover na.",
      messages: {
        create: [
          { role: "CALLER", text: "Hoi, wat kost een onderhoudsbeurt voor een cv-ketel?" },
          { role: "AI", text: "Een onderhoudsbeurt kost €119 inclusief btw en duurt ongeveer 45 minuten. Zal ik een afspraak voor u inplannen?" },
          { role: "CALLER", text: "Ik denk er even over na, dank je!" },
        ],
      },
      actions: { create: [{ type: "Notitie", detail: "Prijsvraag cv-onderhoud — mogelijk lead" }] },
    },
  });

  await prisma.conversation.create({
    data: {
      organizationId: ORG_ID,
      channel: "CHAT",
      contact: "Bezoeker website",
      summary: "Vraag over weekendbereikbaarheid, beantwoord met openingstijden uit de bedrijfskennis.",
      messages: {
        create: [
          { role: "CALLER", text: "Zijn jullie ook in het weekend bereikbaar?" },
          { role: "AI", text: "Voor storingen zijn we 24/7 bereikbaar. Voor planbare klussen zijn we op zaterdag tot 13:00 open." },
        ],
      },
    },
  });

  await prisma.conversation.create({
    data: {
      organizationId: ORG_ID,
      channel: "VOICE",
      contact: "Demo — websitebezoeker",
      summary: "Bezoeker probeerde de voice-demo en vroeg wat de assistent voor een kapsalon kan doen.",
      messages: {
        create: [
          { role: "CALLER", text: "Wat kun je voor mijn kapsalon betekenen?" },
          { role: "AI", text: "Ik kan afspraken inplannen, vragen over prijzen en openingstijden beantwoorden en gemiste oproepen opvangen — dag en nacht." },
        ],
      },
    },
  });

  console.log("seed: demo organization + conversations created");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
