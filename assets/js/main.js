/* ============================================================
   MOON & MONEY — sensory engine
   ============================================================ */
(function () {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---- Nav: mark the current page (gold underline stays lit) ---- */
  (function () {
    function norm(p) {
      try { p = decodeURIComponent(p); } catch (e) {}
      p = p.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
      if (p.length > 1) p = p.replace(/\/$/, '');
      return p || '/';
    }
    const here = norm(location.pathname);
    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (/^(https?:|mailto:|tel:|#)/.test(href)) return;
      let target;
      try { target = norm(new URL(href, location.href).pathname); } catch (e) { return; }
      if (target === here) a.setAttribute('aria-current', 'page');
    });
  })();

  /* ---- Nav: scroll state + mobile ---- */
  const nav = document.querySelector('.nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const burger = document.querySelector('.burger');
  const links = document.querySelector('.nav-links');
  if (burger && links) {
    // Open/close keeps three pieces in sync so the visual state never
    // drifts: the panel (.open), the burger icon (.open → animates into
    // an X), and body scroll (locked while the menu covers the screen).
    const setMenu = (open) => {
      links.classList.toggle('open', open);
      burger.classList.toggle('open', open);
      document.body.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => setMenu(false)));
    // Escape closes — keyboard users and anyone hitting Cmd+W muscle memory.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && links.classList.contains('open')) setMenu(false);
    });
  }

  /* ---- Nav dropdown (Tools): click/touch toggle ----
     CSS opens the submenu on :hover and :focus-within for mouse + keyboard.
     Touch devices on the desktop layout (iPad, etc.) never fire :hover, so
     the dropdown silently failed. This makes the trigger an explicit
     toggle, and a tap outside closes it. ---- */
  document.querySelectorAll('.nav-dropdown').forEach(dd => {
    const trigger = dd.querySelector('.nav-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const open = dd.getAttribute('aria-expanded') === 'true';
      dd.setAttribute('aria-expanded', open ? 'false' : 'true');
      trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-dropdown[aria-expanded="true"]').forEach(dd => {
      if (!dd.contains(e.target)) {
        dd.setAttribute('aria-expanded', 'false');
        const t = dd.querySelector('.nav-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ---- Scroll reveal ----
     Uses GSAP ScrollTrigger when GSAP is loaded on the page, falls back
     to IntersectionObserver otherwise. GSAP gives proper easing, batched
     stagger, and no double-fire on reverse-scroll (which was the homepage
     "all text disappears" failure mode 2026-06-04). The fallback keeps
     reveals working on pages that haven't yet shipped GSAP. */
  (function setupReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      // Pin the start state via inline gsap.set so the CSS opacity:0
      // baseline is reinforced even if the page CSS evolves.
      gsap.set('.reveal', { opacity: 0, y: 38 });
      ScrollTrigger.batch('.reveal', {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => gsap.to(batch, {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          stagger: 0.08, overwrite: 'auto',
          onComplete: () => batch.forEach(el => el.classList.add('in')),
        }),
      });
      return;
    }

    // Legacy IntersectionObserver fallback (used on pages without GSAP).
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(el => io.observe(el));
  })();

  // Belt-and-suspenders safety net: if GSAP's CDN ever fails to load on
  // a page that expected it, after a generous delay flip everything to
  // visible so the page is never permanently blank. This will not fire
  // when GSAP loads normally (the gsap.set above runs first).
  setTimeout(() => {
    if (!window.gsap) {
      document.documentElement.classList.add('no-gsap');
    }
  }, 1200);

  /* ---- Cursor glow ----
     mousemove fires hundreds of times a second on desktop. The old code
     wrote .left / .top per event, which triggers layout on a 520x520
     element — visible as scroll jank / page glitching on slower hardware.
     Now: batch with requestAnimationFrame so at most one update per frame,
     and move via transform (composite-only, no layout). */
  if (!reduced && matchMedia('(pointer:fine)').matches) {
    const g = document.createElement('div');
    g.className = 'cursor-glow';
    document.body.appendChild(g);
    let cx = 0, cy = 0, pending = false;
    window.addEventListener('mousemove', e => {
      cx = e.clientX; cy = e.clientY;
      if (!pending) {
        pending = true;
        requestAnimationFrame(() => {
          g.style.opacity = '1';
          g.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
          pending = false;
        });
      }
    }, { passive: true });
  }

  /* ---- Starfield (kicks in one frame after first paint so
     LCP lands first, but the sky lights up effectively immediately) ----
     On phones the starfield stays ON (the brand needs the sky) but runs
     in a lightweight mode: ~35 stars instead of 90, ~10fps instead of
     30fps, and no constellation overlay. See the IS_MOBILE branch
     inside runStarfield. ---- */
  const cv = document.getElementById('starfield');
  function startStarfield() {
    if (!cv || reduced) return;
    runStarfield();
  }
  // Two rAFs = the browser paints once, then we light the sky on
  // the very next frame (~16–33ms — imperceptible). On iOS Safari
  // (no requestIdleCallback) this replaces the old 1.2s blank-sky gap.
  requestAnimationFrame(() => requestAnimationFrame(startStarfield));
  function runStarfield() {
    const ctx = cv.getContext('2d');
    const IS_MOBILE = window.innerWidth < 768;
    let stars = [], W, H, events = [];
    const resize = () => {
      W = cv.width = innerWidth; H = cv.height = innerHeight;
      // Mobile: ~35 stars max, sparser density. Desktop: ~90, denser.
      // Same celestial feel, ~60% less per-frame work on phones.
      const n = IS_MOBILE
        ? Math.min(35, Math.floor(W * H / 24000))
        : Math.min(90, Math.floor(W * H / 18000));
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.7 + .4, a: Math.random(),
        s: Math.random() * .035 + .008, d: Math.random() < .5 ? 1 : -1,
        g: Math.random() < .16, b: Math.random() < .10
      }));
    };
    resize();
    // Resize fires on every iOS keyboard show/hide, which made tabbing
    // between form fields rebuild the entire starfield every time. Debounce
    // and ignore tiny height-only changes (keyboard up/down) so star data
    // only regenerates on a real layout change.
    let resizeT = 0, lastW = innerWidth, lastH = innerHeight;
    addEventListener('resize', () => {
      if (resizeT) clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        const dw = Math.abs(innerWidth - lastW);
        const dh = Math.abs(innerHeight - lastH);
        if (dw > 50 || dh > 300) {  // real layout change, not keyboard
          lastW = innerWidth; lastH = innerHeight;
          resize();
        }
      }, 180);
    });
    // Pause the canvas while an input is focused so the form is buttery.
    document.addEventListener('focusin', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        paused = true;
      }
    });
    document.addEventListener('focusout', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        paused = false;
      }
    });

    // The 12 zodiac constellations, stylised as ordered star
    // polylines in a ~0..1.4 box. The sky draws the one the
    // Moon is currently transiting, so it changes sign with
    // the Moon (~2.3 days).
    const ZODIAC_STARS = {
      Aries:       [[0,.55],[.45,.25],[.95,.4],[1.3,.72]],
      Taurus:      [[0,.95],[.5,.5],[.7,.5],[1.0,.12],[.7,.5],[.62,1.05]],
      Gemini:      [[.05,0],[.2,1.05],[.5,1.0],[.42,-.02],[.2,1.05],[.5,1.0]],
      Cancer:      [[.6,0],[.6,.5],[.18,.95],[.6,.5],[1.05,.95]],
      Leo:         [[0,.32],[.12,.08],[.34,.05],[.42,.38],[.78,.62],[1.3,.5],[1.0,1.05],[.42,.38]],
      Virgo:       [[0,.2],[.4,.45],[.82,.4],[1.28,.62],[.82,.4],[.72,1.0]],
      Libra:       [[.08,.72],[.5,.18],[.98,.5],[.6,1.05],[.08,.72]],
      Scorpio:     [[0,.08],[.24,.28],[.5,.34],[.72,.5],[.82,.8],[.66,1.06],[.4,1.12]],
      Sagittarius: [[.05,.7],[.32,.3],[.62,.36],[.72,.66],[.36,.82],[.05,.7],[.72,.66],[.98,.5]],
      Capricorn:   [[0,.3],[1.25,.1],[.78,1.05],[0,.3]],
      Aquarius:    [[0,.42],[.3,.2],[.56,.46],[.82,.24],[1.12,.5],[.86,.82],[1.18,.98]],
      Pisces:      [[0,.2],[.42,.36],[.84,.3],[1.26,.5],[.84,.3],[.72,.72],[.98,1.06]]
    };

    // ---- Rare celestial phenomena: an occasional sighting, never
    // the same twice running. Spaced minutes apart, so a long
    // visit is rewarded with many; a short one feels lucky. ----
    const TYPES = ['shoot', 'comet', 'meteors', 'satellite', 'pulsar',
      'constellation', 'nebula', 'twinkle', 'fallingstar', 'planet'];
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
        const sign = (window.ZODIAC && window.ZODIAC.moonSign)
          ? window.ZODIAC.moonSign(new Date()) : 'Cancer';
        const shape = ZODIAC_STARS[sign] || ZODIAC_STARS.Cancer;
        const cx = W * (.15 + Math.random() * .55), cy = H * (.12 + Math.random() * .38), s = Math.min(W, H) * .17;
        const pts = shape.map(p => [cx + p[0] * s, cy + p[1] * s]);
        Object.assign(base, { dur: 7000, pts, sign });
      } else if (t === 'twinkle') { // a little cluster that flares and settles
        const cx = W * (.12 + Math.random() * .66), cy = H * (.1 + Math.random() * .5);
        const sp = Math.min(W, H) * .11, n = 5 + Math.floor(Math.random() * 4);
        const pts = Array.from({ length: n }, () => [
          cx + (Math.random() - .5) * sp, cy + (Math.random() - .5) * sp,
          Math.random() * 6.283, .7 + Math.random() * 1.5
        ]);
        Object.assign(base, { dur: 5200, pts });
      } else if (t === 'fallingstar') { // a slow, graceful descent
        Object.assign(base, {
          dur: 5400, x: W * (.2 + Math.random() * .6), y: -20,
          dx: W * (Math.random() * .12 - .06), dy: H * (.55 + Math.random() * .2)
        });
      } else if (t === 'planet') { // a serene wandering light
        const pal = [[240, 212, 136], [226, 178, 198], [150, 200, 172]];
        Object.assign(base, {
          dur: 17000, x: W * (.12 + Math.random() * .2), y: H * (.12 + Math.random() * .5),
          dx: W * (.55 + Math.random() * .25), dy: H * (Math.random() * .12 - .06),
          col: pal[Math.floor(Math.random() * pal.length)], rs: 2 + Math.random() * 1.4
        });
      } else Object.assign(base, { // nebula — a soft colour cloud that blooms and fades
        dur: 13000,
        x: W * (.2 + Math.random() * .6), y: H * (.14 + Math.random() * .42),
        r: Math.min(W, H) * (.13 + Math.random() * .12),
        dx: (Math.random() - .5) * W * .06, dy: (Math.random() - .5) * H * .04,
        hue: Math.random() < .5 ? [126, 206, 150] : [150, 120, 224] // jade or violet
      });
      events.push(base);
      // Occasional: ~1.5 to ~4.5 minutes between sightings.
      setTimeout(spawn, 95000 + Math.random() * 175000);
    }
    setTimeout(spawn, 12000 + Math.random() * 12000);

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
      } else if (e.t === 'twinkle') {
        for (const p of e.pts) {
          const tw = .35 + .65 * (.5 + .5 * Math.sin(k * 6.283 * 2.4 + p[2]));
          const aa = a * tw;
          ctx.beginPath(); ctx.arc(p[0], p[1], p[3] * (.6 + .5 * tw), 0, 6.283);
          ctx.fillStyle = `rgba(255,244,212,${aa})`;
          ctx.shadowBlur = 6; ctx.shadowColor = 'rgba(240,212,136,.8)';
          ctx.fill(); ctx.shadowBlur = 0;
        }
      } else if (e.t === 'fallingstar') {
        const hx = e.x + e.dx * k, hy = e.y + e.dy * k;
        const m = Math.hypot(e.dx, e.dy) || 1, L = 58;
        const tx = hx - (e.dx / m) * L, ty = hy - (e.dy / m) * L;
        const g = ctx.createLinearGradient(hx, hy, tx, ty);
        g.addColorStop(0, `rgba(255,246,222,${a})`); g.addColorStop(1, 'rgba(255,246,222,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.7; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.beginPath(); ctx.arc(hx, hy, 1.7, 0, 6.283);
        ctx.fillStyle = `rgba(255,250,235,${a})`;
        ctx.shadowBlur = 9; ctx.shadowColor = 'rgba(240,212,136,.75)';
        ctx.fill(); ctx.shadowBlur = 0;
      } else if (e.t === 'planet') {
        const x = e.x + e.dx * k, y = e.y + e.dy * k, c = e.col;
        const gl = ctx.createRadialGradient(x, y, 0, x, y, e.rs * 6);
        gl.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${a * .5})`);
        gl.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        ctx.fillStyle = gl;
        ctx.beginPath(); ctx.arc(x, y, e.rs * 6, 0, 6.283); ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, e.rs, 0, 6.283);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
        ctx.shadowBlur = 8; ctx.shadowColor = `rgba(${c[0]},${c[1]},${c[2]},.8)`;
        ctx.fill(); ctx.shadowBlur = 0;
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

    // Pause the heavy canvas redraw while the tab is hidden or the page is
    // actively scrolling. The starfield was stealing frames from scroll on
    // slower machines (visible as the page "losing content" mid-scroll). The
    // sky freezes for a moment then resumes ~220ms after scroll stops.
    let last = 0, paused = false, pauseT = null;
    addEventListener('scroll', () => {
      paused = true;
      if (pauseT) clearTimeout(pauseT);
      pauseT = setTimeout(() => { paused = false; }, 220);
    }, { passive: true });
    document.addEventListener('visibilitychange', () => { paused = document.hidden; });
    // Mobile ticks at ~10fps (every 100ms) instead of 30fps — the twinkle still
    // reads as a slow breath, and the frame budget for the rest of the site
    // (scroll, interactions) opens way up.
    const frameMs = IS_MOBILE ? 100 : 33;
    const loop = (t) => {
      if (!paused && t - last > frameMs) {
        last = t;
        ctx.clearRect(0, 0, W, H);
        // shadowBlur was the most expensive op per frame (a per-star GPU blur).
        // Dropped it; the b-flag stars now just render slightly brighter, which
        // reads the same on screen but takes a fraction of the work.
        for (const st of stars) {
          st.a += st.s * st.d;
          if (st.a <= .12 || st.a >= 1) st.d *= -1;
          ctx.beginPath();
          ctx.arc(st.x, st.y, st.r, 0, 6.283);
          const boost = st.b ? 1.25 : 1;
          ctx.fillStyle = st.g
            ? `rgba(240,212,136,${Math.min(1, st.a * 1.15 * boost)})`
            : `rgba(245,240,228,${Math.min(1, st.a * 1.05 * boost)})`;
          ctx.fill();
        }
        const now = performance.now();
        events = events.filter(e => (now - e.born) < e.dur);
        for (const e of events) drawEvent(e, now);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---- Live moon phase ----
     Uses the Sun-Moon ecliptic elongation (Meeus' first-order formula).
     Returns 0..1 where 0 & 1 = new moon, 0.25 = first quarter, 0.5 = full,
     0.75 = last quarter. Accurate to within ~1 hour of cycle at any date,
     vs the old Conway-mod approach which drifted by 3-6 hours over 25
     years of accumulated cycle count. ----*/
  function moonPhase(date) {
    const JD = date.getTime() / 86400000 + 2440587.5;   // ms epoch → Julian Date
    const D = JD - 2451545.0;                            // days since J2000.0
    // Sun: mean longitude + first-order anomaly correction
    const L = (280.460 + 0.9856474 * D) % 360;
    const g = ((357.528 + 0.9856003 * D) % 360) * Math.PI / 180;
    const lambdaSun = L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g);
    // Moon: mean longitude + first-order anomaly correction
    const Lm = (218.316 + 13.176396 * D) % 360;
    const M  = ((134.963 + 13.064993 * D) % 360) * Math.PI / 180;
    const lambdaMoon = Lm + 6.289 * Math.sin(M);
    // Elongation Moon - Sun, normalised to [0, 360)
    let elong = ((lambdaMoon - lambdaSun) % 360 + 360) % 360;
    return elong / 360;
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
  /* ---- Rare celestial events: subtle, automatic site whispers
     when something actually special is happening in the sky. ---- */
  (function celestialEvents() {
    try {
      var now = new Date();
      var f = moonPhase(now);
      var WIN = 0.022;             // ~ within a half day either side
      var classes = [];
      var whisper = '';
      if (f < WIN || f > 1 - WIN) {
        classes.push('mm-newmoon');
        whisper = 'The sky is resetting tonight.';
      } else if (Math.abs(f - 0.5) < WIN) {
        classes.push('mm-fullmoon');
        whisper = 'The moon is full tonight.';
      }
      var m = now.getMonth() + 1, dd = now.getDate();
      // Solstices and Equinoxes: ±1 day window
      var key = m + '-' + dd;
      var spring = ['3-19','3-20','3-21'].indexOf(key) >= 0;
      var summer = ['6-20','6-21','6-22'].indexOf(key) >= 0;
      var autumn = ['9-21','9-22','9-23'].indexOf(key) >= 0;
      var winter = ['12-20','12-21','12-22'].indexOf(key) >= 0;
      if (spring) { classes.push('mm-equinox','mm-spring');  whisper = whisper || 'The spring equinox: the light returns.'; }
      if (autumn) { classes.push('mm-equinox','mm-autumn');  whisper = whisper || 'The autumn equinox: the light turns inward.'; }
      if (summer) { classes.push('mm-solstice','mm-summer'); whisper = whisper || 'The summer solstice: the longest day.'; }
      if (winter) { classes.push('mm-solstice','mm-winter'); whisper = whisper || 'The winter solstice: the longest night.'; }

      if (classes.length) document.body.classList.add.apply(document.body.classList, classes);

      // If we're on the homepage, render the whisper as an engraved
      // arc curving over the top of the moon (no layout shift, since
      // it sits absolutely positioned inside .moon-stage). Falls back
      // to the flat under-moon line if the stage isn't present.
      if (whisper) {
        var stage = document.querySelector('.moon-stage');
        if (stage && !stage.querySelector('.moon-curve')) {
          var ns = 'http://www.w3.org/2000/svg';
          var svg = document.createElementNS(ns, 'svg');
          svg.setAttribute('class', 'moon-curve');
          svg.setAttribute('viewBox', '0 0 100 100');
          svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          svg.setAttribute('overflow', 'visible');
          svg.setAttribute('aria-hidden', 'true');
          // The text path arcs above the moon (radius 56 with peak at y=-4),
          // overflowing the SVG viewBox upward so the engraved arc reads
          // outside the moon's outline. textPath startOffset=50% with
          // text-anchor=middle centres the phrase across the arc.
          svg.innerHTML =
            '<defs><path id="mm-moon-arc-top" d="M -2,52 A 56,56 0 0 1 102,52" fill="none"/></defs>' +
            '<text class="moon-curve-text" dy="0">' +
            '<textPath href="#mm-moon-arc-top" startOffset="50%" text-anchor="middle">' +
            whisper +
            '</textPath></text>';
          stage.appendChild(svg);
        } else {
          // Fallback (non-homepage or stage missing): keep the old flat line.
          var spot = document.querySelector('.moon-readout');
          if (spot && !spot.querySelector('.sky-whisper')) {
            var w = document.createElement('div');
            w.className = 'sky-whisper'; w.textContent = whisper;
            spot.appendChild(w);
          }
        }
      }
    } catch (e) {}
  })();

  /* ---- Live moon-phase favicon (every page, the browser tab
     icon mirrors tonight's actual phase) ---- */
  (function () {
    function paint() {
      try {
        var p = moonPhase(new Date());
        var illum = (1 - Math.cos(2 * Math.PI * p)) / 2;
        var waxing = p < 0.5;
        var c = document.createElement('canvas');
        c.width = c.height = 64;
        var x = c.getContext('2d'), R = 25, cx = 32, cy = 32;
        function ring() {
          x.beginPath(); x.arc(cx, cy, R, 0, 2 * Math.PI);
          x.strokeStyle = 'rgba(240,212,136,0.95)'; x.lineWidth = 5;
          x.lineJoin = 'round'; x.stroke();
        }
        ring();
        x.beginPath(); x.arc(cx, cy, R, 0, 2 * Math.PI);
        x.fillStyle = '#F0D488'; x.fill();
        // Keep a readable sliver: never let a non-new moon erase
        // down to nothing at favicon size.
        var di = illum < 0.5 ? Math.max(illum, 0.10) : Math.min(illum, 0.90);
        if (illum < 0.015) di = 0;          // true new = ring only
        if (illum > 0.985) di = 1;          // true full = solid disc
        var off = 2 * R * di * (waxing ? -1 : 1);
        x.save();
        x.globalCompositeOperation = 'destination-out';
        x.beginPath(); x.arc(cx + off, cy, R, 0, 2 * Math.PI); x.fill();
        x.restore();
        ring();
        var href = c.toDataURL('image/png');
        var l = document.querySelector('link[rel~="icon"]');
        if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); }
        l.type = 'image/png'; l.href = href;
      } catch (e) {}
    }
    paint();
    setInterval(paint, 30 * 60 * 1000);
  })();

  const moonEl = document.querySelector('.moon');
  const shadowEl = document.querySelector('.moon-shadow');
  const labelEl = document.querySelector('.moon-phase-label');
  const stageEl = document.querySelector('.moon-stage');
  if (moonEl && shadowEl) {
    function renderMoon() {
      const now = new Date();
      const p = moonPhase(now);
      // illuminated fraction 0 (new) → 1 (full) → 0 (new)
      const illum = (1 - Math.cos(2 * Math.PI * p)) / 2;
      const dir = p < .5 ? -1 : 1;          // waxing: lit on the RIGHT; waning: lit on the LEFT
      shadowEl.style.transform = `translateX(${dir * illum * 100}%)`;
      shadowEl.style.opacity = illum > .985 ? '0' : '1';
      moonEl.style.setProperty('--lune', illum.toFixed(3));
      if (stageEl) stageEl.style.setProperty('--lune', illum.toFixed(3));
      const sign = window.ZODIAC ? window.ZODIAC.moonSign(now) : null;
      if (labelEl) {
        const dstr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        labelEl.innerHTML =
          '<span>' + phaseName(p) + '</span>' +
          '<span class="sep">✦</span>' +
          (sign ? '<span class="moon-in">in ' + sign + '</span><span class="sep">✦</span>' : '') +
          '<span>' + dstr + '</span>';
      }
    }
    renderMoon();
    // Re-render hourly so a tab left open across days keeps tracking the sky.
    setInterval(renderMoon, 60 * 60 * 1000);
  }

  /* ---- A note from Luna: a daily lunar money reading ---- */
  const stage = document.querySelector('.moon-stage');
  const SIGN_MONEY = {
    Aries: 'the bold move outperforms the perfect one this week',
    Taurus: 'build the thing that pays you while you sleep',
    Gemini: 'choose one stream and stop hedging every bet',
    Cancer: 'make the reserve untouchable before anything else',
    Leo: 'spend on what compounds your name, not your mood',
    Virgo: 'fix the leak no one else can see',
    Libra: 'the fair number and the comfortable number are not the same',
    Scorpio: 'turn a quiet debt into open leverage',
    Sagittarius: 'expand only as far as the cash actually reaches',
    Capricorn: 'the boring decision is the rich one',
    Aquarius: 'price the option everyone else is ignoring',
    Pisces: 'act on the figure you keep pretending you did not see'
  };
  const PHASE_MOVE = {
    'New Moon': 'name the number out loud and open the account today',
    'Waxing Crescent': 'protect the small habit before it gets talked out of you',
    'First Quarter': 'meet the friction and adjust the plan, do not drop it',
    'Waxing Gibbous': 'tighten one thing before the result is counted',
    'Full Moon': 'look without flinching and collect what is already yours',
    'Waning Gibbous': 'move the surplus on purpose, not by accident',
    'Last Quarter': 'end the arrangement that stopped paying you back',
    'Waning Crescent': 'settle the ledger and let the next cycle find you ready'
  };
  const CLOSERS = [
    'Money rewards the decided, not the busy.',
    'Quiet money outlives loud money.',
    'Timing is a discipline, not a feeling.',
    'Clarity is the highest yield you own.',
    'The unglamorous choice is usually the wealthy one.',
    'Patience is a position. Hold it.',
    'What you tend on schedule, you keep.',
    'Wealth is built in the boring middle.'
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

/* ----------------------------------------------------------------
   Nav dropdown — keeps the "Tools" submenu reachable by click
   (hover already works via CSS; this handles tap-on-mobile-tablet,
   keyboard nav, and gives an explicit close on click-outside / Esc).
   ---------------------------------------------------------------- */
(function () {
  'use strict';
  var dropdowns = document.querySelectorAll('.nav-dropdown');
  if (!dropdowns.length) return;

  function closeAll(except) {
    dropdowns.forEach(function (d) {
      if (d !== except) {
        d.setAttribute('aria-expanded', 'false');
        var t = d.querySelector('.nav-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      }
    });
  }

  dropdowns.forEach(function (dd) {
    var trigger = dd.querySelector('.nav-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var open = dd.getAttribute('aria-expanded') === 'true';
      closeAll(dd);
      dd.setAttribute('aria-expanded', open ? 'false' : 'true');
      trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  document.addEventListener('click', function (e) {
    dropdowns.forEach(function (dd) {
      if (dd.getAttribute('aria-expanded') === 'true' && !dd.contains(e.target)) {
        dd.setAttribute('aria-expanded', 'false');
        var t = dd.querySelector('.nav-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });
})();
