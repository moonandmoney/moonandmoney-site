/* ============================================================
   MOON & MONEY — The Daily Card engine (v2)

   The Moon transits one sign for ~2.5 days. That sign draws
   one card from its pool of 7 (window.MM_CARDS). The card
   arrives FACE DOWN. Tap it to turn it.

   Once turned, it stays turned for the rest of the calendar
   day, even if you leave and return. But if the Moon changes
   sign partway through the day, you earn a fresh card and a
   fresh turn. State is stored per date in localStorage
   (mm_card_<YYYY-MM-DD> = {sign, idx, revealed}); a sign or
   date change resets the turn.

   Renders into any element with [data-daily-card]. The WHISPER
   carries two voices: the lie (gold) and the answer (forest).
   ============================================================ */
(function () {
  'use strict';

  var mounts = document.querySelectorAll('[data-daily-card]');
  if (!mounts.length) return;
  if (!window.MM_CARDS || !window.ZODIAC || !window.ZODIAC.moonSign) return;

  var EMBLEM =
    '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" ' +
    'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ' +
    'aria-hidden="true">' +
    '<circle cx="32" cy="32" r="29" opacity="0.4"/>' +
    '<circle cx="32" cy="32" r="24.5" opacity="0.7"/>' +
    '<path d="M40 14 A20 20 0 1 0 40 50 A15.5 15.5 0 1 1 40 14 Z" ' +
    'fill="currentColor" stroke="none" opacity="0.92"/>' +
    '<circle cx="46" cy="20" r="1.5" fill="currentColor" stroke="none"/>' +
    '<circle cx="50" cy="30" r="1" fill="currentColor" stroke="none"/>' +
    '<circle cx="45" cy="40" r="1.2" fill="currentColor" stroke="none"/>' +
    '</svg>';

  function track(n, d) { try { if (window.gtag) window.gtag('event', n, d || {}); } catch (e) {} }

  function dateKey(d) {
    return d.getFullYear() + '-' +
      ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
      ('0' + d.getDate()).slice(-2);
  }

  function storeKeyFor(d) { return 'mm_card_' + dateKey(d); }

  function load(sign, key) {
    var pool = window.MM_CARDS[sign];
    if (!pool || !pool.length) return null;
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(key)); } catch (e) {}
    if (saved && saved.sign === sign &&
        typeof saved.idx === 'number' && pool[saved.idx]) {
      return { card: pool[saved.idx], idx: saved.idx,
               revealed: saved.revealed === true };
    }
    var idx = Math.floor(Math.random() * pool.length);
    var state = { sign: sign, idx: idx, revealed: false };
    try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) {}
    return { card: pool[idx], idx: idx, revealed: false };
  }

  function markRevealed(sign, idx, key) {
    try {
      localStorage.setItem(key,
        JSON.stringify({ sign: sign, idx: idx, revealed: true }));
    } catch (e) {}
  }

  function elc(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function buildFront(sign, card) {
    var now = new Date();
    var dateStr = now.toLocaleDateString('en-US',
      { weekday: 'long', month: 'long', day: 'numeric' });

    var face = elc('div', 'dc-face dc-face-front');
    face.setAttribute('role', 'article');
    face.setAttribute('aria-live', 'polite');
    face.setAttribute('tabindex', '-1');
    face.setAttribute('aria-label',
      'The Daily Card. Moon in ' + sign + '. ' + card.title + '.');

    var eyebrow = elc('div', 'dc-eyebrow');
    var glyph = elc('span', 'dc-glyph');
    glyph.innerHTML = window.ZODIAC.svg ? window.ZODIAC.svg(sign) : '';
    eyebrow.appendChild(glyph);
    eyebrow.appendChild(elc('span', 'dc-eyebrow-txt',
      'Moon in ' + sign + ' · ' + dateStr));

    var whisper = elc('div', 'dc-whisper');
    whisper.appendChild(elc('p', 'dc-lie', '“' + card.lie + '”'));
    whisper.appendChild(elc('p', 'dc-answer', card.answer));

    face.appendChild(eyebrow);
    face.appendChild(elc('h3', 'dc-title', card.title));
    face.appendChild(elc('div', 'dc-label', 'The Read'));
    face.appendChild(elc('p', 'dc-read', card.read));
    face.appendChild(elc('div', 'dc-label', 'The Whisper'));
    face.appendChild(whisper);
    face.appendChild(elc('div', 'dc-rule'));
    face.appendChild(elc('div', 'dc-label dc-label-move', 'The Move'));
    face.appendChild(elc('p', 'dc-move', card.move));
    return face;
  }

  function buildBack(sign) {
    var face = elc('div', 'dc-face dc-face-back');
    face.setAttribute('role', 'button');
    face.setAttribute('tabindex', '0');
    face.setAttribute('aria-label',
      'Draw today’s card. The Moon is in ' + sign + '.');

    var emblem = elc('div', 'dc-back-emblem');
    emblem.innerHTML = EMBLEM;

    face.appendChild(emblem);
    face.appendChild(elc('div', 'dc-back-eyebrow', 'The Daily Card'));
    face.appendChild(elc('h3', 'dc-back-h', 'Draw today’s card'));
    face.appendChild(elc('div', 'dc-back-sign', 'Moon in ' + sign));
    face.appendChild(elc('div', 'dc-back-cue', 'Tap to turn'));
    return face;
  }

  function render(mount, sign, state, key) {
    mount.innerHTML = '';
    var flip = elc('div', 'dc-flip');
    var front = buildFront(sign, state.card);
    var back = buildBack(sign);
    flip.appendChild(back);
    flip.appendChild(front);
    mount.appendChild(flip);

    if (state.revealed) {
      // Already drawn today (same sign): show it turned, no replay.
      flip.style.transition = 'none';
      flip.classList.add('is-flipped');
      back.setAttribute('aria-hidden', 'true');
      back.removeAttribute('tabindex');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { flip.style.transition = ''; });
      });
      return;
    }

    var turned = false;
    function turn() {
      if (turned) return;
      turned = true;
      flip.classList.add('is-flipped');
      back.setAttribute('aria-hidden', 'true');
      back.removeAttribute('tabindex');
      markRevealed(sign, state.idx, key);
      track('daily_card_draw', { sign: sign, card: state.card.title });
      setTimeout(function () { try { front.focus(); } catch (e) {} }, 700);
    }
    back.addEventListener('click', turn);
    back.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        turn();
      }
    });
  }

  function run() {
    var now = new Date();
    var sign = window.ZODIAC.moonSign(now);
    var key = storeKeyFor(now);
    var state = load(sign, key);
    if (!state) return;
    for (var i = 0; i < mounts.length; i++) render(mounts[i], sign, state, key);
  }

  run();

  // If the page is left open across a date or Moon-sign change,
  // re-run so a fresh card (and a fresh turn) is offered.
  setInterval(function () {
    var now = new Date();
    var sign = window.ZODIAC.moonSign(now);
    var key = storeKeyFor(now);
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(key)); } catch (e) {}
    if (!saved || saved.sign !== sign) run();
  }, 15 * 60 * 1000);
})();
