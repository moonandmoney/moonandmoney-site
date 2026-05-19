/* ============================================================
   MOON & MONEY — house glyph system
   The 12 signs use the TRUE standard astrological glyphs (the
   exact forms in the Moon & Money guide PDFs, which are set in
   DejaVu Sans). We render them in Noto Sans Symbols 2 — the
   same canonical letterforms — so the brand is fully
   streamlined with the documents. Elements stay as line-art.
   ============================================================ */
window.ZODIAC = (function () {
  const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                 'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

  // U+FE0E = text-presentation selector → forces the clean line
  // symbol (NOT the purple Apple emoji).
  const TS = '︎';
  const CHAR = {
    Aries:'♈'+TS, Taurus:'♉'+TS, Gemini:'♊'+TS, Cancer:'♋'+TS,
    Leo:'♌'+TS, Virgo:'♍'+TS, Libra:'♎'+TS, Scorpio:'♏'+TS,
    Sagittarius:'♐'+TS, Capricorn:'♑'+TS, Aquarius:'♒'+TS, Pisces:'♓'+TS
  };

  const X = {
    fire:'M32 11 L53 50 H11 Z',
    earth:'M11 17 H53 L32 50 Z M20 35 H44',
    air:'M32 13 L53 50 H11 Z M21 40 H43',
    water:'M11 17 H53 L32 50 Z',
    moon:'<path d="M41 11 A22 22 0 1 0 41 53 A17 17 0 1 1 41 11 Z"/>',
    star:'M32 10 L37 25 L53 25 L40 35 L45 52 L32 42 L19 52 L24 35 L11 25 L27 25 Z',
    calendar:'<circle cx="32" cy="32" r="20"/><path d="M32 32 V16 M32 32 L44 39"/>',
    card:'<rect x="12" y="15" width="40" height="34" rx="3"/><path d="M12 22 H52"/>'
  };
  const wrap = (inner) =>
    `<svg class="glyph-svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" ` +
    `stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
    (inner.charAt(0) === '<' ? inner : `<path d="${inner}"/>`) + `</svg>`;

  function svg(key) {
    if (CHAR[key]) return `<span class="zg" aria-hidden="true">${CHAR[key]}</span>`;
    if (X[key]) return wrap(X[key]);
    return wrap(X.moon);
  }

  // High-accuracy lunar longitude (Meeus, abridged series ≈0.05°).
  function moonSign(date) {
    const d = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 86400000;
    const T = d / 36525;
    const r = Math.PI / 180;
    const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
    const D  = (297.8501921 + 445267.1114034 * T - 0.0018819 * T * T) * r;
    const M  = (357.5291092 + 35999.0502909 * T) * r;
    const Mp = (134.9633964 + 477198.8675055 * T + 0.0087414 * T * T) * r;
    const F  = (93.2720950 + 483202.0175233 * T) * r;
    const t = [
      [6288774, Mp], [1274027, 2*D - Mp], [658314, 2*D], [213618, 2*Mp],
      [-185116, M], [-114332, 2*F], [58793, 2*D - 2*Mp], [57066, 2*D - M - Mp],
      [53322, 2*D + Mp], [45758, 2*D - M], [-40923, M - Mp], [-34720, D],
      [-30383, M + Mp], [15327, 2*D - 2*F], [-12528, Mp + 2*F], [10980, Mp - 2*F],
      [10675, 4*D - Mp], [10034, 3*Mp], [8548, 4*D - 2*Mp], [-7888, 2*D + M - Mp],
      [-6766, 2*D + M], [-5163, D - Mp], [4987, D + M], [4036, 2*D - M + Mp],
      [3994, 2*D + 2*Mp], [3861, 4*D], [3665, 2*D - 3*Mp], [-2689, M - 2*Mp],
      [-2602, 2*D - Mp + 2*F], [2390, 2*D - M - 2*Mp]
    ];
    let s = 0;
    for (let i = 0; i < t.length; i++) s += t[i][0] * Math.sin(t[i][1]);
    let L = (Lp + s / 1e6) % 360;
    if (L < 0) L += 360;
    return SIGNS[Math.floor(L / 30) % 12];
  }

  return { svg, moonSign, SIGNS, CHAR };
})();
