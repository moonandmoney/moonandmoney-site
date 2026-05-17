# Moon & Money — Home Base

A hand-coded, zero-dependency site. No build step. Open `index.html` to view locally,
or deploy the whole `site/` folder anywhere.

## Pages
| File | Purpose |
|---|---|
| `index.html` | Home — cinematic hero, ethos, featured products, live archive, Crescent Club |
| `shop.html` | The Atelier — full data-driven catalog with category filters |
| `archive.html` | Living Archive — auto-syncs the Substack feed |
| `about.html` | The Mythos — brand story + roadmap (Academy / Community / $LUNA token) |
| `courses.html` | The Academy — courses "coming soon" + early-access capture |

## How to deploy (free)
**Easiest — Netlify Drop:** go to https://app.netlify.com/drop and drag the `site` folder in. Live in ~20 seconds. Then point your domain at it.
**Or Vercel / Cloudflare Pages / GitHub Pages:** upload/push the `site` folder; no settings needed (pure static).

## How to maintain it (no code needed for most things)

**Add or edit a product** → open `assets/js/shop.js`, copy a line in the `CATALOG`
array, change the name/desc/price. Set `link:` to a Gumroad or Stripe Payment Link
or Etsy URL and the "Acquire" button takes buyers straight there. Until then it
shows a graceful "available on Etsy / join the Club" modal.

**The Archive updates itself** — every Friday Substack post appears automatically
on `index.html` and `archive.html`. Nothing to do.

**Wire real checkout later (recommended path):**
1. Create the product on **Gumroad** or a **Stripe Payment Link** (both give a URL).
2. Paste that URL into the matching product's `link:` field in `shop.js`.
3. That's it — instant working storefront.

## The surprise
Click/tap the moon on the home page. 🌙

## Brand assets
Originals live one level up in the project folder. Site copies are in
`assets/img/` and `assets/audio/`. Swap `wordmark.jpg` for a logo upgrade anytime.

## What's scaffolded for growth
- **Academy** (courses): page + early-access list ready; add modules like products.
- **Community** ("The Coven") and **$LUNA token**: presented on The Mythos as
  "coming soon" so the vision is visible without overpromising.
