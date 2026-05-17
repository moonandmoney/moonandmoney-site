# Turning the Shop Live — Lemon Squeezy (≈15 min, one time)

The site is already wired. To start selling you only edit ONE file:
`assets/js/config.js`. No code knowledge needed.

## Why Lemon Squeezy
It is the **merchant of record** — it collects payment, charges the
correct sales tax / VAT worldwide, delivers the PDF automatically, and
sends you a payout. You don't touch tax compliance. Fee ≈ 5% + 50¢.

## Steps

1. Go to **lemonsqueezy.com** → sign up → create your store
   (name it "Moon & Money").
2. **Settings → Stores** → fill in payout (bank) details so you get paid.
3. For each product:
   - **Products → + New Product**
   - Name it exactly as it appears on the site
     (e.g. `Aries Moon Money Guide`)
   - Upload the real PDF (from `MoonAndMoney_Etsy_FINAL/`)
   - Set the **price** (this is where pricing lives — nothing shows on
     the site until a link is added here)
   - Save → open the product → **Share** → copy the **checkout URL**
4. Open `site/assets/js/config.js`. Paste each URL between the quotes
   next to the matching name:
   ```js
   "Aries Moon Money Guide": "https://moonandmoney.lemonsqueezy.com/checkout/buy/xxxx",
   ```
5. Save the file, re-deploy (or re-drag to Netlify). Done — that product
   now opens a real checkout, in an elegant overlay, right on the site.

## Good to know
- Leave a URL as `""` and that product still shows its watermarked
  preview with no price — perfect for staggering launches.
- The overlay checkout (`lemon.js`) is already loaded on the shop page;
  no extra setup.
- Same flow works for the **Sessions** and **Academy** offerings later —
  just add their names to `config.js`.
- Want a different processor someday? Only `config.js` changes; the rest
  of the site stays exactly as is.
