import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin, requestMeta } from "@/lib/admin-auth";
import { getAdminLog, getHomepageSeo, getKhaiwal, saveSetting } from "@/lib/site-settings";
import type { HomepageSeo, Khaiwal } from "@/lib/khaiwal";
import { sanitizeSeoHtml } from "@/lib/seo-html";

export const dynamic = "force-dynamic";

const unauthorized = () => NextResponse.json({ success: false, error: "Not logged in" }, { status: 401 });
const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  const [khaiwal, homepageSeo, log] = await Promise.all([getKhaiwal(), getHomepageSeo(), getAdminLog()]);
  return NextResponse.json({ success: true, khaiwal, homepageSeo, log });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const { section, value } = await req.json();

    if (section === "khaiwal") {
      const whatsapp = str(value?.whatsapp, 15).replace(/[^0-9]/g, "");
      if (whatsapp.length < 10) return NextResponse.json({ success: false, error: "Enter a valid 10-digit WhatsApp number" }, { status: 400 });
      const khaiwal: Khaiwal = { name: str(value?.name, 80), whatsapp };
      await saveSetting("khaiwal", khaiwal, requestMeta(req));
    } else if (section === "homepageSeo") {
      const seo: HomepageSeo = {
        metaTitle: str(value?.metaTitle, 200),
        metaDescription: str(value?.metaDescription, 400),
        keywords: str(value?.keywords, 1000),
        h1: str(value?.h1, 200),
        intro: str(value?.intro, 500),
        contentHeading: str(value?.contentHeading, 200),
        content: sanitizeSeoHtml(str(value?.content, 50000)), // HTML allowed, scripts removed
      };
      if (!seo.metaTitle || !seo.metaDescription) {
        return NextResponse.json({ success: false, error: "Meta title and meta description are required" }, { status: 400 });
      }
      await saveSetting("homepageSeo", seo, requestMeta(req));
    } else {
      return NextResponse.json({ success: false, error: "Unknown section" }, { status: 400 });
    }

    // Refresh every cached page (homepage, contact, WhatsApp button in the layout) right away.
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
