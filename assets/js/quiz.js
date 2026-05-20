/* ============================================================
   MOON & MONEY — Moon Money Sign Quiz
   QUIZ + RESULTS verbatim from the handoff brief. The
   strength / watch / move lines are drafted in the Luna voice
   (the brief's PDF truncated them) — refine any line freely.
   "Get my full guide" routes to that sign's guide in the shop
   (never to the free Substack).
   ============================================================ */
(function () {
  'use strict';
  const root = document.getElementById('quizScreen');
  if (!root) return;

  const QUIZ = [
    { q: "When you check your bank account, the first feeling is...", a: [
      { t: "A wave", s: { Cancer:2, Scorpio:2, Pisces:2 } },
      { t: "A grip", s: { Taurus:2, Virgo:2, Capricorn:2 } },
      { t: "A spark", s: { Aries:2, Leo:2, Sagittarius:2 } },
      { t: "A thought", s: { Gemini:2, Libra:2, Aquarius:2 } }
    ]},
    { q: "Your money decisions are usually...", a: [
      { t: "Fast, initiating, starting fresh", s: { Aries:2, Cancer:2, Libra:2, Capricorn:2 } },
      { t: "Slow, committed, holding long", s: { Taurus:2, Leo:2, Scorpio:2, Aquarius:2 } },
      { t: "Variable, evolving, course-correcting", s: { Gemini:2, Virgo:2, Sagittarius:2, Pisces:2 } },
      { t: "Thought about more than acted on", s: { Gemini:1, Libra:1, Aquarius:1, Virgo:1 } }
    ]},
    { q: "Money is mostly for...", a: [
      { t: "Safety and comfort", s: { Cancer:2, Scorpio:2, Pisces:2 } },
      { t: "Building and lasting", s: { Taurus:2, Virgo:2, Capricorn:2 } },
      { t: "Movement and adventure", s: { Aries:2, Leo:2, Sagittarius:2 } },
      { t: "Connection and ideas", s: { Gemini:2, Libra:2, Aquarius:2 } }
    ]},
    { q: "Your worst money habit is...", a: [
      { t: "Avoiding the numbers when they scare me", s: { Gemini:1, Virgo:1, Sagittarius:1, Pisces:1 } },
      { t: "Spending to feel something", s: { Cancer:1, Leo:1, Sagittarius:1, Pisces:1 } },
      { t: "Holding strategies past their use date", s: { Taurus:2, Leo:2, Scorpio:2, Aquarius:2 } },
      { t: "Acting before I have slept on it", s: { Aries:2, Cancer:1, Libra:1, Capricorn:1 } }
    ]},
    { q: "Your deepest money fear is...", a: [
      { t: "Being left without security", s: { Taurus:2, Cancer:2, Capricorn:2 } },
      { t: "Being left behind by others", s: { Aries:2, Leo:2, Libra:1 } },
      { t: "Being controlled or trapped", s: { Sagittarius:2, Aquarius:2, Scorpio:2 } },
      { t: "Being seen as failing", s: { Virgo:2, Capricorn:1, Leo:1 } }
    ]},
    { q: "Money is most joyful when...", a: [
      { t: "It is saved and quietly growing", s: { Taurus:2, Virgo:2, Capricorn:2 } },
      { t: "It is spent on a moment that matters", s: { Aries:1, Leo:2, Sagittarius:2, Cancer:1 } },
      { t: "It is flowing into something beautiful", s: { Taurus:1, Libra:2, Pisces:2 } },
      { t: "It is funding what most people do not get", s: { Scorpio:2, Sagittarius:1, Aquarius:2 } }
    ]},
    { q: "When you want to feel better, you spend on...", a: [
      { t: "Home, food, the people you love", s: { Cancer:3, Taurus:2 } },
      { t: "Adventure, the next big thing", s: { Aries:2, Sagittarius:3 } },
      { t: "Beauty, art, design", s: { Libra:3, Leo:2, Pisces:2 } },
      { t: "Tools, books, ideas", s: { Gemini:3, Virgo:2, Aquarius:2 } }
    ]}
  ];

  const G = { Aries:'♈',Taurus:'♉',Gemini:'♊',Cancer:'♋',Leo:'♌',
    Virgo:'♍',Libra:'♎',Scorpio:'♏',Sagittarius:'♐',Capricorn:'♑',
    Aquarius:'♒',Pisces:'♓' };

  const RESULTS = {
    Aries:{ archetype:'You earn by going first.',
      strength:'You move before the room does. First in is often best paid.',
      watch:'The start is not the finish. Unfinished bets quietly drain you.',
      move:'Close one open thing before you open the next.' },
    Taurus:{ archetype:'You build wealth the way oak trees grow.',
      strength:'You hold. Patience is your highest-yield asset.',
      watch:'Comfort can become a cage. Not every cost is worth keeping.',
      move:'Audit one comfort you have stopped questioning.' },
    Gemini:{ archetype:'You earn through language and connections.',
      strength:'You turn ideas and people into income faster than most.',
      watch:'Too many streams, none deep. Scatter costs you.',
      move:'Pick the one stream worth doubling. Park the rest.' },
    Cancer:{ archetype:'Money is safety to you. Not luxury.',
      strength:'You protect the base. Your reserve is real, not theoretical.',
      watch:'Fear can over-save the present into a smaller life.',
      move:'Move a fixed amount toward growth, then stop watching it.' },
    Leo:{ archetype:'You earn by being seen.',
      strength:'You invest in your standing and it pays you back.',
      watch:'Spending for the look outlives the moment it bought.',
      move:'Fund one thing that compounds, not one that photographs.' },
    Virgo:{ archetype:'You earn through precision.',
      strength:'Your systems do the earning while you sleep.',
      watch:'Refining forever is a way of not deciding.',
      move:'Ship the money decision at 90 percent. Today.' },
    Libra:{ archetype:'You earn in partnership.',
      strength:'You make the fair deal that keeps paying both sides.',
      watch:'The comfortable number and the fair number are not the same.',
      move:'Name your real number out loud before you negotiate.' },
    Scorpio:{ archetype:'You earn in the depths.',
      strength:'You convert pressure and debt into leverage.',
      watch:'Control held too tightly strangles the return.',
      move:'Turn one quiet liability into an open plan this week.' },
    Sagittarius:{ archetype:'Money is freedom to you.',
      strength:'You aim far and the horizon usually pays.',
      watch:'Expansion past the cash is just a faster way down.',
      move:'Fund the next leap only to where the money actually reaches.' },
    Capricorn:{ archetype:'You were born with a retirement plan.',
      strength:'You play the long, durable game and it works.',
      watch:'The unglamorous grind can quietly skip the living.',
      move:'Schedule one expense that is purely for now.' },
    Aquarius:{ archetype:'You earn at the edge.',
      strength:'You price what everyone else is ignoring.',
      watch:'Different for its own sake is still a cost.',
      move:'Test the unconventional bet small before you scale it.' },
    Pisces:{ archetype:'You earn between worlds.',
      strength:'Your instinct sees the opening before the numbers do.',
      watch:'The figure you will not look at is the one that grows.',
      move:'Open the account you have been avoiding. Just look.' }
  };

  const SIGNS = Object.keys(G);
  const GUIDE = s => 'shop.html?p=' + encodeURIComponent(s + ' Moon Money Guide');
  let state = { screen: 'welcome', q: 0, scores: {} };
  SIGNS.forEach(s => state.scores[s] = 0);

  function track(n, d) { try { if (window.gtag) window.gtag('event', n, d || {}); } catch (e) {} }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
  const dots = a => '<div class="qz-dots" aria-hidden="true">' +
    QUIZ.map((_, i) => '<span class="qz-dot' + (i === a ? ' on' : '') +
      '"' + (i === a ? ' aria-current="step"' : '') + '></span>').join('') + '</div>';

  function renderWelcome() {
    root.innerHTML =
      '<span class="eyebrow">The Quiz</span>' +
      '<h1>Your <em>Moon Money</em> Sign</h1>' +
      '<p class="qz-sub">Seven questions. The Moon sign that drives how you earn, hold and spend. No birth time needed.</p>' +
      '<button class="btn btn-gold" id="qzBegin">Begin</button>';
    document.getElementById('qzBegin').onclick = () => {
      state.screen = 'question'; state.q = 0; track('quiz_started'); render();
    };
  }
  function renderQuestion() {
    const Q = QUIZ[state.q];
    root.innerHTML = dots(state.q) +
      '<p class="qz-qlabel">Question ' + (state.q + 1) + ' / ' + QUIZ.length + '</p>' +
      '<h2 class="qz-q">' + esc(Q.q) + '</h2>' +
      '<div class="qz-opts">' + Q.a.map((o, i) =>
        '<button class="qz-opt" data-i="' + i + '" aria-label="' + esc(o.t) + '">' + esc(o.t) + '</button>'
      ).join('') + '</div>';
    root.querySelectorAll('.qz-opt').forEach(b => {
      b.onclick = () => {
        const sm = Q.a[+b.dataset.i].s;
        for (const s in sm) state.scores[s] += sm[s];
        track('quiz_question_answered', { question_number: state.q + 1, selected_option: Q.a[+b.dataset.i].t });
        if (state.q < QUIZ.length - 1) { state.q++; } else { state.screen = 'result'; }
        render();
      };
    });
  }
  function renderResult() {
    let win = SIGNS[0], max = state.scores[win];
    SIGNS.forEach(s => { if (state.scores[s] > max) { max = state.scores[s]; win = s; } });
    const r = RESULTS[win];
    track('quiz_completed', { result_sign: win });
    root.innerHTML =
      '<div role="status">' +
      '<span class="eyebrow">Your Moon Money Sign</span>' +
      '<div class="qz-glyph">' + G[win] + '</div>' +
      '<h2 class="qz-result">' + win + '</h2>' +
      '<p class="qz-arch">' + esc(r.archetype) + '</p>' +
      '<div class="qz-box"><span class="qz-bl">Your strength</span><p>' + esc(r.strength) + '</p></div>' +
      '<div class="qz-box"><span class="qz-bl">Watch for</span><p>' + esc(r.watch) + '</p></div>' +
      '<div class="qz-box move"><span class="qz-bl">The move</span><p>' + esc(r.move) + '</p></div>' +
      '<div class="qz-cta">' +
        '<a class="btn btn-gold" id="qzGuide" href="' + GUIDE(win) + '">Get my full ' + win + ' guide</a>' +
        '<a class="btn btn-ghost" id="qzSub" href="https://moonandmoney.substack.com/subscribe" target="_blank" rel="noopener">Join the Crescent Club</a>' +
        '<button class="qz-retake" id="qzRetake">Take it again</button>' +
        '<button class="qz-share" id="qzShare">Save to Photos</button>' +
      '</div></div>';
    document.getElementById('qzGuide').addEventListener('click', () => track('quiz_guide_cta_clicked', { result_sign: win }));
    document.getElementById('qzSub').addEventListener('click', () => track('quiz_substack_cta_clicked', { result_sign: win }));
    document.getElementById('qzRetake').onclick = () => {
      state = { screen: 'welcome', q: 0, scores: {} }; SIGNS.forEach(s => state.scores[s] = 0); render();
    };
    document.getElementById('qzShare').onclick = () => {
      try {
        const canvas = drawQuizShare(win, r);
        shareOrDownload(canvas,
          'MoonAndMoney_MoonMoneySign_' + win + '.png',
          { title: 'My Moon Money Sign', text: 'I\'m a ' + win + ' Moon Money Sign.' });
        track('quiz_shared', { result_sign: win });
      } catch (e) {}
    };
  }
  // iOS: opens the share sheet (with Save Image → Photos). Desktop: download.
  function shareOrDownload(canvas, filename, meta) {
    canvas.toBlob((blob) => {
      if (!blob) return;
      let file = null;
      try { file = new File([blob], filename, { type: 'image/png' }); }
      catch (e) { file = null; }
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: (meta && meta.title) || 'Moon & Money',
          text: (meta && meta.text) || '',
        }).catch(() => downloadBlob(blob, filename));
      } else {
        downloadBlob(blob, filename);
      }
    }, 'image/png');
  }
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = filename; a.href = url;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
  }
  function wrapTextQ(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' '); let line = '', cy = y;
    for (let i = 0; i < words.length; i++) {
      const test = line + (line ? ' ' : '') + words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, cy); line = words[i]; cy += lineHeight;
      } else line = test;
    }
    if (line) ctx.fillText(line, x, cy);
    return cy + lineHeight;
  }
  function drawQuizShare(sign, r) {
    // 1080×1920 — 9:16, iPhone-perfect. Same aspect as IG Story / TikTok /
    // iPhone wallpaper. Sits comfortably on the phone with no letterbox.
    const W = 1080, H = 1920;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');

    // background
    const bg = x.createRadialGradient(W/2, H*0.32, 100, W/2, H*0.32, W*1.0);
    bg.addColorStop(0, '#0B2545'); bg.addColorStop(1, '#03081A');
    x.fillStyle = '#070608'; x.fillRect(0, 0, W, H);
    x.globalAlpha = 0.88; x.fillStyle = bg; x.fillRect(0, 0, W, H); x.globalAlpha = 1;

    // stars — deterministic for identical re-renders
    x.fillStyle = '#FCF7F1';
    for (let i = 0; i < 95; i++) {
      const sx = Math.abs(Math.sin(i * 13.7) * 10000) % 1 * W;
      const sy = Math.abs(Math.sin(i * 7.3 + 1.1) * 10000) % 1 * H;
      const sr = 0.5 + Math.abs(Math.sin(i * 4.2)) * 1.2;
      x.globalAlpha = 0.22 + Math.abs(Math.sin(i * 2.1)) * 0.5;
      x.beginPath(); x.arc(sx, sy, sr, 0, 6.283); x.fill();
    }
    x.globalAlpha = 1;

    // frame
    const FR = 56;
    x.strokeStyle = 'rgba(229,199,123,0.55)'; x.lineWidth = 1.4;
    x.strokeRect(FR, FR, W - 2*FR, H - 2*FR);
    x.fillStyle = '#E5C77B';
    [[FR,FR],[W-FR,FR],[FR,H-FR],[W-FR,H-FR]].forEach(p => {
      x.beginPath(); x.arc(p[0], p[1], 4, 0, 6.283); x.fill();
    });

    // brand mark
    x.fillStyle = '#E5C77B';
    x.font = '600 26px "Arimo", "Helvetica Neue", Arial, sans-serif';
    x.textAlign = 'center';
    x.fillText('M O O N   ·   &   ·   M O N E Y', W/2, 180);

    // eyebrow
    x.fillStyle = '#A89FB4';
    x.font = '500 22px "Arimo", sans-serif';
    x.fillText('Y O U R   M O O N   M O N E Y   S I G N', W/2, 235);

    // big sign — focal piece
    x.fillStyle = '#F0D488';
    x.font = 'italic 300 168px "Cormorant Garamond", Georgia, serif';
    x.fillText(sign, W/2, 460);

    // glyph above the divider (small, gold)
    x.fillStyle = '#E5C77B';
    x.font = '300 64px "Apple Symbols", "Noto Sans Symbols 2", serif';
    x.fillText(G[sign], W/2, 565);

    // divider
    x.strokeStyle = 'rgba(201,162,78,0.45)'; x.lineWidth = 0.7;
    x.beginPath(); x.moveTo(W/2 - 110, 615); x.lineTo(W/2 - 12, 615); x.stroke();
    x.beginPath(); x.moveTo(W/2 + 12, 615); x.lineTo(W/2 + 110, 615); x.stroke();
    x.fillStyle = '#E5C77B';
    x.beginPath(); x.arc(W/2, 615, 2.5, 0, 6.283); x.fill();

    // archetype
    x.fillStyle = '#FCF7F1';
    x.font = 'italic 300 42px "Cormorant Garamond", Georgia, serif';
    let cy = wrapTextQ(x, r.archetype, W/2, 700, W - 240, 56);

    // strength
    cy += 50;
    x.fillStyle = '#B9923C';
    x.font = '600 17px "Arimo", sans-serif';
    x.fillText('Y O U R   S T R E N G T H', W/2, cy);
    x.fillStyle = '#FCF7F1';
    x.font = 'italic 300 28px "Cormorant Garamond", Georgia, serif';
    cy = wrapTextQ(x, r.strength, W/2, cy + 50, W - 240, 40);

    // watch for
    cy += 36;
    x.fillStyle = '#B9923C';
    x.font = '600 17px "Arimo", sans-serif';
    x.fillText('W A T C H   F O R', W/2, cy);
    x.fillStyle = '#FCF7F1';
    x.font = 'italic 300 28px "Cormorant Garamond", Georgia, serif';
    cy = wrapTextQ(x, r.watch, W/2, cy + 50, W - 240, 40);

    // move
    cy += 36;
    x.fillStyle = '#7DBE9C';
    x.font = '600 17px "Arimo", sans-serif';
    x.fillText('T H E   M O V E', W/2, cy);
    x.fillStyle = '#FCF7F1';
    x.font = 'italic 300 28px "Cormorant Garamond", Georgia, serif';
    wrapTextQ(x, r.move, W/2, cy + 50, W - 240, 40);

    // url
    x.fillStyle = '#C9A24E';
    x.font = 'italic 300 24px "Cormorant Garamond", Georgia, serif';
    x.fillText('Moon & Money  ·  moonandmoney.ca', W/2, H - 130);

    return c;
  }
  function render() {
    if (state.screen === 'welcome') renderWelcome();
    else if (state.screen === 'question') renderQuestion();
    else renderResult();
    root.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  render();
})();
