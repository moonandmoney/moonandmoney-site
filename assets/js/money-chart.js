/* ============================================================
   MOON & MONEY — Money Chart request page
   No backend required. The intake is captured by Netlify Forms
   (already your host). When you have a Stripe Payment Link or
   Lemon Squeezy checkout per tier, paste it below and the
   request will route there after the details are captured.
   ============================================================ */
window.MM_CHART_CHECKOUT = {
  individual: 'https://moonandmoney.lemonsqueezy.com/checkout/buy/bf4cc0ae-3e66-4914-a278-d1053b9b4733',
  pairs:      'https://moonandmoney.lemonsqueezy.com/checkout/buy/a1aac914-e089-414a-a576-ddee6d623185'
};

(function () {
  'use strict';
  const TIERS = {
    individual: { label: 'Individual chart', price: '$55', people: 1 },
    pairs:      { label: 'Pairs reading',    price: '$77', people: 2 }
  };
  const form = document.getElementById('mcForm');
  if (!form) return;

  const tiersWrap = document.getElementById('mcTiers');
  const tierField = document.getElementById('mcTierField');
  const priceLine = document.getElementById('mcPriceLine');
  const people    = Array.prototype.slice.call(document.querySelectorAll('.mc-person'));
  const timeNote  = document.getElementById('mcTimeNote');
  const doneEl    = document.getElementById('mcDone');
  let tier = 'individual';

  function track(name, detail) {
    try { if (window.gtag) window.gtag('event', name, detail || {}); } catch (e) {}
  }

  function applyTier(t) {
    tier = t;
    tierField.value = t;
    const cfg = TIERS[t];
    tiersWrap.querySelectorAll('.mc-tier').forEach(b => {
      const on = b.dataset.tier === t;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    people.forEach((fs, i) => {
      const show = i < cfg.people;
      fs.hidden = !show;
      fs.querySelectorAll('input').forEach(inp => {
        if (i === 0) return; // first set always required where marked
        if (inp.type === 'checkbox') return;
        inp.required = show && (inp.name.indexOf('_first') > -1 || inp.name.indexOf('_birthdate') > -1 || inp.name.indexOf('_location') > -1);
      });
    });
    priceLine.textContent = cfg.label + ' · ' + cfg.price + ' · sent to your inbox';
  }

  tiersWrap.addEventListener('click', e => {
    const b = e.target.closest('.mc-tier');
    if (!b) return;
    applyTier(b.dataset.tier);
    track('money_chart_tier_selected', { tier: b.dataset.tier });
    // The tier buttons aren't the conversion — the intake form below is.
    // Smooth-scroll the form into view immediately so the next step is
    // unmistakable, instead of leaving the user staring at the buttons
    // wondering whether anything just happened.
    const target = document.getElementById('mcRequest');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  applyTier('individual');
  track('money_chart_intake_started', { source: document.referrer || 'direct' });

  // "I don't know my birth time" → disable time, show caveat
  form.addEventListener('change', e => {
    if (e.target.classList && e.target.classList.contains('mc-unknown')) {
      const fs = e.target.closest('.mc-person');
      const timeInput = fs.querySelector('input[type="time"]');
      timeInput.disabled = e.target.checked;
      if (e.target.checked) timeInput.value = '';
      timeNote.hidden = !form.querySelector('.mc-unknown:checked');
    }
  });

  function encode(data) {
    return Object.keys(data).map(k =>
      encodeURIComponent(k) + '=' + encodeURIComponent(data[k])).join('&');
  }

  // Build the Lemon Squeezy checkout URL carrying the birth data as
  // custom data. LS passes checkout[custom][...] params through to the
  // order webhook (meta.custom_data), where the chart engine reads them
  // to generate the reading. Person 1 only for the Individual tier;
  // the email prefills the checkout. No birth time given (the "I don't
  // know" box) defaults to noon, matching the caveat shown on the page.
  function buildCheckoutUrl(base, d, t) {
    var timeUnknown = (d.p1_time_unknown === 'yes' || !d.p1_birthtime);
    var birthTime = timeUnknown ? '12:00' : d.p1_birthtime;
    var custom = {
      first_name: d.p1_first || '',
      birth_date: d.p1_birthdate || '',
      birth_time: birthTime,
      birth_time_known: timeUnknown ? 'no' : 'yes',
      city:       d.p1_location || '',
      tier:       t
    };
    // Pairs ($77): carry the second person too, so the engine can build the
    // couples reading. Keys match what the chart engine reads (partner_*).
    if (t === 'pairs') {
      var p2Unknown = (d.p2_time_unknown === 'yes' || !d.p2_birthtime);
      custom.partner_first_name      = d.p2_first || '';
      custom.partner_birth_date      = d.p2_birthdate || '';
      custom.partner_birth_time      = p2Unknown ? '12:00' : d.p2_birthtime;
      custom.partner_birth_time_known = p2Unknown ? 'no' : 'yes';
      custom.partner_city            = d.p2_location || '';
    }
    var parts = [];
    Object.keys(custom).forEach(function (k) {
      if (custom[k] !== '') parts.push('checkout[custom][' + k + ']=' + encodeURIComponent(custom[k]));
    });
    if (d.email) parts.push('checkout[email]=' + encodeURIComponent(d.email));
    return base + (base.indexOf('?') > -1 ? '&' : '?') + parts.join('&');
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (form.querySelector('[name="bot-field"]').value) return; // honeypot
    const fd = new FormData(form);
    const data = {};
    fd.forEach((v, k) => { data[k] = v; });

    const base = (window.MM_CHART_CHECKOUT || {})[tier];

    const finish = () => {
      if (base) {
        // Hand off to Lemon Squeezy checkout with the birth data attached.
        // Same-tab redirect (not window.open) so popup blockers can't
        // swallow it after the async capture.
        track('money_chart_checkout_opened', { tier: tier });
        window.location.href = buildCheckoutUrl(base, data, tier);
      } else {
        // No checkout wired for this tier yet (e.g. Pairs pre-launch):
        // capture the lead and show the confirmation note.
        track('money_chart_request_received', { tier: tier });
        form.hidden = true;
        doneEl.hidden = false;
        doneEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // Netlify Forms capture first (a backup record of every intake, even
    // if they bail at checkout), then hand off.
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode(data)
    }).then(finish).catch(finish);
  });
})();
