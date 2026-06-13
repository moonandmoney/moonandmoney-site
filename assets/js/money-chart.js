/* ============================================================
   MOON & MONEY — Money Chart request page
   No backend required. The intake is captured by Netlify Forms
   (already your host). When you have a Stripe Payment Link or
   Lemon Squeezy checkout per tier, paste it below and the
   request will route there after the details are captured.
   ============================================================ */
window.MM_CHART_CHECKOUT = {
  // LIVE-mode checkout URLs. Both replaced 2026-05-26 with the live
  // catalogue UUIDs once owner migrated from test mode.
  // Old test UUIDs (kept for ref):
  //   bf4cc0ae-3e66-4914-a278-d1053b9b4733 (Individual)
  //   a1aac914-e089-414a-a576-ddee6d623185 (Pairs)
  individual: 'https://moonandmoney.lemonsqueezy.com/checkout/buy/2092d32c-3d0b-4cbc-8705-737d0b5ada7f',
  pairs:      'https://moonandmoney.lemonsqueezy.com/checkout/buy/58832008-a970-4ebe-891b-01f38d0440ff'
};

(function () {
  'use strict';
  const TIERS = {
    individual: { label: 'Individual chart', price: '$55', people: 1 },
    pairs:      { label: 'Pairs reading',    price: '$77', people: 2 }
  };
  const form = document.getElementById('mcForm');
  if (!form) return;

  const tiersWrap   = document.getElementById('mcTiers');
  const tierField   = document.getElementById('mcTierField');
  const priceLine   = document.getElementById('mcPriceLine');
  const people      = Array.prototype.slice.call(document.querySelectorAll('.mc-person'));
  const timeNote    = document.getElementById('mcTimeNote');
  const doneEl      = document.getElementById('mcDone');
  const giftToggle  = document.getElementById('mcGiftToggle');
  const giftNote    = document.getElementById('mcGiftNote');
  const recipLabel  = document.getElementById('mcRecipientLabel');
  const gifterLabel = document.getElementById('mcGifterLabel');
  const gifterEmail = document.getElementById('mcGifterEmail');
  let tier = 'individual';

  // Captured so the recipient-email label can flip wording when the gift
  // toggle flips, without rewriting the whole <label> element.
  const RECIP_NORMAL = 'Email (where the chart is delivered)';
  const RECIP_GIFT   = 'Their email (where the reading will land)';

  function track(name, detail) {
    try { if (window.gtag) window.gtag('event', name, detail || {}); } catch (e) {}
  }

  function updatePriceLine() {
    const cfg = TIERS[tier];
    if (giftToggle && giftToggle.checked) {
      const fd = new FormData(form);
      const rn = (fd.get('p1_first') || '').trim();
      const re = (fd.get('email') || '').trim();
      if (rn && re) {
        priceLine.textContent = cfg.label + ' · ' + cfg.price + ' · ' + rn + "'s reading, sent to " + re;
      } else if (rn) {
        priceLine.textContent = cfg.label + ' · ' + cfg.price + ' · ' + rn + "'s reading, sent to their inbox";
      } else {
        priceLine.textContent = cfg.label + ' · ' + cfg.price + ' · sent to their inbox';
      }
    } else {
      priceLine.textContent = cfg.label + ' · ' + cfg.price + ' · sent to your inbox';
    }
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
    updatePriceLine();
  }

  function applyGiftMode() {
    if (!giftToggle) return;
    const on = giftToggle.checked;
    // The label's first text node holds the visible string; swap it without
    // disturbing the <input> child (preserves event bindings + DOM identity).
    if (recipLabel && recipLabel.firstChild) {
      recipLabel.firstChild.nodeValue = on ? RECIP_GIFT : RECIP_NORMAL;
    }
    if (gifterLabel) gifterLabel.hidden = !on;
    if (gifterEmail) gifterEmail.required = on;
    if (giftNote) giftNote.hidden = !on;
    updatePriceLine();
    track('money_chart_gift_toggled', { on: on });
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

  if (giftToggle) {
    giftToggle.addEventListener('change', applyGiftMode);
  }

  // Reactive priceline: as the recipient first name + email get typed, the
  // priceline reflects what the gifter is buying ("Amelia's reading, sent
  // to amelia@..."). Clarity at the moment of confirming the gift.
  form.addEventListener('input', e => {
    if (!giftToggle || !giftToggle.checked) return;
    const n = e.target && e.target.name;
    if (n === 'p1_first' || n === 'email') updatePriceLine();
  });

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

    // Gift routing. The chart is for the RECIPIENT (whose data is in p1_*
    // and p2_*), but the GIFTER pays. So we point checkout[email] at the
    // gifter — LS bills + receipts go to them, recipient never sees a
    // price tag — and we carry the recipient email + is_gift flag through
    // custom_data so the engine knows where to deliver the chart and to
    // fire the gifter confirmation + recipient follow-up.
    var isGift = d.is_gift === 'yes' && (d.gifter_email || '').trim() !== '';
    var checkoutEmail;
    if (isGift) {
      checkoutEmail = (d.gifter_email || '').trim();
      custom.is_gift         = 'yes';
      custom.gifter_email    = checkoutEmail;
      custom.recipient_email = (d.email || '').trim();
    } else {
      checkoutEmail = d.email || '';
    }

    var parts = [];
    Object.keys(custom).forEach(function (k) {
      if (custom[k] !== '') parts.push('checkout[custom][' + k + ']=' + encodeURIComponent(custom[k]));
    });
    if (checkoutEmail) parts.push('checkout[email]=' + encodeURIComponent(checkoutEmail));
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
        track('money_chart_checkout_opened', { tier: tier, is_gift: data.is_gift === 'yes' });
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


/* ============================================================
   Money Chart — cinematic motion (subtle, considered).
   Three layered touches that supplement the global .reveal
   fade-in main.js already handles, never override it:

     1. Hero cover parallax — the moon-cover preview drifts
        upward at ~12% scroll speed for the first viewport.
        Adds depth as the visitor scrolls into the offer.
     2. Soul Signature glow build — when the signature image
        scrolls into view, its gold halo box-shadow builds
        from 0 to full over ~1.4s. The image stays still; the
        sky around it brightens like a stamp settling.
     3. Bridge CTAs cascade — when the new "your chart is the
        map" bridge section enters view, the three buttons
        rise in tight sequence after the headline lands.

   Targets transform-OR-box-shadow-OR-opacity properties that
   don't collide with main.js's global reveal (which sets
   opacity + translateY on .reveal once). Gated on
   GSAP+ScrollTrigger availability; skipped on prefers-reduced-
   motion so the experience stays calm for sensory users.
   ============================================================ */
(function mcCinematic () {
  'use strict';
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  // ── 1. Hero cover parallax ──────────────────────────────────
  const cover = document.querySelector('.mc-cover');
  if (cover) {
    gsap.to(cover, {
      y: -42, ease: 'none',
      scrollTrigger: {
        trigger: '.mc-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
      }
    });
  }

  // ── 2. Soul Signature glow build ────────────────────────────
  const sigImg = document.querySelector('.mc-soul img[alt*="signature"]');
  if (sigImg) {
    // Initial state: shadow muted. Build to the full deep + gold halo.
    gsap.set(sigImg, {
      boxShadow: '0 12px 30px -18px rgba(0,0,0,.45), 0 0 0 rgba(229,199,123,0)',
    });
    gsap.to(sigImg, {
      boxShadow: '0 26px 64px -26px rgba(0,0,0,.75), 0 0 60px rgba(229,199,123,.25)',
      duration: 1.4,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.mc-soul',
        start: 'top 78%',
        once: true,
      }
    });
  }

  // ── 3. Bridge CTAs cascade ──────────────────────────────────
  const bridgeBtns = document.querySelectorAll('.mc-bridge .btn');
  if (bridgeBtns.length) {
    gsap.set(bridgeBtns, { y: 18, opacity: 0 });
    gsap.to(bridgeBtns, {
      y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
      stagger: 0.14,
      delay: 0.18,           // lands just after the bridge headline reveal
      scrollTrigger: {
        trigger: '.mc-bridge',
        start: 'top 72%',
        once: true,
      }
    });
  }
})();
