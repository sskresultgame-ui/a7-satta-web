import ContactClient from "./ContactClient";
import { getKhaiwal } from "@/lib/site-settings";

export const revalidate = 300;

export default async function ContactPage() {
  const khaiwal = await getKhaiwal();
  return <ContactClient phone={khaiwal.whatsapp} />;
}
