/* ============================================================
   MOON & MONEY — persistent voice player
   Plays recorded audio in Luna Wilde's real voice (no robot
   text-to-speech). Whatever is playing CONTINUES as you move
   between pages — it saves position and resumes seamlessly.

   To narrate any long passage in your own voice:
     1. Record an MP3, drop it in  assets/audio/
     2. On the section add:  data-audio="assets/audio/your-file.mp3"
        (optional)           data-audio-label="What it's called"
   A "Listen in Luna's voice" control appears automatically and
   plays through this same bar, so it follows across the site.
   See NARRATION.md for the full how-to.
   ============================================================ */
(function () {
  'use strict';
  const host = document.getElementById('mmPlayer');
  if (!host) return;

  const WELCOME_RAW = host.dataset.welcome || 'assets/audio/invocation.mp3';
  const WELCOME = WELCOME_RAW + (WELCOME_RAW.indexOf('?') === -1 ? '?v=3' : '');
  const SKEY = 'mm_audio_state';
  const RKEY = 'mm_rate';
  const RATES = [1, 1.25, 1.5, 0.85];
  let rate = parseFloat(localStorage.getItem(RKEY)) || 1;
  if (RATES.indexOf(rate) === -1) rate = 1;

  host.className = 'mm-player';
  host.innerHTML =
    '<button class="mm-min" aria-label="Minimize or expand player">' +
      '<svg viewBox="0 0 24 24" class="i-collapse" aria-hidden="true"><path d="M5 12h14"/></svg>' +
      '<svg viewBox="0 0 24 24" class="i-expand" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>' +
    '</button>' +
    '<button class="mm-skip mm-back" aria-label="Back 15 seconds">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 6V2L5 7l6 5V8a6 6 0 1 1-6 6H3a8 8 0 1 0 8-8z"/></svg></button>' +
    '<button class="mm-pp" aria-label="Play or pause">' +
      '<svg viewBox="0 0 24 24" class="i-play" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
      '<svg viewBox="0 0 24 24" class="i-pause" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>' +
    '</button>' +
    '<button class="mm-skip mm-fwd" aria-label="Forward 15 seconds">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 6V2l6 5-6 5V8a6 6 0 1 0 6 6h2a8 8 0 1 1-8-8z"/></svg></button>' +
    '<div class="mm-meta"><span class="mm-title">The Welcome</span>' +
      '<div class="mm-bar"><i></i></div></div>' +
    '<button class="mm-rate" aria-label="Playback speed">' + (rate + '×') + '</button>';

  const ppBtn = host.querySelector('.mm-pp');
  const titleEl = host.querySelector('.mm-title');
  const barFill = host.querySelector('.mm-bar i');
  const rateBtn = host.querySelector('.mm-rate');
  const minBtn = host.querySelector('.mm-min');
  const backBtn = host.querySelector('.mm-back');
  const fwdBtn = host.querySelector('.mm-fwd');

  // Minimize / expand (remembered per visitor)
  try { if (localStorage.getItem('mm_min') === '1') host.classList.add('mm-collapsed'); } catch (e) {}
  minBtn.addEventListener('click', () => {
    const c = host.classList.toggle('mm-collapsed');
    try { localStorage.setItem('mm_min', c ? '1' : '0'); } catch (e) {}
  });
  backBtn.addEventListener('click', () => { audio.currentTime = Math.max(0, (audio.currentTime || 0) - 15); });
  fwdBtn.addEventListener('click', () => {
    if (audio.duration) audio.currentTime = Math.min(audio.duration, (audio.currentTime || 0) + 15);
  });

  const audio = new Audio();
  audio.preload = 'metadata'; // only fetch a few KB until the visitor taps play
  audio.src = WELCOME;

  /* Never let the player cover the footer ("Built in rhythm with
     the moon ☾") — lift it to sit just above the footer. */
  const footer = document.querySelector('footer');
  if (footer) {
    let raf = 0;
    const place = () => {
      raf = 0;
      const top = footer.getBoundingClientRect().top;
      const vh = window.innerHeight;
      const base = window.innerWidth <= 560 ? 14 : 20;
      const px = (top < vh ? (vh - top) + 14 : base);
      // Add iPhone home-indicator safe area so the player never sits
      // on top of the swipe-up gesture zone.
      host.style.bottom = `calc(${px}px + env(safe-area-inset-bottom, 0px))`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(place); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    place();
  }

  const setUI = on => host.classList.toggle('playing', on);

  function saveState() {
    try {
      sessionStorage.setItem(SKEY, JSON.stringify({
        src: audio.src, t: audio.currentTime || 0,
        playing: !audio.paused, title: titleEl.textContent
      }));
    } catch (e) {}
  }
  function clearState() { try { sessionStorage.removeItem(SKEY); } catch (e) {} }

  function play(src, label) {
    if (src && audio.src.indexOf(src) === -1) { audio.src = src; audio.currentTime = 0; }
    if (label) titleEl.textContent = label;
    audio.playbackRate = rate;
    audio.play().then(() => setUI(true)).catch(() => setUI(false));
  }
  function toggle() { audio.paused ? play() : audio.pause(); }

  ppBtn.addEventListener('click', () => toggle());
  rateBtn.addEventListener('click', () => {
    rate = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    localStorage.setItem(RKEY, rate);
    rateBtn.textContent = rate + '×';
    audio.playbackRate = rate;
  });

  audio.addEventListener('play', () => { setUI(true); saveState(); mediaSession(); });
  audio.addEventListener('pause', () => { setUI(false); saveState(); });
  audio.addEventListener('ended', () => { setUI(false); clearState(); barFill.style.width = '0%'; });
  let tick = 0;
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) barFill.style.width = (audio.currentTime / audio.duration * 100) + '%';
    if (Date.now() - tick > 2500) { tick = Date.now(); saveState(); }
  });
  window.addEventListener('pagehide', saveState);
  window.addEventListener('beforeunload', saveState);

  // Resume across page navigation.
  // Only the welcome travels site-wide. Any other recording (e.g.
  // an article reading) stays on its own page — never bleeds onto
  // the homepage or anywhere else.
  (function restore() {
    let s; try { s = JSON.parse(sessionStorage.getItem(SKEY)); } catch (e) {}
    if (!s || !s.src) return;
    if (s.src.indexOf('invocation.mp3') === -1) { clearState(); return; }
    audio.src = s.src;
    titleEl.textContent = s.title || 'The Welcome';
    audio.addEventListener('loadedmetadata', () => {
      try { audio.currentTime = s.t || 0; } catch (e) {}
    }, { once: true });
    if (s.playing) {
      const go = () => audio.play().then(() => setUI(true)).catch(() => {
        host.classList.add('resume');
        const onceTap = () => { audio.play().then(() => setUI(true));
          host.classList.remove('resume'); document.removeEventListener('pointerdown', onceTap); };
        document.addEventListener('pointerdown', onceTap, { once: true });
      });
      audio.readyState >= 2 ? go() : audio.addEventListener('canplay', go, { once: true });
    }
  })();

  function mediaSession() {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: titleEl.textContent, artist: 'Luna Wilde', album: 'Moon & Money'
      });
      navigator.mediaSession.setActionHandler('play', () => audio.play());
      navigator.mediaSession.setActionHandler('pause', () => audio.pause());
    } catch (e) {}
  }

  /* ---- Auto-attach a Listen control to any [data-audio] block ----
     Re-runnable: pages that build content with JS (e.g. articles)
     call window.MMPlay.attach() after they render. ---- */
  function attachListens() {
    document.querySelectorAll('[data-audio]').forEach(el => {
      if (el.querySelector('.mm-listen')) return;
      const srcRaw = el.getAttribute('data-audio');
      const src = srcRaw + (srcRaw.indexOf('?') === -1 ? '?v=3' : '');
      const label = el.getAttribute('data-audio-label') || 'Listen in Luna’s voice';
      const b = document.createElement('button');
      b.className = 'mm-listen';
      b.type = 'button';
      b.setAttribute('aria-label', 'Play ' + label + ' in Luna’s voice');
      b.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
        '<span>' + label + '</span>';
      b.addEventListener('click', () => play(src, label));
      el.prepend(b);
    });
  }
  attachListens();

  /* ---- Public API (preview modal, dynamically built content) ---- */
  window.MMPlay = {
    track(src, label) { if (src) play(src, label); },
    stop() { audio.pause(); },
    attach: attachListens
  };
})();
