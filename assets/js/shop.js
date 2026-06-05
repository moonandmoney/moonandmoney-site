/* ============================================================
   MOON & MONEY — catalog (edit this array to add products)
   `glyph` draws our house sigil. `link` (when set to a Gumroad
   / Stripe Payment Link / Etsy URL) makes the button purchase.
   Prices are intentionally hidden until pricing is finalized —
   add a `price` and re-enable in the card template when ready.
   ============================================================ */
const CATALOG = [
  // ---- Moon Sign Money Guides ----
  ...[
    ['Aries','Fire in the account. Income aligned to the boldest money nature in the zodiac.'],
    ['Taurus','The most money-aligned moon, mapped to your nature. Wealth built to last.'],
    ['Gemini','Many streams, one strategy. Diversified income for the Gemini Moon.'],
    ['Cancer','Security as a feeling. The instinct for safety, shaped into a fortress fund.'],
    ['Leo','Wealth with presence. Earn, hold and give like the Leo Moon you are.'],
    ['Virgo','The art of the system. A precise money method tuned to the Virgo Moon.'],
    ['Libra','Balance the books and the soul. Money decisions in true equilibrium.'],
    ['Scorpio','Power, depth, regeneration. Leverage and renewal for the Scorpio Moon.'],
    ['Sagittarius','Abundance without limits. Expansion, considered, for the Sagittarius Moon.'],
    ['Capricorn','The long game, mastered. Legacy wealth for the Capricorn Moon.'],
    ['Aquarius','Money, reconsidered. An unconventional path for the Aquarius Moon.'],
    ['Pisces','Intuition into income. Vision made tangible for the Pisces Moon.']
  ].map(([s, d]) => ({
    cat: 'Moon Sign Guides', tag: 'guides', glyph: s,
    name: `${s} Moon Money Guide`, desc: d, link: '',
    prev: s.toLowerCase() + '.png'
  })),

  // ---- Element Collections ----
  { cat:'Collections', glyph:'fire',  name:'Fire Signs Money Collection',  desc:'Aries · Leo · Sagittarius. Three guides for the bold-money natures.', link:'', prev:'fire.png' },
  { cat:'Collections', glyph:'earth', name:'Earth Signs Money Collection', desc:'Taurus · Virgo · Capricorn. For those who build to last.', link:'', prev:'earth.png' },
  { cat:'Collections', glyph:'air',   name:'Air Signs Money Collection',   desc:'Gemini · Libra · Aquarius. Strategy for the considered mind.', link:'', prev:'air.png' },
  { cat:'Collections', glyph:'water', name:'Water Signs Money Collection', desc:'Cancer · Scorpio · Pisces. Intuitive wealth for the deep feelers.', link:'', prev:'water.png' },

  // ---- Library ----
  { cat:'Library', glyph:'moon', name:'The Complete Lunar Collection', desc:'All twelve Moon Sign Money Guides, gathered in one luminous library. The whole zodiac.', link:'', badge:'Complete', prev:'complete.png' },
  { cat:'Library', glyph:'star', name:'The Premium Lunar Money Guide', desc:'The flagship. The full premium moon document. Your money architecture, read in depth.', link:'', badge:'Premium', prev:'premium.png' },

  // ---- Calendar ----
  { cat:'Calendar', glyph:'calendar', name:'Lunar Money Calendar 2026', desc:'Every moon phase of the year, paired with the money move it favours. Your year, timed to the sky.', link:'', badge:'2026', prev:'calendar.png' },

  // ---- Cards (Birthdays) ----
  { cat:'Cards', glyph:'Aries',       name:'Aries Birthday Card',        desc:'For the Aries, returning to their first spark. A little fire for the year ahead.',         link:'', prev:'card-aries.png' },
  { cat:'Cards', glyph:'Taurus',      name:'Taurus Birthday Card',       desc:'Grounded, luxe and a little indulgent, like the Taurus it is for.',                       link:'', prev:'card-taurus.png' },
  { cat:'Cards', glyph:'Gemini',      name:'Gemini Birthday Card',       desc:'For the Gemini, on their year of stories. The air shifts; the conversations begin.',     link:'', prev:'card-gemini.png' },
  { cat:'Cards', glyph:'Cancer',      name:'Cancer Birthday Card',       desc:'For the Cancer, when the moon comes home to their sky.',                                 link:'', prev:'card-cancer.png' },
  { cat:'Cards', glyph:'Leo',         name:'Leo Birthday Card',          desc:'For the Leo, on their solar return.',                                                    link:'', prev:'card-leo.png' },
  { cat:'Cards', glyph:'Virgo',       name:'Virgo Birthday Card',        desc:'For the Virgo, in the year their careful eye turns toward what comes next.',             link:'', prev:'card-virgo.png' },
  { cat:'Cards', glyph:'Libra',       name:'Libra Birthday Card',        desc:'For the Libra, when the scales arrive at balance.',                                      link:'', prev:'card-libra.png' },
  { cat:'Cards', glyph:'Scorpio',     name:'Scorpio Birthday Card',      desc:'For the Scorpio, on the year the depths turn over again.',                               link:'', prev:'card-scorpio-bday.png' },
  { cat:'Cards', glyph:'Sagittarius', name:'Sagittarius Birthday Card',  desc:'For the Sagittarius, when the arrow lifts for its next aim.',                            link:'', prev:'card-sagittarius.png' },
  { cat:'Cards', glyph:'Capricorn',   name:'Capricorn Birthday Card',    desc:'For the Capricorn, as the climb resumes from a new step.',                               link:'', prev:'card-capricorn-bday.png' },
  { cat:'Cards', glyph:'Aquarius',    name:'Aquarius Birthday Card',     desc:'For the Aquarius, on the year the future moves toward them.',                            link:'', prev:'card-aquarius.png' },
  { cat:'Cards', glyph:'Pisces',      name:'Pisces Birthday Card',       desc:'For the Pisces, when the tide returns to its own shore.',                                link:'', prev:'card-pisces.png' },

  // ---- Cards (Occasions) ----
  { cat:'Cards', glyph:'Capricorn',   name:'Saturn Return Card',         desc:'For the friend crossing the great threshold. Quiet, considered encouragement.',         link:'', prev:'card-saturn.png' },
  { cat:'Cards', glyph:'Gemini',      name:'Mercury Retrograde Card',    desc:'A knowing card for the astrologically literate. Send it before the static.',            link:'', prev:'card-mercury.png' },
  { cat:'Cards', glyph:'moon',        name:'New Year Moon Card',         desc:'Begin the year by the moon, not only the calendar.',                                    link:'', prev:'card-newyear.png' },
  { cat:'Cards', glyph:'Capricorn',   name:'Capricorn Congratulations Card', desc:'For the Capricorn who, of course, achieved the thing.',                            link:'', prev:'card-capricorn.png' },
  { cat:'Cards', glyph:'Scorpio',     name:'Scorpio New Chapter Card',   desc:'Renewal, not ruin. A bold card for a powerful new beginning.',                          link:'', prev:'card-scorpio.png' },
  { cat:'Cards', glyph:'Venus',       name:'Venus Anniversary Card',     desc:'For the love that keeps choosing itself. An anniversary card with weight.',             link:'', prev:'card-anniversary.png' },
  { cat:'Cards', glyph:'Libra',       name:'Libra Engagement Card',      desc:'For the partnership made official. Considered, generous, on-brand for the moment.',     link:'', prev:'card-engagement.png' },
  { cat:'Cards', glyph:'Virgo',       name:'Virgo Get Well Card',        desc:'For the careful repair, in its own time. Without pressure, with care.',                  link:'', prev:'card-getwell.png' },
  { cat:'Cards', glyph:'Sun',         name:'Sun Graduation Card',        desc:'For the work made visible at last. A graduation card with real weight.',                link:'', prev:'card-graduation.png' },
  { cat:'Cards', glyph:'Cancer',      name:'Cancer New Baby Card',       desc:'A new little moon arriving. Welcome the new arrival with a considered, celestial note.', link:'', prev:'card-baby.png' },
  { cat:'Cards', glyph:'Cancer',      name:'Cancer New Home Card',       desc:'The threshold crossed, the door closed quietly. A housewarming card from the moon.',    link:'', prev:'card-newhome.png' },
  { cat:'Cards', glyph:'moon',        name:'Wedding Moon Card',          desc:'The vow under the changing sky. A wedding card from the lunar atelier.',                link:'', prev:'card-wedding.png' },
  { cat:'Cards', glyph:'moon',        name:'Sympathy Moon Card',         desc:'The quiet that holds you in loss. A sympathy card without empty cheer.',                link:'', prev:'card-sympathy.png' },

  // ---- Atelier Notes (quiet free pieces at the tail of the catalogue) ----
  { cat:'Atelier Notes', glyph:'moon',     name:'Moon & Money Glyphs',     desc:'A small set of glyphs used in the Moon & Money house. A free download from the studio, for your notebooks, your screens, your own correspondence.', link:'', badge:'Free', prev:'glyphs.png' }
];

