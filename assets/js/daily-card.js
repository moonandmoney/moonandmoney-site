/* ============================================================
   MOON & MONEY — The Daily Card engine (v2)

   The Moon transits one sign for ~2.5 days. The day's card is
   drawn from that sign's pool of 7 (window.MM_CARDS) and then
   locked for the calendar date in localStorage, so the same
   visitor sees the same card all day. A new day, or the Moon
   changing sign, draws fresh.

   Renders into any element with [data-daily-card]. The WHISPER
   carries two voices: the lie (gold) and the answer (forest).
   ============================================================ */
(function () {
  'use strict';

  var mounts = document.querySelectorAll('[data-daily-card]');
  if (!mounts.length) return;
  if (!window.MM_CARDS || !window.ZODIAC || !window.ZODIAC.moonSign) return;

  function track(n, d) { try { if (window.gtag) window.gtag('event', n, d || {}); } catch (e) {} }

  function dateKey(d) {
    return d.getFullYear() + '-' +
      ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
      ('0' + d.getDate()).slice(-2);
  }

  function pick(sign, key) {
    var pool = window.MM_CARDS[sign];
    if (!pool || !pool.length) return null;
    var storeKey = 'mm_card_' + key;
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(storeKey)); } catch (e) {}
    if (saved && saved.sign === sign &&
        typeof saved.idx === 'number' && pool[saved.idx]) {
      return { card: pool[saved.idx], idx: saved.idx, fresh: false };
    }
    var idx = Math.floor(Math.random() * pool.length);
    try {
      localStorage.setItem(storeKey, JSON.stringify({ sign: sign, idx: idx }));
    } catch (e) {}
    return { card: pool[idx], idx: idx, fresh: true };
  }

  function elText(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function render(mount, sign, drawn) {
    var card = drawn.card;
    var now = new Date();
    var dateStr = now.toLocaleDateString('en-US',
      { weekday: 'long', month: 'long', day: 'numeric' });

    mount.innerHTML = '';
    mount.setAttribute('role', 'article');
    mount.setAttribute('aria-live', 'polite');
    mount.setAttribute('aria-label',
      'The Daily Card. Moon in ' + sign + '. ' + card.title + '.');

    var eyebrow = elText('div', 'dc-eyebrow');
    eyebrow.appendChild(elText('span', 'dc-glyph', null))
      .innerHTML = (window.ZODIAC.svg ? window.ZODIAC.svg(sign) : '');
    eyebrow.appendChild(elText('span', 'dc-eyebrow-txt',
      'Moon in ' + sign + ' · ' + dateStr));

    var title = elText('h3', 'dc-title', card.title);

    var readLabel = elText('div', 'dc-label', 'The Read');
    var read = elText('p', 'dc-read', card.read);

    var whisperLabel = elText('div', 'dc-label', 'The Whisper');
    var whisper = elText('div', 'dc-whisper');
    whisper.appendChild(elText('p', 'dc-lie', '“' + card.lie + '”'));
    whisper.appendChild(elText('p', 'dc-answer', card.answer));

    var moveLabel = elText('div', 'dc-label dc-label-move', 'The Move');
    var move = elText('p', 'dc-move', card.move);

    var rule = elText('div', 'dc-rule', null);

    mount.appendChild(eyebrow);
    mount.appendChild(title);
    mount.appendChild(readLabel);
    mount.appendChild(read);
    mount.appendChild(whisperLabel);
    mount.appendChild(whisper);
    mount.appendChild(rule);
    mount.appendChild(moveLabel);
    mount.appendChild(move);

    if (drawn.fresh) {
      track('daily_card_draw', { sign: sign, card: card.title });
    }
  }

  function run() {
    var now = new Date();
    var sign = window.ZODIAC.moonSign(now);
    var key = dateKey(now);
    var drawn = pick(sign, key);
    if (!drawn) return;
    for (var i = 0; i < mounts.length; i++) render(mounts[i], sign, drawn);
  }

  run();

  // Re-draw if the page is left open across a date or sign change.
  setInterval(function () {
    var now = new Date();
    var sign = window.ZODIAC.moonSign(now);
    var key = dateKey(now);
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem('mm_card_' + key)); } catch (e) {}
    if (!saved || saved.sign !== sign) run();
  }, 30 * 60 * 1000);
})();
