/* ============================================================
   MOON & MONEY — checkout configuration
   ------------------------------------------------------------
   This is the ONLY file you touch to turn the shop "live".
   For each product, paste its Lemon Squeezy checkout URL
   between the quotes. Empty "" = shows the elegant preview
   (no price, no checkout) until you're ready.

   All URLs below are LIVE-MODE (not test). Updated 2026-05-26
   when the LS catalogue was migrated from test to live.
   ============================================================ */
window.MM_CHECKOUT = {
  // ---- Moon Sign Money Guides ----
  "Aries Moon Money Guide":       "https://moonandmoney.lemonsqueezy.com/checkout/buy/7aca3593-4e60-43e1-b636-6330c978face",
  "Taurus Moon Money Guide":      "https://moonandmoney.lemonsqueezy.com/checkout/buy/fd88269b-0dbb-4108-81b4-a8bfbae4387e",
  "Gemini Moon Money Guide":      "https://moonandmoney.lemonsqueezy.com/checkout/buy/50f7a769-2487-4729-ad9d-b0adba659848",
  "Cancer Moon Money Guide":      "https://moonandmoney.lemonsqueezy.com/checkout/buy/7599c4a5-af0d-4251-87a6-b1bca3751b89",
  "Leo Moon Money Guide":         "https://moonandmoney.lemonsqueezy.com/checkout/buy/f7d0dae9-2376-4d5c-a24a-c9ebdf689e80",
  "Virgo Moon Money Guide":       "https://moonandmoney.lemonsqueezy.com/checkout/buy/bc5c1859-b090-4251-accb-aa7d296e5ee4",
  "Libra Moon Money Guide":       "https://moonandmoney.lemonsqueezy.com/checkout/buy/a69142d9-f0cc-4342-b21d-43c31a29c44a",
  "Scorpio Moon Money Guide":     "https://moonandmoney.lemonsqueezy.com/checkout/buy/10aaf01b-d88e-4d7d-bb9f-f33f573b5ad0",
  "Sagittarius Moon Money Guide": "https://moonandmoney.lemonsqueezy.com/checkout/buy/8a3be7b7-0bb8-467c-bc4c-9e5b4e04459c",
  "Capricorn Moon Money Guide":   "https://moonandmoney.lemonsqueezy.com/checkout/buy/c063623b-e7dd-4d12-a204-52756b3ab0a4",
  "Aquarius Moon Money Guide":    "https://moonandmoney.lemonsqueezy.com/checkout/buy/ebecae2d-1ebf-4804-b3ea-d4e3f0515b5a",
  "Pisces Moon Money Guide":      "https://moonandmoney.lemonsqueezy.com/checkout/buy/c7a59df4-64f5-4b37-944c-61f8572b4eb6",

  // ---- Element Collections ----
  "Fire Signs Money Collection":  "https://moonandmoney.lemonsqueezy.com/checkout/buy/79c698d0-0e0d-4b80-a147-a31bdb2b01f1",
  "Earth Signs Money Collection": "https://moonandmoney.lemonsqueezy.com/checkout/buy/a2555083-a0a9-482c-a308-06816bd3e911",
  "Air Signs Money Collection":   "https://moonandmoney.lemonsqueezy.com/checkout/buy/7aa50bd2-50c0-4ad9-9df2-115566916dda",
  "Water Signs Money Collection": "https://moonandmoney.lemonsqueezy.com/checkout/buy/8a353e51-a1a6-480e-bc32-10acbe135d3c",

  // ---- Library ----
  "The Complete Lunar Collection": "https://moonandmoney.lemonsqueezy.com/checkout/buy/8bc8768a-e818-41ef-b840-c07b553a2b5f",
  "The Premium Lunar Money Guide": "https://moonandmoney.lemonsqueezy.com/checkout/buy/bcdfbbba-aac5-4ce2-8e6a-0cf8c6eb0762",

  // ---- Calendar ----
  "Lunar Money Calendar 2026":    "https://moonandmoney.lemonsqueezy.com/checkout/buy/414e1146-5686-43a9-86c3-6ea290d5a57b",

  // ---- Cards ---- (no LS products yet — these stay as previews)
  "Saturn Return Card": "",
  "Mercury Retrograde Card": "",
  "New Year Moon Card": "",
  "New Baby Card": "",
  "Leo Birthday Card": "",
  "Taurus Birthday Card": "",
  "Capricorn Congratulations Card": "",
  "Scorpio New Chapter Card": "",

  // ---- Atelier Notes (free pieces, kept quiet at the tail) ----
  "Moon & Money Glyphs":          "https://moonandmoney.lemonsqueezy.com/checkout/buy/a4619c2a-4184-4d4e-805b-ce4d8c1ef9c1"
};

/* ============================================================
   PRICES — displayed on the homepage + shop cards so visitors
   know what something costs before they click. Strings (not
   numbers) so we can render "Free" cleanly alongside dollar
   amounts, and so we don't accidentally format currency wrong.
   The actual transactional price still lives in Lemon Squeezy;
   this is the display label. Keep them in sync.
   ============================================================ */
window.MM_PRICES = {
  // Moon Sign Money Guides — $3.99 each
  "Aries Moon Money Guide":       "$3.99",
  "Taurus Moon Money Guide":      "$3.99",
  "Gemini Moon Money Guide":      "$3.99",
  "Cancer Moon Money Guide":      "$3.99",
  "Leo Moon Money Guide":         "$3.99",
  "Virgo Moon Money Guide":       "$3.99",
  "Libra Moon Money Guide":       "$3.99",
  "Scorpio Moon Money Guide":     "$3.99",
  "Sagittarius Moon Money Guide": "$3.99",
  "Capricorn Moon Money Guide":   "$3.99",
  "Aquarius Moon Money Guide":    "$3.99",
  "Pisces Moon Money Guide":      "$3.99",

  // Element Collections — $6.99 each (a bundle of 3 guides, save $5)
  "Fire Signs Money Collection":  "$6.99",
  "Earth Signs Money Collection": "$6.99",
  "Air Signs Money Collection":   "$6.99",
  "Water Signs Money Collection": "$6.99",

  // Library
  "The Complete Lunar Collection": "$11.11",
  "The Premium Lunar Money Guide": "$17.77",

  // Calendar
  "Lunar Money Calendar 2026":    "Free",

  // Cards — no LS product yet, stay as "preview only" with no price label
  "Saturn Return Card":             "",
  "Mercury Retrograde Card":        "",
  "New Year Moon Card":             "",
  "New Baby Card":                  "",
  "Leo Birthday Card":              "",
  "Taurus Birthday Card":           "",
  "Capricorn Congratulations Card": "",
  "Scorpio New Chapter Card":       "",

  // Atelier Notes
  "Moon & Money Glyphs":          "Free",
};