(function renderShop() {
  const grid = document.getElementById('shopGrid');
  const filterBar = document.getElementById('shopFilters');
  if (!grid) return;
  const Z = window.ZODIAC;

  const cats = ['All', ...new Set(CATALOG.map(p => p.cat))];
  filterBar.innerHTML = cats
    .map((c, i) => `<button class="chip${i === 0 ? ' active' : ''}" data-f="${c}">${c}</button>`)
    .join('');

  // Price comes from window.MM_PRICES (defined in config.js). "" means
  // "no LS product yet — preview only"; "Free" shows alongside the same
  // styling as a price; a dollar amount shows as the visible CTA.
  const priceFor = (name) => (window.MM_PRICES && window.MM_PRICES[name]) || '';

  const card = (p, i) => {
    const price = priceFor(p.name);
    const isPreviewOnly = price === '';
    const isFree = price === 'Free';
    const buttonLabel = isPreviewOnly ? 'Preview' : (isFree ? 'Get it' : 'Order');
    const footHTML = isPreviewOnly
      ? `<button class="buy" data-i="${i}">${buttonLabel}</button>`
      : `<span class="price">${price}</span><button class="buy" data-i="${i}">${buttonLabel}</button>`;
    return `
    <article class="product reveal" data-i="${i}">
      <div class="cover">
        <span class="sigil">${Z ? Z.svg(p.glyph) : ''}</span>
        <span class="ph">Moon &amp; Money</span>
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
      </div>
      <div class="body">
        <span class="cat">${p.cat}</span>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="foot">${footHTML}</div>
      </div>
    </article>`;
  };

  const paint = (f) => {
    const list = CATALOG.map((p, i) => ({ p, i })).filter(o => f === 'All' || o.p.cat === f);
    grid.innerHTML = list.map(o => card(o.p, o.i)).join('');
    grid.querySelectorAll('.reveal').forEach((el, k) =>
      setTimeout(() => el.classList.add('in'), 40 * k));
    grid.querySelectorAll('[data-i]').forEach(el => {
      el.addEventListener('click', () => {
        const item = CATALOG[+el.dataset.i];
        const url = (window.MM_CHECKOUT && window.MM_CHECKOUT[item.name]) || item.link || '';
        // Greeting cards take a detour through the card-info modal so we
        // can collect the recipient's name + email + the buyer's personal
        // message, then forward to the Lemon Squeezy checkout with those
        // values prefilled into LS custom fields (recipient_name,
        // recipient_email, message). If there's no LS URL yet, fall back
        // to the standard "preview" modal so the card still has somewhere
        // graceful to land.
        if (item.cat === 'Cards' && url) return openCardModal(item, url);
        if (url) openCheckout(url);
        else openPreview(item);
      });
    });
  };

  filterBar.addEventListener('click', e => {
    const b = e.target.closest('.chip');
    if (!b) return;
    filterBar.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    b.classList.add('active');
    paint(b.dataset.f);
  });
  paint('All');

  // Arriving from a homepage "Preview" card → open it straight away
  try {
    const want = new URLSearchParams(location.search).get('p');
    if (want) {
      const item = CATALOG.find(p => p.name === want);
      if (item) setTimeout(() => openPreview(item), 350);
    }
  } catch (e) {}
})();

