export type Channel = "phone" | "whatsapp" | "chat" | "voice";

export interface Conversation {
  id: string;
  channel: Channel;
  contact: string;
  preview: string;
  time: string;
  summary: string;
  transcript: { from: "caller" | "ai"; text: string }[];
  actions: { type: string; detail: string }[];
}

export const conversations: Conversation[] = [
  {
    id: "c1",
    channel: "phone",
    contact: "+31 6 1234 5678",
    preview: "Wil een afspraak verzetten naar volgende week",
    time: "09:42",
    summary:
      "Beller wil de afspraak van donderdag verzetten. AI heeft dinsdag 10:00 voorgesteld en bevestigd. Taak aangemaakt in CRM.",
    transcript: [
      { from: "ai", text: "Goedemorgen, u spreekt met de assistent van Van Dijk Installaties. Waarmee kan ik u helpen?" },
      { from: "caller", text: "Ja hallo, ik heb donderdag een afspraak staan maar dat komt toch niet uit." },
      { from: "ai", text: "Geen probleem. Ik zie een afspraak donderdag om 14:00. Schikt dinsdag om 10:00 als alternatief?" },
      { from: "caller", text: "Ja, dinsdag 10 uur is prima." },
      { from: "ai", text: "Dan heb ik dat aangepast. U ontvangt een bevestiging per e-mail. Fijne dag!" },
    ],
    actions: [
      { type: "Taak", detail: "Afspraak verzet naar di 10:00 — bevestiging sturen" },
      { type: "Notitie", detail: "Klant geeft voorkeur aan ochtenden" },
    ],
  },
  {
    id: "c2",
    channel: "whatsapp",
    contact: "Sanne de Vries",
    preview: "Wat kost een onderhoudsbeurt voor een cv-ketel?",
    time: "09:15",
    summary:
      "Prijsvraag over cv-onderhoud. AI gaf het tarief uit de bedrijfskennis en bood een afspraak aan; klant denkt erover na.",
    transcript: [
      { from: "caller", text: "Hoi, wat kost een onderhoudsbeurt voor een cv-ketel?" },
      { from: "ai", text: "Een onderhoudsbeurt kost €119 inclusief btw en duurt ongeveer 45 minuten. Zal ik een afspraak voor u inplannen?" },
      { from: "caller", text: "Ik denk er even over na, dank je!" },
    ],
    actions: [{ type: "Notitie", detail: "Prijsvraag cv-onderhoud — mogelijk lead" }],
  },
  {
    id: "c3",
    channel: "chat",
    contact: "Bezoeker website",
    preview: "Zijn jullie ook in het weekend bereikbaar?",
    time: "gisteren",
    summary: "Vraag over weekendbereikbaarheid, beantwoord met openingstijden uit de bedrijfskennis.",
    transcript: [
      { from: "caller", text: "Zijn jullie ook in het weekend bereikbaar?" },
      { from: "ai", text: "Voor storingen zijn we 24/7 bereikbaar. Voor planbare klussen zijn we op zaterdag tot 13:00 open." },
    ],
    actions: [],
  },
  {
    id: "c4",
    channel: "voice",
    contact: "Demo — websitebezoeker",
    preview: "Voice-demo vanaf de homepage",
    time: "gisteren",
    summary: "Bezoeker probeerde de voice-demo en vroeg wat de assistent voor een kapsalon kan doen.",
    transcript: [
      { from: "caller", text: "Wat kun je voor mijn kapsalon betekenen?" },
      { from: "ai", text: "Ik kan afspraken inplannen, vragen over prijzen en openingstijden beantwoorden en gemiste oproepen opvangen — dag en nacht." },
    ],
    actions: [],
  },
];

export const channelLabel: Record<Channel, string> = {
  phone: "Telefoon",
  whatsapp: "WhatsApp",
  chat: "Chat",
  voice: "Voice-demo",
};
