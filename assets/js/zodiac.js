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

  function moonSign(date) {
    const d = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 86400000;
    const rad = Math.PI / 180;
    let L = 218.316 + 13.176396 * d;
    const M = (134.963 + 13.064993 * d) * rad;
    L += 6.289 * Math.sin(M)
       + 1.274 * Math.sin(2 * (L * rad) - M)
       - 0.186 * Math.sin((357.529 + 0.98560 * d) * rad);
    L = ((L % 360) + 360) % 360;
    return SIGNS[Math.floor(L / 30) % 12];
  }

  return { svg, moonSign, SIGNS, CHAR };
})();
