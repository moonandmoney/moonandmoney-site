/* ============================================================
   MOON & MONEY — on-site reader
   The Friday readings come straight from your Substack feed (via the
   /.netlify/functions/feed helper), so the home page is never behind:
   the newest FREE reading features on the home page, older ones flow
   to the archive. The paid Crescent Club posts stay on Substack.
   Optional per-reading extras (a prettier tag) live in content.js.
   ============================================================ */
(function () {
  'use strict';
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const blocks = arr => (arr || []).map(b =>
    b.h ? `<h3>${esc(b.h)}</h3>` : `<p>${esc(b.p)}</p>`).join('');

  const EXTRAS = window.MM_EXTRAS || {};
  const FEED_FN = '/.netlify/functions/feed';
  const CACHE_KEY = 'mm_posts_v1';

  const deck = p => p.subtitle || (p.free && p.free.find(b => b.p) ? p.free.find(b => b.p).p : '');
  const withExtras = p => {
    const x = EXTRAS[p.slug] || {};
    return Object.assign({}, p, { tag: p.tag || x.tag || '', audio: x.audio || p.audio || '' });
  };

  function readCache() {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      return c && Array.isArray(c.posts) ? c.posts : null;
    } catch (e) { return null; }
  }
  function writeCache(posts) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ posts, t: Date.now() })); } catch (e) {}
  }

  // Live feed first; fall back to the last good copy so the page is never blank.
  async function getPosts() {
    try {
      const r = await fetch(FEED_FN, { headers: { 'Accept': 'application/json' } });
      if (!r.ok) throw new Error('feed ' + r.status);
      const data = await r.json();
      if (data && Array.isArray(data.posts) && data.posts.length) {
        writeCache(data.posts);
        return data.posts;
      }
      throw new Error('empty feed');
    } catch (e) {
      return readCache() || (window.MM_POSTS || []);
    }
  }

  const reveal = root => (root || document).querySelectorAll('.reveal')
    .forEach((el, i) => setTimeout(() => el.classList.add('in'), 80 * i));

  /* ---------------- Homepage hero feature (this week) ---------------- */
  function renderFeatured(el, posts) {
    const p = posts[0] ? withExtras(posts[0]) : null;
    el.innerHTML = p ? `
      <a class="feature-card reveal" href="article.html?slug=${encodeURIComponent(p.slug)}">
        <span class="meta">${esc(p.tag || 'This Week')} · ${esc(p.date || '')}</span>
        <h2>${esc(p.title)}</h2>
        <p>${esc(deck(p))}</p>
        <span class="btn btn-gold">Read this week’s reading, free</span>
      </a>` : `<div class="feed-state">The first reading lands Friday. ✦</div>`;
    reveal(el);
  }

  /* ---------------- Archive listing (everything except this week) ---------------- */
  function renderList(el, posts) {
    const arch = posts.slice(1).map(withExtras);
    el.innerHTML = arch.length ? arch.map(p => `
      <a class="post reveal" href="article.html?slug=${encodeURIComponent(p.slug)}">
        <span class="meta">${esc(p.tag || 'Reading')} · ${esc(p.date || '')}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(deck(p))}</p>
        <span class="read">Read the full reading →</span>
      </a>`).join('')
      : `<div class="feed-state">More readings land here each Friday. ✦</div>`;
    reveal(el);
  }

  /* ---------------- Single article ---------------- */
  function renderArticle(el, posts) {
    const slug = new URLSearchParams(location.search).get('slug');
    let post = posts.find(p => p.slug === slug) || posts[0];
    if (!post) {
      el.innerHTML = '<div class="wrap"><p class="feed-state">This reading isn’t here yet. <a href="https://moonandmoney.substack.com" target="_blank" rel="noopener">Read on Substack ↗</a></p></div>';
      return;
    }
    post = withExtras(post);
    document.title = post.title + ' · Moon & Money';

    const audioSrc = post.audio
      ? (post.audio.indexOf('/') >= 0 ? post.audio : 'assets/audio/' + post.audio) : '';
    const audioBlock = audioSrc
      ? `<div data-audio="${esc(audioSrc)}" data-audio-label="Listen in Luna’s voice"></div>` : '';

    const subUrl = post.substackUrl || 'https://moonandmoney.substack.com';
    const substackTop = `<a class="article-substack" href="${esc(subUrl)}" target="_blank" rel="noopener">Read this on Substack ↗</a>`;

    // The deeper weekly reading is a Crescent Club benefit on Substack.
    const clubClose = `
      <div class="club-close">
        <span class="eyebrow">The Crescent Club</span>
        <h3>The deeper reading continues for members</h3>
        <p>The Canadian &amp; global economy through the astrological lens, plus the Cosmic Asset Watch. The extended weekly reading lives with the Crescent Club on Substack.</p>
        <a class="btn btn-ghost" href="https://moonandmoney.substack.com/subscribe" target="_blank" rel="noopener">Join the Crescent Club</a>
      </div>`;

    // The main offer — a private, personalised Money Chart reading.
    const moneyPitch = `
      <div class="money-pitch">
        <span class="eyebrow">Read For You Alone</span>
        <h3>Your Money Chart, read in full</h3>
        <p>The weekly reading is for everyone. Your chart is not. A private, written money reading drawn from your exact birth chart: your financial temperament, the timing that favours you, the patterns worth watching. Considered, premium, yours.</p>
        <a class="btn btn-gold" href="money-chart.html">Request your Money Chart</a>
      </div>`;

    el.innerHTML = `
      <article class="article">
        <div class="wrap article-wrap">
          <a class="article-back" href="archive.html">← The Archive</a>
          <span class="eyebrow">${esc(post.tag || 'Reading')} · ${esc(post.date || '')}</span>
          <h1>${esc(post.title)}</h1>
          ${post.subtitle ? `<p class="article-sub">${esc(post.subtitle)}</p>` : ''}
          <div class="article-actions">${audioBlock}${substackTop}</div>
          <div class="article-body">${blocks(post.free)}</div>
          ${moneyPitch}
          ${clubClose}
          <div class="article-foot">
            <a href="${esc(subUrl)}" target="_blank" rel="noopener">Also on Substack ↗</a>
            <a href="archive.html">More readings →</a>
          </div>
        </div>
      </article>`;

    if (window.MMPlay && window.MMPlay.attach) window.MMPlay.attach();
  }

  // Which containers are on this page?
  const feat = document.getElementById('featuredReading');
  const list = document.getElementById('readingList');
  const art = document.getElementById('article');
  if (!feat && !list && !art) return;

  // Immediate loading state so nothing flashes empty, then fill from the feed.
  if (feat) feat.innerHTML = '<div class="feed-state">Loading this week’s reading…</div>';
  if (list) list.innerHTML = '<div class="feed-state">Loading the archive…</div>';
  if (art) art.innerHTML = '<div class="wrap"><p class="feed-state">Loading…</p></div>';

  getPosts().then(posts => {
    if (feat) renderFeatured(feat, posts);
    if (list) renderList(list, posts);
    if (art) renderArticle(art, posts);
  });
})();
