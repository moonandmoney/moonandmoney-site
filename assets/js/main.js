/* ============================================================
   MOON & MONEY — sensory engine
   ============================================================ */
(function () {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---- Nav: scroll state + mobile ---- */
  const nav = document.querySelector('.nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const burger = document.querySelector('.burger');
  const links = document.querySelector('.nav-links');
  if (burger && links) {
    burger.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  /* ---- Scroll reveal ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---- Cursor glow ---- */
  if (!reduced && matchMedia('(pointer:fine)').matches) {
    const g = document.createElement('div');
    g.className = 'cursor-glow';
    document.body.appendChild(g);
    window.addEventListener('mousemove', e => {
      g.style.opacity = '1';
      g.style.left = e.clientX + 'px';
      g.style.top = e.clientY + 'px';
    }, { passive: true });
  }

  /* ---- Starfield ---- */
  const cv = document.getElementById('starfield');
  if (cv && !reduced) {
    const ctx = cv.getContext('2d');
    let stars = [], W, H, events = [];
    const resize = () => {
      W = cv.width = innerWidth; H = cv.height = innerHeight;
      const n = Math.min(220, Math.floor(W * H / 9000));
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.7 + .4, a: Math.random(),
        s: Math.random() * .035 + .008, d: Math.random() < .5 ? 1 : -1,
        g: Math.random() < .16, b: Math.random() < .22
      }));
    };
    resize();
    addEventListener('resize', resize);

    // ---- Seven slow celestial phenomena (you never know which you'll get) ----
    const TYPES = ['shoot', 'comet', 'meteors', 'satellite', 'pulsar', 'constellation', 'nebula'];
    const env = k => Math.sin(Math.PI * Math.max(0, Math.min(1, k))); // fade in→hold→out
    let lastT = '';
    function spawn() {
      let t = TYPES[Math.floor(Math.random() * TYPES.length)];
      if (t === lastT) t = TYPES[(TYPES.indexOf(t) + 1) % TYPES.length]; // never the same twice running
      lastT = t;
      const now = performance.now();
      const base = { t, born: now };
      if (t === 'shoot') Object.assign(base, { dur: 2800, x: W * (.1 + Math.random() * .55), y: H * (.06 + Math.random() * .28), dx: W * .22, dy: H * .14 });
      else if (t === 'comet') Object.assign(base, { dur: 8000, x: -60, y: H * (.12 + Math.random() * .3), dx: W + 120, dy: H * .12 });
      else if (t === 'meteors') Object.assign(base, { dur: 3600, n: 4, ox: W * (.15 + Math.random() * .5), oy: H * .08 });
      else if (t === 'satellite') Object.assign(base, { dur: 6500, x: W * (.1 + Math.random() * .2), y: H * (.1 + Math.random() * .5), dx: W * .7, dy: H * (Math.random() * .1 - .05) });
      else if (t === 'pulsar') Object.assign(base, { dur: 3600, x: W * (.15 + Math.random() * .7), y: H * (.1 + Math.random() * .5) });
      else if (t === 'constellation') {
        const cx = W * (.15 + Math.random() * .6), cy = H * (.12 + Math.random() * .4), s = Math.min(W, H) * .12;
        const pts = [[0, 0], [.7, .3], [1.4, .1], [1.1, .9], [.4, 1.1], [-.2, .7], [.7, .3]]
          .map(p => [cx + p[0] * s, cy + p[1] * s]);
        Object.assign(base, { dur: 6500, pts });
      } else Object.assign(base, { // nebula — a soft colour cloud that blooms and fades
        dur: 13000,
        x: W * (.2 + Math.random() * .6), y: H * (.14 + Math.random() * .42),
        r: Math.min(W, H) * (.13 + Math.random() * .12),
        dx: (Math.random() - .5) * W * .06, dy: (Math.random() - .5) * H * .04,
        hue: Math.random() < .5 ? [126, 206, 150] : [150, 120, 224] // jade or violet
      });
      events.push(base);
      setTimeout(spawn, 8000 + Math.random() * 10000);
    }
    setTimeout(spawn, 4500);

    const drawEvent = (e, now) => {
      const k = (now - e.born) / e.dur, a = env(k);
      if (e.t === 'shoot') {
        const hx = e.x + e.dx * k, hy = e.y + e.dy * k, L = 150;
        const g = ctx.createLinearGradient(hx, hy, hx - L, hy - L * .6);
        g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(hx, hy); ctx.lineTo(hx - L, hy - L * .6); ctx.stroke();
      } else if (e.t === 'comet') {
        const hx = e.x + e.dx * k, hy = e.y + e.dy * k, L = 220;
        const g = ctx.createLinearGradient(hx, hy, hx - L, hy - L * .25);
        g.addColorStop(0, `rgba(240,228,200,${a * .9})`); g.addColorStop(1, 'rgba(240,228,200,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.beginPath();
        ctx.moveTo(hx, hy); ctx.lineTo(hx - L, hy - L * .25); ctx.stroke();
        ctx.beginPath(); ctx.arc(hx, hy, 2.6, 0, 6.283);
        ctx.fillStyle = `rgba(255,250,235,${a})`; ctx.shadowBlur = 14; ctx.shadowColor = 'rgba(240,212,136,.8)'; ctx.fill(); ctx.shadowBlur = 0;
      } else if (e.t === 'meteors') {
        for (let i = 0; i < e.n; i++) {
          const kk = (now - e.born - i * 520) / (e.dur * .5);
          if (kk < 0 || kk > 1) continue;
          const aa = env(kk), sx = e.ox + i * 26, sy = e.oy + i * 16, l = 60;
          const px = sx + 120 * kk, py = sy + 80 * kk;
          const g = ctx.createLinearGradient(px, py, px - l, py - l * .6);
          g.addColorStop(0, `rgba(255,255,255,${aa})`); g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.beginPath();
          ctx.moveTo(px, py); ctx.lineTo(px - l, py - l * .6); ctx.stroke();
        }
      } else if (e.t === 'satellite') {
        const x = e.x + e.dx * k, y = e.y + e.dy * k;
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, 6.283);
        ctx.fillStyle = `rgba(245,240,228,${a})`; ctx.fill();
      } else if (e.t === 'pulsar') {
        ctx.beginPath(); ctx.arc(e.x, e.y, 1.6 + a * 1.4, 0, 6.283);
        ctx.fillStyle = `rgba(240,212,136,${a})`;
        ctx.shadowBlur = 10 + a * 22; ctx.shadowColor = 'rgba(240,212,136,.85)';
        ctx.fill(); ctx.shadowBlur = 0;
      } else if (e.t === 'constellation') {
        ctx.strokeStyle = `rgba(216,177,80,${a * .5})`; ctx.lineWidth = 1; ctx.beginPath();
        e.pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
        ctx.stroke();
        for (const p of e.pts) {
          ctx.beginPath(); ctx.arc(p[0], p[1], 1.6, 0, 6.283);
          ctx.fillStyle = `rgba(255,248,225,${a})`;
          ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(240,212,136,.8)'; ctx.fill(); ctx.shadowBlur = 0;
        }
      } else { // nebula — a soft colour cloud drifting and breathing
        const cx = e.x + e.dx * k, cy = e.y + e.dy * k;
        const rad = e.r * (.82 + .3 * k);
        const [hr, hg, hb] = e.hue;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, `rgba(${hr},${hg},${hb},${a * .12})`);
        g.addColorStop(.55, `rgba(${hr},${hg},${hb},${a * .05})`);
        g.addColorStop(1, `rgba(${hr},${hg},${hb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 6.283); ctx.fill();
      }
    };

    let last = 0;
    const loop = (t) => {
      if (t - last > 33) {
        last = t;
        ctx.clearRect(0, 0, W, H);
        for (const st of stars) {
          st.a += st.s * st.d;
          if (st.a <= .12 || st.a >= 1) st.d *= -1;
          ctx.beginPath();
          ctx.arc(st.x, st.y, st.r, 0, 6.283);
          if (st.b) { ctx.shadowBlur = 8; ctx.shadowColor = st.g ? 'rgba(240,212,136,.9)' : 'rgba(255,255,255,.8)'; }
          else ctx.shadowBlur = 0;
          ctx.fillStyle = st.g
            ? `rgba(240,212,136,${Math.min(1, st.a * 1.15)})`
            : `rgba(245,240,228,${Math.min(1, st.a * 1.05)})`;
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        const now = performance.now();
        events = events.filter(e => (now - e.born) < e.dur);
        for (const e of events) drawEvent(e, now);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---- Live moon phase ---- */
  function moonPhase(date) {
    // Conway-style approximation; returns 0..1 (0 & 1 = new, .5 = full)
    const synodic = 29.530588853;
    const known = Date.UTC(2000, 0, 6, 18, 14); // known new moon
    const days = (date.getTime() - known) / 86400000;
    let age = days % synodic; if (age < 0) age += synodic;
    return age / synodic;
  }
  function phaseName(p) {
    if (p < .03 || p > .97) return 'New Moon';
    if (p < .22) return 'Waxing Crescent';
    if (p < .28) return 'First Quarter';
    if (p < .47) return 'Waxing Gibbous';
    if (p < .53) return 'Full Moon';
    if (p < .72) return 'Waning Gibbous';
    if (p < .78) return 'Last Quarter';
    return 'Waning Crescent';
  }
  const moonEl = document.querySelector('.moon');
  const shadowEl = document.querySelector('.moon-shadow');
  const labelEl = document.querySelector('.moon-phase-label');
  const stageEl = document.querySelector('.moon-stage');
  if (moonEl && shadowEl) {
    const now = new Date();
    const p = moonPhase(now);
    // illuminated fraction 0 (new) → 1 (full) → 0 (new)
    const illum = (1 - Math.cos(2 * Math.PI * p)) / 2; // 0 = new (dark) → 1 = full (bright)
    const dir = p < .5 ? -1 : 1;          // waxing: lit on the RIGHT (shadow exits left); waning: lit on the LEFT
    // New moon: the obsidian disc sits fully over the moon (black).
    // Full moon: it slides entirely off (bright). Crescent in between.
    shadowEl.style.transform = `translateX(${dir * illum * 100}%)`;
    shadowEl.style.opacity = illum > .985 ? '0' : '1';
    // The moon's glow tracks how lit it is — a new moon barely glows.
    moonEl.style.setProperty('--lune', illum.toFixed(3));

    const sign = window.ZODIAC ? window.ZODIAC.moonSign(now) : null;
    if (labelEl) {
      const dstr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      labelEl.innerHTML =
        '<span>' + phaseName(p) + '</span>' +
        (sign ? '<span class="sep">✦</span><span class="moon-in">in ' + sign + '</span>' : '') +
        '<span class="sep">✦</span><span>' + dstr + '</span>';
    }
  }

  /* ---- A note from Luna: a daily lunar money reading ---- */
  const stage = document.querySelector('.moon-stage');
  const SIGN_MONEY = {
    Aries: 'a week that rewards the decisive move over the deliberated one',
    Taurus: 'a week to build something that compounds quietly',
    Gemini: 'a week to diversify rather than concentrate',
    Cancer: 'a week to shore up the reserve before anything else',
    Leo: 'a week to invest in what raises your standing, not only your balance',
    Virgo: 'a week to refine the system until it runs without you',
    Libra: 'a week to rebalance, in the portfolio and in the spending',
    Scorpio: 'a week to turn a liability into leverage',
    Sagittarius: 'a week to widen the horizon without overextending it',
    Capricorn: 'a week for the long, unglamorous, durable decision',
    Aquarius: 'a week to question the default and price the alternative',
    Pisces: 'a week to act on the instinct you have been quietly ignoring'
  };
  const PHASE_MOVE = {
    'New Moon': 'open the position you keep deferring',
    'Waxing Crescent': 'let the small commitment gather momentum',
    'First Quarter': 'meet the resistance and adjust, do not abandon',
    'Waxing Gibbous': 'refine it before the result is due',
    'Full Moon': 'read the position with clear eyes and take what is ripe',
    'Waning Gibbous': 'distribute the gain with intention',
    'Last Quarter': 'close what no longer earns its place',
    'Waning Crescent': 'clear the ledger and make room'
  };
  const CLOSERS = [
    'Decide before you feel certain.',
    'Quiet capital outlasts loud capital.',
    'Timing is a strategy, not a superstition.',
    'Clarity compounds.',
    'The unglamorous choice is usually the wealthy one.',
    'Patience is a position.',
    'What you tend on schedule, you keep.'
  ];
  function dailyReading() {
    const now = new Date();
    const sign = window.ZODIAC ? window.ZODIAC.moonSign(now) : 'Taurus';
    const ph = phaseName(moonPhase(now));
    const seed = Math.floor(now.getTime() / 86400000);
    const close = CLOSERS[seed % CLOSERS.length];
    const kicker = 'Luna · ' + now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const text = 'The Moon is in ' + sign + ': ' + SIGN_MONEY[sign] + '. With the ' +
      ph + ', ' + PHASE_MOVE[ph] + '. ' + close;
    return { kicker, text };
  }
  if (stage) {
    const wishEl = document.createElement('div');
    wishEl.className = 'wish';
    wishEl.innerHTML =
      '<div class="wish-card"><span class="eyebrow" id="wishKicker">A note from Luna</span>' +
      '<h2 id="wishText"></h2><small id="wishClose">Tap to close ✦</small></div>';
    document.body.appendChild(wishEl);
    const wt = wishEl.querySelector('#wishText');
    const wk = wishEl.querySelector('#wishKicker');
    const close = () => wishEl.classList.remove('show');
    stage.addEventListener('click', () => {
      const r = dailyReading();
      wk.textContent = r.kicker;
      wt.textContent = '“' + r.text + '”';
      wishEl.classList.add('show');
      if (!reduced) burstStars();
    });
    wishEl.addEventListener('click', close);
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }
  function burstStars() {
    for (let i = 0; i < 5; i++) {
      const s = document.createElement('div');
      s.className = 'shooting-star';
      s.style.left = (10 + Math.random() * 70) + 'vw';
      s.style.top = (-5 + Math.random() * 30) + 'vh';
      document.body.appendChild(s);
      s.animate(
        [
          { transform: 'translate(0,0)', opacity: 1 },
          { transform: `translate(${260 + Math.random() * 200}px,${260 + Math.random() * 160}px)`, opacity: 0 }
        ],
        { duration: 1100 + Math.random() * 700, easing: 'ease-out' }
      ).onfinish = () => s.remove();
    }
  }

  /* ---- The Aurora: drifts gently across the sky now and then ---- */
  if (!reduced) (function aurora() {
    const veil = document.createElement('div');
    veil.className = 'aurora-veil';
    veil.innerHTML = '<span></span><span></span><span></span>';
    document.body.appendChild(veil);

    function sweep() {
      veil.classList.add('on');
      setTimeout(() => veil.classList.remove('on'), 26000); // dances for ~26s
      setTimeout(sweep, (140 + Math.random() * 130) * 1000); // returns every ~2.3–4.5 min
    }
    setTimeout(sweep, 9000 + Math.random() * 9000); // first one 9–18s in
  })();

  /* ---- Newsletter: send to Substack + deliver the free welcome gift ---- */
  const GIFT = 'assets/gift/moon-sign-money-blueprint.pdf';
  document.querySelectorAll('form[data-news]').forEach(f => {
    f.addEventListener('submit', e => {
      e.preventDefault();
      const note = f.parentElement.querySelector('.news-note');
      window.open('https://moonandmoney.substack.com/subscribe', '_blank');
      const a = document.createElement('a');
      a.href = GIFT;
      a.download = 'Moon-Sign-Money-Blueprint.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (note) note.innerHTML = 'Your free Moon Sign Money Blueprint is downloading ✦ and the Crescent Club is open in a new tab. Confirm your subscription there.';
      f.reset();
    });
  });
})();