/* Checkout — Lemon Squeezy overlay when available, else new tab */
function openCheckout(url) {
  if (window.LemonSqueezy && window.LemonSqueezy.Url && typeof window.LemonSqueezy.Url.Open === 'function') {
    const u = url.indexOf('embed=1') > -1 ? url : url + (url.indexOf('?') > -1 ? '&' : '?') + 'embed=1';
    window.LemonSqueezy.Url.Open(u);
  } else {
    window.open(url, '_blank', 'noopener');
  }
}

/* Elegant preview — a quiet look at the piece before it's for sale */
function openPreview(p) {
  const Z = window.ZODIAC;
  let m = document.getElementById('mmModal');
  if (!m) {
    m = document.createElement('div');
    m.id = 'mmModal';
    m.className = 'wish';
    document.body.appendChild(m);
    m.addEventListener('click', e => {
      const listen = e.target.closest('[data-listen]');
      if (listen) { if (window.MMPlay) window.MMPlay.track(listen.dataset.src, listen.dataset.label); return; }
      if (e.target === m || e.target.closest('[data-close]')) m.classList.remove('show');
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') m.classList.remove('show'); });
  }
  const thumb = p.prev
    ? `<div class="preview-thumb">
         <img src="assets/img/previews/${p.prev}" alt="${p.name} preview" loading="lazy">
         <div class="wm"><span>MOON &amp; MONEY · PREVIEW</span><span>MOON &amp; MONEY · PREVIEW</span><span>MOON &amp; MONEY · PREVIEW</span></div>
       </div>`
    : `<div class="preview-art">${Z ? Z.svg(p.glyph) : ''}</div>`;
  m.innerHTML = `<div class="preview-card">
      ${thumb}
      <span class="eyebrow">${p.cat}</span>
      <h2>${p.name}</h2>
      <p>${p.desc}</p>
      <p class="preview-soon">A watermarked first look. The full piece is delivered, unmarked,
      on purchase. Crescent Club members receive every release first.</p>
      ${p.audio ? `<button class="preview-listen" data-listen data-label="${p.name}" data-src="${p.audio}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
        Listen in Luna’s voice
      </button>` : ''}
      <a class="btn btn-gold" href="https://moonandmoney.substack.com/subscribe" target="_blank">Join the Crescent Club</a>
      <div><small data-close>Close ✦</small></div>
    </div>`;
  m.classList.add('show');
}

/* Card modal — collects the recipient's name + email and the buyer's
   personal message, then forwards to the Lemon Squeezy checkout with
   those values prefilled into LS's checkout[custom][...] fields. The
   webhook on chart-engine reads custom_data.recipient_name /
   recipient_email / message and emails the card PDF to the recipient. */
function openCardModal(item, checkoutUrl) {
  let m = document.getElementById('mmCardModal');
  if (!m) {
    m = document.createElement('div');
    m.id = 'mmCardModal';
    m.className = 'wish';
    document.body.appendChild(m);
    m.addEventListener('click', e => {
      if (e.target === m || e.target.closest('[data-close]')) m.classList.remove('show');
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') m.classList.remove('show'); });
  }
  const thumb = item.prev
    ? `<div class="preview-thumb">
         <img src="assets/img/previews/${item.prev}" alt="${item.name} preview" loading="lazy">
         <div class="wm"><span>MOON &amp; MONEY · PREVIEW</span><span>MOON &amp; MONEY · PREVIEW</span><span>MOON &amp; MONEY · PREVIEW</span></div>
       </div>`
    : '';
  m.innerHTML = `<div class="preview-card cardform-card">
      ${thumb}
      <span class="eyebrow">${item.cat}</span>
      <h2>${item.name}</h2>
      <p>${item.desc}</p>
      <form class="cardform" novalidate>
        <label>
          <span>Who's it for? <em>name</em></span>
          <input type="text" name="recipient_name" required autocomplete="off"
                 placeholder="Jamie" maxlength="60">
        </label>
        <label>
          <span>Their <em>email</em></span>
          <input type="email" name="recipient_email" required autocomplete="off"
                 placeholder="jamie@example.com">
        </label>
        <label>
          <span>A short message <em>(optional)</em></span>
          <textarea name="message" maxlength="400" rows="3"
                    placeholder="A line or two — what you'd write inside the card."></textarea>
          <small class="cardform-count"><span data-count>0</span> / 400</small>
        </label>
        <p class="cardform-note">After you finish checkout, the card lands in your friend's
        inbox with your message in the email and the card as a PDF attachment. You get a copy too.</p>
        <button class="btn btn-gold cardform-send" type="submit">Continue to checkout →</button>
        <div><small data-close>Cancel ✦</small></div>
      </form>
    </div>`;

  const form = m.querySelector('.cardform');
  const countEl = m.querySelector('[data-count]');
  const ta = m.querySelector('textarea[name="message"]');
  ta.addEventListener('input', () => { countEl.textContent = String(ta.value.length); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const rname = (data.get('recipient_name') || '').toString().trim();
    const remail = (data.get('recipient_email') || '').toString().trim();
    const msg = (data.get('message') || '').toString().trim();
    // Light validation. The required attribute catches empty fields; the
    // email pattern is the browser default. We only need to verify here
    // before assembling the URL.
    if (!rname || !remail) { form.reportValidity(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(remail)) { form.reportValidity(); return; }
    // Build the LS prefill URL. Lemon Squeezy accepts custom field values
    // as checkout[custom][fieldKey]= in the query string. The field keys
    // here MUST match the custom field identifiers configured on the LS
    // product side (recipient_name / recipient_email / message).
    const sep = checkoutUrl.indexOf('?') > -1 ? '&' : '?';
    const params =
      'checkout[custom][recipient_name]='  + encodeURIComponent(rname) +
      '&checkout[custom][recipient_email]=' + encodeURIComponent(remail) +
      '&checkout[custom][message]='        + encodeURIComponent(msg);
    const finalUrl = checkoutUrl + sep + params;
    m.classList.remove('show');
    openCheckout(finalUrl);
  });

  m.classList.add('show');
}
