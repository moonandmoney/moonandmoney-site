/* ============================================================
   MOON & MONEY — Seasonal Forecast page
   ------------------------------------------------------------
   Pre-launch state until 2026-06-21 (the June Solstice).
   On launch day, the intake form (#sfRequest) is revealed and
   the Annual / One-off card CTAs become tier-pickers that
   scroll to the form.

   Form submit captures the birth data, posts a backup record
   to Netlify Forms, then redirects to the matching Lemon
   Squeezy checkout URL with the birth data carried as
   checkout[custom][...] params. The engine reads those params
   on webhook receipt and seeds the subscriber row.

   The one-off button stays disabled outside the 14-day window
   after each equinox or solstice; the annual subscription
   stays available year-round once launched.

   The "notify me when orders open" email-capture form is
   always active pre-launch (no backend needed — posts to
   Netlify Forms).
   ============================================================ */

/* Lemon Squeezy checkout URLs for the two subscription products.
   These start empty so the buttons stay locked even past June 21
   if Laura hasn't created the LS products yet. Paste the URLs
   between the quotes the moment the LS subscription products
   are set up (LIVE mode, not test).

   The annual URL is a Lemon Squeezy SUBSCRIPTION product checkout.
   The one-off URL is a regular one-time product. Both should accept
   the same custom-data fields the engine reads (first_name,
   birth_date, birth_time, birth_time_known, city). */
window.MM_SEASONAL_CHECKOUT = {
  // $108/year public annual subscription
  annual:           'https://moonandmoney.lemonsqueezy.com/checkout/buy/e0b351f6-d984-4542-ac8c-1b2ddc9d645e',
  // $54/year Crescent Member version — used WITH a 100%-off perk code in year 1
  annual_crescent:  'https://moonandmoney.lemonsqueezy.com/checkout/buy/1e5f6640-709e-43e3-8dab-cf06e3d2ecc4',
  // $36 one-off per season. The page picks the right URL based on which
  // season's 14-day window is currently open. Each is its own LS product
  // so the customer's receipt names the season specifically.
  one_off: {
    spring: 'https://moonandmoney.lemonsqueezy.com/checkout/buy/03add570-31f9-4778-bcbd-c15315fdd8ec',
    summer: 'https://moonandmoney.lemonsqueezy.com/checkout/buy/b7bf55f8-546a-4852-b216-9bf4cb4c6014',
    autumn: 'https://moonandmoney.lemonsqueezy.com/checkout/buy/f58205cb-22a3-400c-a136-303cdfec8ee4',
    winter: 'https://moonandmoney.lemonsqueezy.com/checkout/buy/d99853ba-47d2-4cd2-9d57-360cb2f49efe',
  },
};

