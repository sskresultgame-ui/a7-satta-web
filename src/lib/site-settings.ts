import { a7AdminLogCollection, a7AdminSettingsCollection } from "./mongodb";
import { DEFAULT_HOMEPAGE_SEO, KHAIWAL, type HomepageSeo, type Khaiwal } from "./khaiwal";

// Specific keys + site tag, so these documents are unmistakably a7satta.co's.
const SITE = "a7satta.co";
export const SETTING_KEYS = {
  khaiwal: "a7satta.co:khaiwal",
  homepageSeo: "a7satta.co:homepage-seo",
} as const;
export type SettingSection = keyof typeof SETTING_KEYS;

async function read<T>(section: SettingSection, fallback: T): Promise<T> {
  try {
    const doc = await (await a7AdminSettingsCollection()).findOne({ key: SETTING_KEYS[section], site: SITE });
    return doc?.value ? { ...fallback, ...(doc.value as T) } : fallback;
  } catch (err) {
    console.error(`[a7-settings] read ${section} failed`, err);
    return fallback;
  }
}

export const getKhaiwal = () => read<Khaiwal>("khaiwal", KHAIWAL);
export const getHomepageSeo = () => read<HomepageSeo>("homepageSeo", DEFAULT_HOMEPAGE_SEO);

export async function saveSetting(section: SettingSection, value: Khaiwal | HomepageSeo, meta: { ip: string; userAgent: string }) {
  const previous = section === "khaiwal" ? await getKhaiwal() : await getHomepageSeo();
  await (await a7AdminSettingsCollection()).updateOne(
    { key: SETTING_KEYS[section], site: SITE },
    { $set: { key: SETTING_KEYS[section], site: SITE, value, updatedAt: new Date() } },
    { upsert: true }
  );
  await (await a7AdminLogCollection()).insertOne({ site: SITE, section, previous, value, ...meta, at: new Date() });
}

export async function getAdminLog(limit = 20) {
  const docs = await (await a7AdminLogCollection()).find({ site: SITE }).sort({ at: -1 }).limit(limit).toArray();
  return docs.map(({ _id, ...rest }) => ({ id: String(_id), ...rest }));
}
