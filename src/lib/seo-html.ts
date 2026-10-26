// HTML for the homepage SEO block, written in the admin panel.
// Normal HTML tags (headings, paragraphs, lists, links, tables, images…) are kept;
// anything that can run code (script, iframe, onclick=…, javascript: links) is removed.
// Pure functions, so they're safe to use on both the server and the browser.

const ALLOWED_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "small", "mark",
  "sub", "sup", "span", "div", "section", "article", "blockquote", "ul", "ol", "li", "dl", "dt", "dd", "a",
  "img", "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "code", "pre", "figure", "figcaption",
]);
const ALLOWED_ATTRS = new Set(["class", "id", "style", "href", "src", "alt", "title", "target", "rel", "width", "height", "colspan", "rowspan", "loading"]);
const REMOVE_WITH_CONTENT = /<(script|style|iframe|object|embed|noscript|template|svg|math|form|textarea|select|button|frameset|frame)\b[\s\S]*?<\/\1\s*>/gi;
const REMOVE_SINGLE = /<\/?(script|style|iframe|object|embed|noscript|template|svg|math|form|textarea|select|button|input|link|meta|base|frameset|frame)\b[^>]*>/gi;

function safeUrl(value: string, isImage: boolean) {
  const v = value.trim().replace(/[\u0000-\u001F\s]+/g, "");
  if (/^(https?:|\/|#|\.\/|\.\.\/)/i.test(v)) return value.trim();
  if (!isImage && /^(mailto:|tel:)/i.test(v)) return value.trim();
  if (!/^[a-z][a-z0-9+.-]*:/i.test(v)) return value.trim(); // relative like "chart/gali"
  return null; // javascript:, data:, vbscript: …
}

function cleanAttrs(tag: string, raw: string) {
  const out: string[] = [];
  let hasBlank = false;
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const name = m[1].toLowerCase();
    if (!ALLOWED_ATTRS.has(name)) continue; // drops onclick, onerror, srcdoc, …
    let value = (m[2] || "").replace(/^["']|["']$/g, "");
    if (name === "href" || name === "src") {
      const safe = safeUrl(value, name === "src");
      if (safe === null) continue;
      value = safe;
    }
    if (name === "style" && /expression\s*\(|url\s*\(|javascript:|@import/i.test(value)) continue;
    if (name === "target" && value === "_blank") hasBlank = true;
    out.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
  }
  if (tag === "a" && hasBlank && !out.some((a) => a.startsWith("rel="))) out.push('rel="noopener noreferrer"');
  return out.length ? " " + out.join(" ") : "";
}

export function sanitizeSeoHtml(html: string) {
  return String(html || "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(REMOVE_WITH_CONTENT, "")
    .replace(REMOVE_SINGLE, "")
    .replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (_all, slash: string, name: string, attrs: string) => {
      const tag = name.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return ""; // unknown tag: keep its text, drop the tag
      if (slash) return `</${tag}>`;
      const selfClose = /\/\s*$/.test(attrs) || tag === "br" || tag === "hr" || tag === "img";
      return `<${tag}${cleanAttrs(tag, attrs.replace(/\/\s*$/, ""))}${selfClose ? " /" : ""}>`;
    });
}

const escapeText = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Content saved before HTML was allowed (plain text, "## " sub-headings) still works.
export function toSeoHtml(content: string) {
  const text = String(content || "").trim();
  if (!text) return "";
  if (/<[a-zA-Z][^>]*>/.test(text)) return sanitizeSeoHtml(text);
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => (p.startsWith("## ") ? `<h3>${escapeText(p.slice(3))}</h3>` : `<p>${escapeText(p).replace(/\n/g, "<br />")}</p>`))
    .join("\n");
}
