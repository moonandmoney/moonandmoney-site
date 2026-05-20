/* ============================================================
   MOON & MONEY — Money Chart request page
   No backend required. The intake is captured by Netlify Forms
   (already your host). When you have a Stripe Payment Link or
   Lemon Squeezy checkout per tier, paste it below and the
   request will route there after the details are captured.
   ============================================================ */
window.MM_CHART_CHECKOUT = {
  individual: '',   // e.g. 'https://moonandmoney.lemonsqueezy.com/buy/xxx'
  pairs:      ''    // Lemon Squeezy checkout for the Pairs tier
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
    if (b) { applyTier(b.dataset.tier); track('money_chart_tier_selected', { tier: b.dataset.tier }); }
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

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (form.querySelector('[name="bot-field"]').value) return; // honeypot
    const fd = new FormData(form);
    const data = {};
    fd.forEach((v, k) => { data[k] = v; });

    const finish = () => {
      track('money_chart_purchase_completed', { tier: tier });
      form.hidden = true;
      doneEl.hidden = false;
      doneEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const url = (window.MM_CHART_CHECKOUT || {})[tier];
      if (url) setTimeout(() => window.open(url, '_blank', 'noopener'), 600);
    };

    // Netlify Forms capture (works on the live host; harmless elsewhere)
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode(data)
    }).then(finish).catch(finish);
  });
})();