(function () {
  'use strict';

  // Launch moment: June 21, 2026 at sunrise (Edmonton time, ~11:00 UTC).
  // We compare against UTC because that's stable across browsers + timezones.
  // Close enough — a customer in Sydney who hits the page a few hours
  // "early" still sees the right thing for their actual local moment.
  const LAUNCH_AT_UTC = new Date('2026-06-21T11:00:00Z');

  // True equinox/solstice dates for 2026-2028, mirrored from the engine's
  // subscription.py _SEASON_TABLE. Each entry is [iso_date, season_label].
  // The label matches the keys in MM_SEASONAL_CHECKOUT.one_off so we can
  // look up the right one-off URL during that season's 14-day window.
  // Extend when 2029 approaches; keep in sync with the engine table.
  const SEASONS = [
    ['2026-03-20', 'spring'],
    ['2026-06-21', 'summer'],
    ['2026-09-22', 'autumn'],
    ['2026-12-21', 'winter'],
    ['2027-03-20', 'spring'],
    ['2027-06-21', 'summer'],
    ['2027-09-23', 'autumn'],
    ['2027-12-22', 'winter'],
    ['2028-03-20', 'spring'],
    ['2028-06-20', 'summer'],
    ['2028-09-22', 'autumn'],
    ['2028-12-21', 'winter'],
  ];
  const ONE_OFF_WINDOW_DAYS = 14;

  // Pretty-cased label for the current season, for button text.
  const SEASON_DISPLAY = {
    spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter',
  };

  // Tier display labels for the price-line under the submit button.
  const TIER_LABELS = {
    annual: { name: 'Annual practice', price: '$108 / year' },
    oneoff: { name: 'This season',     price: '$36' },
  };

  function daysSince(isoDate, now) {
    return Math.floor((now - new Date(isoDate + 'T00:00:00Z')) / 86400000);
  }

  function currentSeason(now) {
    // Returns [iso, label] of the most recent equinox/solstice that has
    // passed, or null if we're before the table's first entry.
    let recent = null;
    for (let i = 0; i < SEASONS.length; i++) {
      const entry = SEASONS[i];
      if (new Date(entry[0] + 'T00:00:00Z') <= now) recent = entry;
      else break;
    }
    return recent;
  }

  function nextSeason(now) {
    // Returns [iso, label] of the next upcoming equinox/solstice.
    for (let i = 0; i < SEASONS.length; i++) {
      const entry = SEASONS[i];
      if (new Date(entry[0] + 'T00:00:00Z') > now) return entry;
    }
    return null;
  }

  function isOneOffWindowOpen(now) {
    const cur = currentSeason(now);
    if (!cur) return false;
    return daysSince(cur[0], now) < ONE_OFF_WINDOW_DAYS;
  }

  function track(name, detail) {
    try { if (window.gtag) window.gtag('event', name, detail || {}); } catch (e) {}
  }

  // ── Intake form ────────────────────────────────────────────────────────
  // Lives in section #sfRequest. Hidden pre-launch. Mirrors the
  // money-chart intake pattern: tier picker → birth data + email →
  // Netlify Forms backup → redirect to LS with custom data.

  const form        = document.getElementById('sfForm');
  const tiersWrap   = document.getElementById('sfTiers');
  const tierField   = document.getElementById('sfTierField');
  const priceLine   = document.getElementById('sfPriceLine');
  const timeNote    = document.getElementById('sfTimeNote');
  const doneEl      = document.getElementById('sfDone');
  const sectionEl   = document.getElementById('sfRequest');
  let currentTier = 'annual';

  function updatePriceLine() {
    if (!priceLine) return;
    const cfg = TIER_LABELS[currentTier] || TIER_LABELS.annual;
    let oneOffSeason = '';
    if (currentTier === 'oneoff') {
      const cur = currentSeason(new Date());
      if (cur) oneOffSeason = ' · ' + SEASON_DISPLAY[cur[1]];
    }
    priceLine.textContent = cfg.name + oneOffSeason + ' · ' + cfg.price + ' · sent to your inbox';
  }

  function applyTier(t) {
    if (t !== 'annual' && t !== 'oneoff') t = 'annual';
    currentTier = t;
    if (tierField) tierField.value = t;
    if (tiersWrap) {
      const buttons = tiersWrap.querySelectorAll('.mc-tier');
      for (let i = 0; i < buttons.length; i++) {
        const b = buttons[i];
        const on = b.dataset.tier === t;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
    }
    updatePriceLine();
  }

  function scrollToForm() {
    if (!sectionEl) return;
    sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function encode(data) {
    return Object.keys(data).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
    }).join('&');
  }

  // Build the Lemon Squeezy checkout URL carrying the birth data as
  // custom data. LS passes checkout[custom][...] params through to the
  // subscription/order webhook (meta.custom_data), where the chart
  // engine reads them to seed the subscriber row. No birth time given
  // (the "I don't know" box) defaults to noon, matching the caveat
  // shown on the page.
  function buildCheckoutUrl(base, d, t) {
    const timeUnknown = (d.time_unknown === 'yes' || !d.birth_time);
    const birthTime = timeUnknown ? '12:00' : d.birth_time;
    const custom = {
      first_name:       d.first_name || '',
      birth_date:       d.birth_date || '',
      birth_time:       birthTime,
      birth_time_known: timeUnknown ? 'no' : 'yes',
      city:             d.city || '',
      tier:             t,
    };
    const parts = [];
    Object.keys(custom).forEach(function (k) {
      if (custom[k] !== '') parts.push('checkout[custom][' + k + ']=' + encodeURIComponent(custom[k]));
    });
    if (d.email) parts.push('checkout[email]=' + encodeURIComponent(d.email));
    return base + (base.indexOf('?') > -1 ? '&' : '?') + parts.join('&');
  }

  function tierCheckoutUrl(t) {
    const checkout = window.MM_SEASONAL_CHECKOUT || {};
    if (t === 'annual') return checkout.annual || '';
    if (t === 'oneoff') {
      const cur = currentSeason(new Date());
      if (!cur) return '';
      return (checkout.one_off && checkout.one_off[cur[1]]) || '';
    }
    return '';
  }

  function wireIntake() {
    if (!form) return;

    // Tier picker inside the form
    if (tiersWrap) {
      tiersWrap.addEventListener('click', function (e) {
        const b = e.target.closest('.mc-tier');
        if (!b) return;
        applyTier(b.dataset.tier);
        track('seasonal_intake_tier_selected', { tier: b.dataset.tier });
      });
    }

    // "I don't know my birth time" → disable time, show caveat
    form.addEventListener('change', function (e) {
      if (e.target.classList && e.target.classList.contains('mc-unknown')) {
        const fs = e.target.closest('.mc-person');
        const timeInput = fs ? fs.querySelector('input[type="time"]') : null;
        if (timeInput) {
          timeInput.disabled = e.target.checked;
          if (e.target.checked) timeInput.value = '';
        }
        if (timeNote) timeNote.hidden = !form.querySelector('.mc-unknown:checked');
      }
    });

    // Submit → Netlify Forms backup capture, then LS redirect.
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const honey = form.querySelector('[name="bot-field"]');
      if (honey && honey.value) return;

      const fd = new FormData(form);
      const data = {};
      fd.forEach(function (v, k) { data[k] = v; });

      const base = tierCheckoutUrl(currentTier);

      const finish = function () {
        if (base) {
          track('seasonal_checkout_opened', { tier: currentTier });
          window.location.href = buildCheckoutUrl(base, data, currentTier);
        } else {
          // No checkout URL for this tier yet (e.g. LS product not created
          // or one-off window closed mid-submit). Capture the intake and
          // show the confirmation note so the lead isn't lost.
          track('seasonal_request_received', { tier: currentTier });
          form.hidden = true;
          if (doneEl) {
            doneEl.hidden = false;
            doneEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      };

      // Backup record to Netlify Forms first; redirect regardless of result.
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(data),
      }).then(finish).catch(finish);
    });

    applyTier('annual');
  }

  // ── Launch state: enable cards + reveal the intake form ────────────────
  function applyLaunchState() {
    const now = new Date();
    const launched = now >= LAUNCH_AT_UTC;
    const oneOffOpen = launched && isOneOffWindowOpen(now);

    const checkout = window.MM_SEASONAL_CHECKOUT || {};
    const annualBtn = document.querySelector('.sf-cta-annual');
    const oneOffBtn = document.querySelector('.sf-cta-oneoff');

    // Reveal the intake form once launched.
    if (sectionEl) sectionEl.hidden = !launched;

    if (annualBtn) {
      if (launched && checkout.annual) {
        annualBtn.disabled = false;
        annualBtn.style.opacity = '';
        annualBtn.style.cursor = '';
        annualBtn.textContent = 'Subscribe · $108 / year';
        annualBtn.onclick = function () {
          track('seasonal_annual_card_click', {});
          applyTier('annual');
          scrollToForm();
        };
      } else if (launched && !checkout.annual) {
        annualBtn.textContent = 'Opening soon';
        annualBtn.title = 'Subscription checkout not yet wired';
      } else {
        annualBtn.textContent = 'Opens June 21';
      }
    }

    if (oneOffBtn) {
      const cur = currentSeason(now);
      const seasonLabel = cur ? cur[1] : null;
      const oneOffUrl = (checkout.one_off && seasonLabel)
        ? checkout.one_off[seasonLabel] : '';

      if (oneOffOpen && oneOffUrl) {
        oneOffBtn.disabled = false;
        oneOffBtn.style.opacity = '';
        oneOffBtn.style.cursor = '';
        oneOffBtn.textContent = 'Buy this ' + SEASON_DISPLAY[seasonLabel] + ' reading · $36';
        oneOffBtn.onclick = function () {
          track('seasonal_oneoff_card_click', { season: seasonLabel });
          applyTier('oneoff');
          scrollToForm();
        };
      } else if (oneOffOpen && !oneOffUrl) {
        oneOffBtn.textContent = 'Opening soon';
      } else if (launched) {
        // Past launch but outside the window for this season — point them
        // at the next opening
        const nxt = nextSeason(now);
        if (nxt) {
          const nxtMonth = new Date(nxt[0] + 'T00:00:00Z').toLocaleDateString(
            'en-US', { month: 'long', day: 'numeric' });
          oneOffBtn.textContent = 'Window opens ' + nxtMonth;
        } else {
          oneOffBtn.textContent = 'Window closed until next season';
        }
      } else {
        oneOffBtn.textContent = 'Opens June 21';
      }
    }
  }

  // ── Notify-me email form (pre-launch only) ─────────────────────────────
  function wireNotifyForm() {
    const nf = document.getElementById('sfNotifyForm');
    const nfDone = document.getElementById('sfNotifyDone');
    if (!nf) return;

    nf.addEventListener('submit', function (e) {
      e.preventDefault();
      const honey = nf.querySelector('[name="bot-field"]');
      if (honey && honey.value) return;

      const fd = new FormData(nf);
      const data = {};
      fd.forEach(function (v, k) { data[k] = v; });

      track('seasonal_notify_submit', { source: document.referrer || 'direct' });

      const reveal = function () {
        nf.hidden = true;
        if (nfDone) {
          nfDone.hidden = false;
          nfDone.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(data),
      }).then(reveal).catch(reveal);
    });
  }

  // ── Boot ──
  function boot() {
    wireIntake();
    applyLaunchState();
    wireNotifyForm();
    track('seasonal_page_view', { source: document.referrer || 'direct' });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
