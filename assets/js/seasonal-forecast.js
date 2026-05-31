/* ============================================================
   MOON & MONEY — Seasonal Forecast page
   ------------------------------------------------------------
   Pre-launch state until 2026-06-21 (the June Solstice).
   On launch day, the subscribe buttons activate. The one-off
   button stays active for the first 14 days of each season,
   then dims until the next equinox or solstice opens it again.

   The "notify me when orders open" email-capture form is always
   active. Posts to Netlify Forms (the site already collects
   form submissions there — no separate backend needed).
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
  annual:  '',   // $108/year — paste LS subscription checkout URL here
  one_off: '',   // $36 one-off — paste LS product checkout URL here
};

(function () {
  'use strict';

  // Launch moment: June 21, 2026 at sunrise (Edmonton time, ~11:00 UTC).
  // We compare against UTC because that's stable across browsers + timezones.
  // Close enough — a customer in Sydney who hits the page a few hours
  // "early" still sees the right thing for their actual local moment.
  const LAUNCH_AT_UTC = new Date('2026-06-21T11:00:00Z');

  // True equinox/solstice dates for 2026-2028, mirrored from the engine's
  // subscription.py _SEASON_TABLE. Used to decide whether the one-off
  // 14-day window is currently open. Extend when 2029 approaches.
  const SEASONS = [
    '2026-03-20', '2026-06-21', '2026-09-22', '2026-12-21',
    '2027-03-20', '2027-06-21', '2027-09-23', '2027-12-22',
    '2028-03-20', '2028-06-20', '2028-09-22', '2028-12-21',
  ];
  const ONE_OFF_WINDOW_DAYS = 14;

  function daysSince(isoDate, now) {
    return Math.floor((now - new Date(isoDate + 'T00:00:00Z')) / 86400000);
  }

  function isOneOffWindowOpen(now) {
    // The most recent season that's already passed, plus 14d
    let recent = null;
    for (let i = 0; i < SEASONS.length; i++) {
      if (new Date(SEASONS[i] + 'T00:00:00Z') <= now) recent = SEASONS[i];
      else break;
    }
    if (!recent) return false;
    return daysSince(recent, now) < ONE_OFF_WINDOW_DAYS;
  }

  function track(name, detail) {
    try { if (window.gtag) window.gtag('event', name, detail || {}); } catch (e) {}
  }

  // ── State: enable / disable subscribe CTAs based on launch + window ──
  function applyLaunchState() {
    const now = new Date();
    const launched = now >= LAUNCH_AT_UTC;
    const oneOffOpen = launched && isOneOffWindowOpen(now);

    const checkout = window.MM_SEASONAL_CHECKOUT || {};
    const annualBtn = document.querySelector('.sf-cta-annual');
    const oneOffBtn = document.querySelector('.sf-cta-oneoff');

    if (annualBtn) {
      if (launched && checkout.annual) {
        annualBtn.disabled = false;
        annualBtn.style.opacity = '';
        annualBtn.style.cursor = '';
        annualBtn.textContent = 'Subscribe · $108 / year';
        annualBtn.onclick = function () {
          track('seasonal_annual_click', {});
          window.location.href = checkout.annual;
        };
      } else if (launched && !checkout.annual) {
        annualBtn.textContent = 'Opening soon';
        annualBtn.title = 'Subscription checkout not yet wired';
      } else {
        annualBtn.textContent = 'Opens June 21';
      }
    }

    if (oneOffBtn) {
      if (oneOffOpen && checkout.one_off) {
        oneOffBtn.disabled = false;
        oneOffBtn.style.opacity = '';
        oneOffBtn.style.cursor = '';
        oneOffBtn.textContent = 'Buy this season · $36';
        oneOffBtn.onclick = function () {
          track('seasonal_oneoff_click', {});
          window.location.href = checkout.one_off;
        };
      } else if (oneOffOpen && !checkout.one_off) {
        oneOffBtn.textContent = 'Opening soon';
      } else if (launched) {
        // Past launch but outside the window for this season
        oneOffBtn.textContent = 'Window closed until next season';
      } else {
        oneOffBtn.textContent = 'Opens June 21';
      }
    }
  }

  // ── Notify-me email form ──
  function wireNotifyForm() {
    const form = document.getElementById('sfNotifyForm');
    const done = document.getElementById('sfNotifyDone');
    if (!form) return;

    function encode(data) {
      return Object.keys(data).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
      }).join('&');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // Honeypot
      const honey = form.querySelector('[name="bot-field"]');
      if (honey && honey.value) return;

      const fd = new FormData(form);
      const data = {};
      fd.forEach(function (v, k) { data[k] = v; });

      track('seasonal_notify_submit', { source: document.referrer || 'direct' });

      const reveal = function () {
        form.hidden = true;
        if (done) {
          done.hidden = false;
          done.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  document.addEventListener('DOMContentLoaded', function () {
    applyLaunchState();
    wireNotifyForm();
    track('seasonal_page_view', { source: document.referrer || 'direct' });
  });

  // Already-loaded case (script may run after DOMContentLoaded)
  if (document.readyState !== 'loading') {
    applyLaunchState();
    wireNotifyForm();
  }
})();
