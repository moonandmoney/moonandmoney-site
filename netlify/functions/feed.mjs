/* ============================================================
   MOON & MONEY — Substack feed → on-site readings
   ------------------------------------------------------------
   Browsers can't read the Substack feed directly (CORS), so this
   tiny serverless function fetches it server-side and returns the
   FREE Friday readings as the same {h}/{p} block shape the on-site
   reader already renders. The home page therefore mirrors Substack
   the moment a reading goes live — never behind.

   Rules baked in:
     - The paid "✦ CRESCENT CLUB" deep-dives are NEVER returned, so
       members' content stays behind Substack's paywall.
     - Substack chrome (its audio embed, subscribe buttons, "thanks
       for reading" footers) is stripped — only the reading remains.
     - Posts with no real body (e.g. the default "welcome" note) are
       dropped.
   Endpoint: /.netlify/functions/feed  →  { posts: [...] }
   ============================================================ */

const FEED_URL = "https://moonandmoney.substack.com/feed";
const PAID = /crescent club/i;
const BOILER = /(thanks for reading|subscribe|leave a comment|share this post|^\s*share\s*$|pledge your support)/i;

function decode(s) {
  return String(s)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ").replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—").replace(/&ndash;/g, "–")
    .replace(/&amp;/g, "&"); // &amp; LAST, so it can't double-decode
}

function pick(block, tag) {
  const m = block.match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)</" + tag + ">", "i"));
  if (!m) return "";
  const v = m[1].trim();
  const cd = v.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return (cd ? cd[1] : v).trim();
}

function slugFrom(link) {
  const seg = String(link).split(/[?#]/)[0].split("/").filter(Boolean);
  return (seg[seg.length - 1] || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
}

function fmtDate(pub) {
  const d = new Date(pub);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone: "America/Edmonton",
  });
}

function toBlocks(html) {
  const out = [];
  const re = /<(h[1-6]|p|li)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[1].toLowerCase();
    const attrs = m[2] || "";
    if (/button-wrapper|subscri/i.test(attrs)) continue; // Substack CTA paragraphs
    const text = decode((m[3] || "").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
    if (!text || BOILER.test(text)) continue;
    if (tag[0] === "h") out.push({ h: text });
    else if (tag === "li") out.push({ p: "• " + text });
    else out.push({ p: text });
  }
  return out;
}

export function parseFeed(xml) {
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  const posts = [];
  for (const it of items) {
    const title = decode(pick(it, "title"));
    if (!title || PAID.test(title)) continue;       // never republish paid posts
    const free = toBlocks(pick(it, "content:encoded"));
    if (!free.length) continue;                       // skip welcome/empty notes
    const link = pick(it, "link") || pick(it, "guid");
    const pub = pick(it, "pubDate");
    const d = new Date(pub);
    posts.push({
      slug: slugFrom(link) || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      title,
      subtitle: decode(pick(it, "description")).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
      date: fmtDate(pub),
      pubISO: isNaN(d.getTime()) ? "" : d.toISOString(),
      substackUrl: link,
      free,
    });
  }
  posts.sort((a, b) => (b.pubISO || "").localeCompare(a.pubISO || "")); // newest first
  return posts;
}

export const handler = async () => {
  try {
    const res = await fetch(FEED_URL, {
      headers: { "User-Agent": "MoonAndMoney-site/1.0 (+https://moonandmoney.ca)" },
    });
    if (!res.ok) throw new Error("feed status " + res.status);
    const xml = await res.text();
    const posts = parseFeed(xml);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // Fresh within minutes of a Friday drop, cached at the CDN so the page
        // is instant and we stay gentle on Substack.
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Netlify-CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
      body: JSON.stringify({ posts, fetched: new Date().toISOString() }),
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
      body: JSON.stringify({ error: String((e && e.message) || e), posts: [] }),
    };
  }
};
