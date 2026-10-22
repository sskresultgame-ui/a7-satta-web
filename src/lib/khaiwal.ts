// Client-safe shared types + defaults for the A7 Satta admin settings.
// (No database code here — this file is imported by client components too.)

export type Khaiwal = { name: string; whatsapp: string };

export type HomepageSeo = {
  metaTitle: string; // {date} is replaced with today's date (IST)
  metaDescription: string; // {date} is replaced with today's date (IST)
  keywords: string; // comma separated
  h1: string; // empty = default bilingual heading
  intro: string; // empty = default bilingual intro line
  contentHeading: string; // empty = default SEO block
  content: string; // paragraphs separated by a blank line
};

// Used until the admin saves something, or if the database is unreachable.
export const KHAIWAL: Khaiwal = {
  name: "SIRAJ BHAI KHAIWAL",
  whatsapp: "9587741126",
};

export const DEFAULT_HOMEPAGE_SEO: HomepageSeo = {
  metaTitle: "{date} A7 Satta Result | Live A7 Satta | Gali Desawar Faridabad Ghaziabad",
  metaDescription:
    "Check the latest {date} A7 Satta King Result with live updates, Satta Matka results, old charts, previous winning numbers, and daily updated results of all popular games.",
  keywords:
    "a7 satta, a7satta, satta king, satta king result, today satta king result, live satta result, satta matka, gali result, desawar result, faridabad result, ghaziabad result, satta chart",
  h1: "",
  intro: "",
  contentHeading: "",
  content: "",
};

export function todayIST() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
}

export function fillDate(text: string) {
  return text.replace(/\{date\}/gi, todayIST());
}
