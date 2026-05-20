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

    // share action — generate a beautiful card image, save to Photos
    var actions = elc('div', 'dc-actions');
    var btn = elc('button', 'dc-share-btn', 'Save to Photos');
    btn.type = 'button';
    btn.addEventListener('click', function () {
      var filename = 'MoonAndMoney_Card_' +
        new Date().toISOString().slice(0,10) + '_' + sign + '.png';
      try {
        var canvas = drawShareImage(sign, card);
        shareOrDownload(canvas, filename, {
          title: 'Moon & Money',
          text: 'Moon in ' + sign + ' — ' + card.title,
        });
        track('daily_card_share', { sign: sign, card: card.title });
      } catch (e) {}
    });
    actions.appendChild(btn);
    face.appendChild(actions);
    return face;
  }

  // ---- Save / share helper ------------------------------------------------
  // iOS Safari + Android Chrome: tries the Web Share API first, which opens
  // the system share sheet. The sheet includes "Save Image" → Photos, plus
  // every social/messaging app the user has installed. One tap, one save.
  // Everywhere else: falls back to a plain download. The button label says
  // "Save to Photos" because that's what most people do with it.
  function shareOrDownload(canvas, filename, meta) {
    canvas.toBlob(function (blob) {
      if (!blob) return;
      var file = null;
      try { file = new File([blob], filename, { type: 'image/png' }); }
      catch (e) { file = null; }

      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: (meta && meta.title) || 'Moon & Money',
          text:  (meta && meta.text)  || '',
        }).catch(function () { downloadBlob(blob, filename); });
      } else {
        downloadBlob(blob, filename);
      }
    }, 'image/png');
  }
  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.download = filename; a.href = url;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 0);
  }

  // ---- Share image: 1080x1920 (9:16, iPhone-perfect) ----------------------
  // Same aspect as Instagram Stories, TikTok, iPhone wallpaper. The whole
  // image lives comfortably on a phone screen without crop or letterbox.
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' '), line = '', cy = y;
    for (var i = 0; i < words.length; i++) {
      var test = line + (line ? ' ' : '') + words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, cy); line = words[i]; cy += lineHeight;
      } else line = test;
    }
    if (line) ctx.fillText(line, x, cy);
    return cy + lineHeight;
  }
  function drawShareImage(sign, card) {
    var W = 1080, H = 1920;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var x = c.getContext('2d');

    // background — cosmic navy on obsidian, brighter at the focal point
    var bg = x.createRadialGradient(W/2, H*0.32, 100, W/2, H*0.32, W*1.0);
    bg.addColorStop(0, '#0B2545');
    bg.addColorStop(1, '#03081A');
    x.fillStyle = '#070608'; x.fillRect(0, 0, W, H);
    x.fillStyle = bg; x.globalAlpha = 0.88; x.fillRect(0, 0, W, H); x.globalAlpha = 1;

    // soft stars — deterministic from i so it's identical every render
    x.fillStyle = '#FCF7F1';
    for (var i = 0; i < 95; i++) {
      var sx = Math.abs(Math.sin(i * 13.7) * 10000) % 1 * W;
      var sy = Math.abs(Math.sin(i * 7.3 + 1.1) * 10000) % 1 * H;
      var sr = 0.5 + Math.abs(Math.sin(i * 4.2)) * 1.2;
      x.globalAlpha = 0.22 + Math.abs(Math.sin(i * 2.1)) * 0.5;
      x.beginPath(); x.arc(sx, sy, sr, 0, 6.283); x.fill();
    }
    x.globalAlpha = 1;

    // gold frame — thin rectangle with dot corners
    var FR = 56;  // frame inset
    x.strokeStyle = 'rgba(229,199,123,0.55)'; x.lineWidth = 1.4;
    x.strokeRect(FR, FR, W - 2*FR, H - 2*FR);
    x.fillStyle = '#E5C77B';
    [[FR,FR],[W-FR,FR],[FR,H-FR],[W-FR,H-FR]].forEach(function (p) {
      x.beginPath(); x.arc(p[0], p[1], 4, 0, 6.283); x.fill();
    });

    // brand mark — top
    x.fillStyle = '#E5C77B';
    x.font = '600 26px "Arimo", "Helvetica Neue", Arial, sans-serif';
    x.textAlign = 'center';
    x.fillText('M O O N   ·   &   ·   M O N E Y', W/2, 180);

    // moon-in-sign + date — eyebrow
    var now = new Date();
    var dateStr = now.toLocaleDateString('en-US',
      { month: 'long', day: 'numeric', year: 'numeric' });
    x.fillStyle = '#A89FB4';
    x.font = '500 22px "Arimo", sans-serif';
    x.fillText('Moon in ' + sign + '  ·  ' + dateStr.toUpperCase(), W/2, 230);

    // crescent moon — focal point, generous breathing room
    var moonY = 380, moonR = 86;
    var mg = x.createRadialGradient(
      W/2 - moonR*0.3, moonY - moonR*0.3, 6, W/2, moonY, moonR);
    mg.addColorStop(0, '#FFF6E0');
    mg.addColorStop(0.5, '#EAC979');
    mg.addColorStop(1, '#7A5F1F');
    x.fillStyle = mg;
    x.beginPath(); x.arc(W/2, moonY, moonR, 0, 6.283); x.fill();
    x.strokeStyle = 'rgba(229,199,123,0.55)'; x.lineWidth = 0.8;
    x.beginPath(); x.arc(W/2, moonY, moonR, 0, 6.283); x.stroke();

    // divider with gold dot
    x.strokeStyle = 'rgba(201,162,78,0.45)'; x.lineWidth = 0.7;
    x.beginPath(); x.moveTo(W/2 - 110, 530); x.lineTo(W/2 - 12, 530); x.stroke();
    x.beginPath(); x.moveTo(W/2 + 12, 530); x.lineTo(W/2 + 110, 530); x.stroke();
    x.fillStyle = '#E5C77B';
    x.beginPath(); x.arc(W/2, 530, 2.5, 0, 6.283); x.fill();

    // title
    x.fillStyle = '#F0D488';
    x.font = 'italic 300 68px "Cormorant Garamond", Georgia, serif';
    x.fillText(card.title, W/2, 620);

    // THE READ
    x.fillStyle = '#B9923C';
    x.font = '600 17px "Arimo", sans-serif';
    x.fillText('T H E   R E A D', W/2, 710);
    x.fillStyle = '#FCF7F1';
    x.font = 'italic 300 32px "Cormorant Garamond", Georgia, serif';
    var afterRead = wrapText(x, card.read, W/2, 770, W - 240, 46);

    // whisper panel — light parchment, dynamically sized
    var wpY = afterRead + 36;
    // measure the wrapped whisper so we can size the panel
    x.font = 'italic 300 28px "Cormorant Garamond", Georgia, serif';
    var lieLines = measureLines(x, '"' + card.lie + '"', W - 260);
    var ansLines = measureLines(x, card.answer, W - 260);
    var wpH = 60 + lineCount(lieLines) * 40 + 16 + lineCount(ansLines) * 40 + 60;

    var grad = x.createLinearGradient(0, wpY, 0, wpY + wpH);
    grad.addColorStop(0, '#CCC0A0'); grad.addColorStop(1, '#BCAE86');
    x.fillStyle = grad;
    x.beginPath();
    if (x.roundRect) x.roundRect(80, wpY, W - 160, wpH, 14);
    else x.rect(80, wpY, W - 160, wpH);
    x.fill();
    x.strokeStyle = 'rgba(90,70,28,0.30)'; x.lineWidth = 1;
    x.beginPath();
    if (x.roundRect) x.roundRect(80, wpY, W - 160, wpH, 14);
    else x.rect(80, wpY, W - 160, wpH);
    x.stroke();

    // lie (warm gold-bronze) + answer (forest)
    x.fillStyle = '#6B521C';
    x.font = 'italic 300 28px "Cormorant Garamond", Georgia, serif';
    var afterLie = wrapText(x, '"' + card.lie + '"', W/2, wpY + 60, W - 260, 40);
    x.fillStyle = '#1E4D3A';
    var afterAns = wrapText(x, card.answer, W/2, afterLie + 12, W - 260, 40);

    // THE MOVE — block placed below the panel
    var moveY = wpY + wpH + 90;
    x.fillStyle = '#7DBE9C';
    x.font = '600 17px "Arimo", sans-serif';
    x.fillText('T H E   M O V E', W/2, moveY);
    x.fillStyle = '#FCF7F1';
    x.font = 'italic 300 30px "Cormorant Garamond", Georgia, serif';
    wrapText(x, card.move, W/2, moveY + 56, W - 240, 42);

    // url — anchored to bottom
    x.fillStyle = '#C9A24E';
    x.font = 'italic 300 24px "Cormorant Garamond", Georgia, serif';
    x.fillText('Moon & Money  ·  moonandmoney.ca', W/2, H - 130);

    return c;
  }

  // Helpers for whisper-panel auto-sizing
  function measureLines(ctx, text, maxWidth) {
    var words = text.split(' '), line = '', lines = [];
    for (var i = 0; i < words.length; i++) {
      var test = line + (line ? ' ' : '') + words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line); line = words[i];
      } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }
  function lineCount(lines) { return lines.length || 1; }

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
