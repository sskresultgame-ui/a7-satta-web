"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_HOMEPAGE_SEO, KHAIWAL, fillDate, type HomepageSeo, type Khaiwal } from "@/lib/khaiwal";
import { toSeoHtml } from "@/lib/seo-html";

const HTML_EXAMPLE = `<h2>A7 Satta Result Today</h2>\n<p>Check the <strong>fastest A7 Satta result</strong> for Gali, Desawar, Faridabad and Ghaziabad.</p>\n\n<h3>Why choose A7Satta.co?</h3>\n<ul>\n  <li>Live results</li>\n  <li>Old charts from 2015</li>\n</ul>`;

type LogEntry = { id: string; section: "khaiwal" | "homepageSeo"; ip: string; userAgent: string; at: string; value: Record<string, string>; previous: Record<string, string> | null };
type Tab = "seo" | "khaiwal" | "history";

const input = "border border-gray-300 p-2.5 w-full rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400";
const label = "block text-xs font-bold text-gray-600 mb-1 mt-4";

function Counter({ value, ideal }: { value: string; ideal: number }) {
  const len = fillDate(value).length;
  return <span className={`text-xs ${len > ideal ? "text-red-500" : "text-gray-400"}`}>{len}/{ideal}</span>;
}

export default function AdminPage() {
  const [status, setStatus] = useState<"checking" | "out" | "in">("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("seo");

  const [seo, setSeo] = useState<HomepageSeo>(DEFAULT_HOMEPAGE_SEO);
  const [khaiwal, setKhaiwal] = useState<Khaiwal>(KHAIWAL);
  const [log, setLog] = useState<LogEntry[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/a7-admin/settings", { cache: "no-store" });
    if (res.status === 401) return setStatus("out");
    const data = await res.json();
    if (data.success) {
      setSeo(data.homepageSeo);
      setKhaiwal(data.khaiwal);
      setLog(data.log || []);
      setStatus("in");
    }
  }, []);

  useEffect(() => {
    load().catch(() => setStatus("out"));
  }, [load]);

  const login = async () => {
    setBusy(true);
    try {
      const data = await fetch("/api/a7-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).then((r) => r.json());
      if (data.success) await load();
      else alert(data.error || "Invalid login");
    } catch {
      alert("Network error");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await fetch("/api/a7-admin/login", { method: "DELETE" });
    setStatus("out");
  };

  const save = async (section: "khaiwal" | "homepageSeo", value: Khaiwal | HomepageSeo) => {
    setBusy(true);
    try {
      const res = await fetch("/api/a7-admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, value }),
      });
      if (res.status === 401) return setStatus("out");
      const data = await res.json();
      if (data.success) {
        alert("Saved! The website is updated.");
        load();
      } else alert(data.error || "Error while saving");
    } catch {
      alert("Network error");
    } finally {
      setBusy(false);
    }
  };

  if (status === "checking") {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>;
  }

  if (status === "out") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-2xl shadow w-80">
          <h1 className="font-black text-lg mb-4 text-center">A7 Satta Admin</h1>
          <input placeholder="Email" className={`${input} mb-3`} onChange={(e) => setEmail(e.target.value)} />
          <input
            placeholder="Password"
            type="password"
            className={`${input} mb-3`}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
          <button className="bg-amber-500 disabled:opacity-60 text-white w-full py-2 rounded-xl font-semibold" onClick={login} disabled={busy}>
            {busy ? "Checking…" : "Login"}
          </button>
        </div>
      </div>
    );
  }

  const setField = (key: keyof HomepageSeo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setSeo({ ...seo, [key]: e.target.value });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-5 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-black text-xl">A7 Satta Admin</h1>
          <button onClick={logout} className="text-sm text-red-600 font-semibold">Logout</button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {([
            ["seo", "🔎 Homepage SEO"],
            ["khaiwal", "👤 Khaiwal"],
            ["history", "🕒 History"],
          ] as [Tab, string][]).map(([key, text]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${tab === key ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              {text}
            </button>
          ))}
        </div>

        {tab === "seo" && (
          <div>
            <p className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-xl p-3">
              Write <b>{"{date}"}</b> anywhere in the meta title or description to show today&apos;s date (e.g. {fillDate("{date}")}).
              Leave the H1, intro or content empty to keep the website&apos;s default text.
            </p>

            <label className={label}>Meta title <Counter value={seo.metaTitle} ideal={60} /></label>
            <input className={input} value={seo.metaTitle} onChange={setField("metaTitle")} />

            <label className={label}>Meta description <Counter value={seo.metaDescription} ideal={160} /></label>
            <textarea className={input} rows={3} value={seo.metaDescription} onChange={setField("metaDescription")} />

            <label className={label}>Keywords (comma separated)</label>
            <textarea className={input} rows={2} value={seo.keywords} onChange={setField("keywords")} />

            {/* Google preview */}
            <div className="mt-4 border rounded-xl p-3 bg-white">
              <p className="text-xs text-gray-400 mb-1">Google preview</p>
              <p className="text-[#1a0dab] text-lg leading-snug truncate">{fillDate(seo.metaTitle)}</p>
              <p className="text-green-700 text-xs">https://www.a7satta.co</p>
              <p className="text-sm text-gray-600 line-clamp-2">{fillDate(seo.metaDescription)}</p>
            </div>

            <h2 className="font-black text-base mt-8 mb-1">Homepage content</h2>

            <label className={label}>H1 heading (top of homepage)</label>
            <input className={input} value={seo.h1} onChange={setField("h1")} placeholder="Default: A7 Satta 2026 Live Results" />

            <label className={label}>Intro line under H1</label>
            <textarea className={input} rows={2} value={seo.intro} onChange={setField("intro")} placeholder="Default: Fastest A7 Satta result updates…" />

            <label className={label}>SEO content heading (bottom of homepage)</label>
            <input className={input} value={seo.contentHeading} onChange={setField("contentHeading")} placeholder="Understanding A7 Satta & A7Satta.co" />

            <div className="flex items-end justify-between gap-2">
              <label className={label}>
                SEO content (HTML) — use any tags: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;a href&gt;, &lt;strong&gt;, &lt;table&gt;, &lt;img&gt;…
              </label>
              {!seo.content.trim() && (
                <button type="button" onClick={() => setSeo({ ...seo, content: HTML_EXAMPLE })} className="text-xs text-amber-600 font-bold whitespace-nowrap mb-1">
                  Insert example
                </button>
              )}
            </div>
            <textarea
              className={`${input} font-mono text-xs`}
              rows={16}
              spellCheck={false}
              value={seo.content}
              onChange={setField("content")}
              placeholder="<h2>Your heading</h2>&#10;<p>Your paragraph…</p>&#10;&#10;Default bilingual SEO block is shown while this is empty."
            />
            <p className="text-xs text-gray-400 mt-1">Scripts, iframes and onclick-type code are removed automatically when you save.</p>

            {seo.content.trim() && (
              <div className="mt-4 border rounded-xl p-4 bg-gray-50">
                <p className="text-xs text-gray-400 mb-3">Live preview (how it looks on the homepage)</p>
                {seo.contentHeading && <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">{seo.contentHeading}</h2>}
                <div className="seo-html" dangerouslySetInnerHTML={{ __html: toSeoHtml(seo.content) }} />
              </div>
            )}

            <button
              onClick={() => save("homepageSeo", seo)}
              disabled={busy}
              className="bg-green-600 disabled:opacity-60 text-white w-full py-3 rounded-xl mt-5 font-semibold"
            >
              {busy ? "Saving…" : "💾 Save Homepage SEO"}
            </button>
          </div>
        )}

        {tab === "khaiwal" && (
          <div>
            <label className={label}>Khaiwal name</label>
            <input className={input} value={khaiwal.name} onChange={(e) => setKhaiwal({ ...khaiwal, name: e.target.value })} />

            <label className={label}>WhatsApp number (10 digits)</label>
            <input
              className={input}
              value={khaiwal.whatsapp}
              inputMode="numeric"
              maxLength={12}
              onChange={(e) => setKhaiwal({ ...khaiwal, whatsapp: e.target.value.replace(/[^0-9]/g, "") })}
            />

            <button
              onClick={() => save("khaiwal", khaiwal)}
              disabled={busy}
              className="bg-green-600 disabled:opacity-60 text-white w-full py-3 rounded-xl mt-5 font-semibold"
            >
              {busy ? "Saving…" : "💾 Save Khaiwal"}
            </button>
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-2 text-sm">
            {log.length === 0 && <p className="text-gray-500">No changes saved yet.</p>}
            {log.map((l) => (
              <div key={l.id} className="border rounded-xl p-3 bg-gray-50">
                <p className="font-semibold">
                  {l.section === "khaiwal" ? "👤 Khaiwal" : "🔎 Homepage SEO"} ·{" "}
                  {new Date(l.at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                </p>
                {l.section === "khaiwal" ? (
                  <p>
                    {l.previous?.whatsapp || "-"} → <b>{l.value?.whatsapp}</b> ({l.value?.name})
                  </p>
                ) : (
                  <p className="truncate">Title: {l.value?.metaTitle}</p>
                )}
                <p className="text-gray-500 text-xs break-all">IP: {l.ip} · {l.userAgent}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
