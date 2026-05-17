/* ============================================================
   MOON & MONEY — on-site reader
   Every Friday reading reads FREE and in full, right here on the
   site. The deeper members' reading lives on Substack for
   Crescent Club members — each article links to it.
   ============================================================ */
(function () {
  'use strict';
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const blocks = arr => (arr || []).map(b =>
    b.h ? `<h3>${esc(b.h)}</h3>` : `<p>${esc(b.p)}</p>`).join('');

  /* ---------------- Homepage featured (latest on-site readings) ---------------- */
  const feed = document.getElementById('archiveFeed');
  if (feed) {
    const posts = (window.MM_POSTS || []).slice(0, 3);
    feed.innerHTML = posts.length ? posts.map(p => `
      <a class="post reveal" href="article.html?slug=${encodeURIComponent(p.slug)}">
        <span class="meta">${esc(p.tag || 'Reading')} · ${esc(p.date || '')}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.subtitle || (p.free && p.free.find(b => b.p) ? p.free.find(b => b.p).p : ''))}</p>
        <span class="read">Read the full reading →</span>
      </a>`).join('')
      : `<div class="feed-state">The first reading lands Friday. ✦</div>`;
    feed.querySelectorAll('.reveal').forEach((el, i) =>
      setTimeout(() => el.classList.add('in'), 90 * i));
  }

  /* ---------------- Archive listing ---------------- */
  const list = document.getElementById('readingList');
  if (list) {
    const posts = window.MM_POSTS || [];
    list.innerHTML = posts.length ? posts.map(p => `
      <a class="post reveal" href="article.html?slug=${encodeURIComponent(p.slug)}">
        <span class="meta">${esc(p.tag || 'Reading')} · ${esc(p.date || '')}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.subtitle || (p.free && p.free.find(b => b.p) ? p.free.find(b => b.p).p : ''))}</p>
        <span class="read">Read the full reading →</span>
      </a>`).join('')
      : `<div class="feed-state">The first reading lands Friday. ✦</div>`;
    list.querySelectorAll('.reveal').forEach((el, i) =>
      setTimeout(() => el.classList.add('in'), 90 * i));
  }

  /* ---------------- Single article ---------------- */
  const art = document.getElementById('article');
  if (art) {
    const slug = new URLSearchParams(location.search).get('slug');
    const posts = window.MM_POSTS || [];
    const post = posts.find(p => p.slug === slug) || posts[0];
    if (!post) {
      art.innerHTML = '<div class="wrap"><p class="feed-state">This reading isn’t here yet.</p></div>';
      return;
    }
    document.title = post.title + ' — Moon & Money';

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
        <p>The Canadian &amp; global economy through the astrological lens, plus the Cosmic Asset Watch — the extended weekly reading lives with the Crescent Club on Substack.</p>
        <a class="btn btn-gold" href="https://moonandmoney.substack.com/subscribe" target="_blank" rel="noopener">Join the Crescent Club</a>
      </div>`;

    art.innerHTML = `
      <article class="article">
        <div class="wrap article-wrap">
          <a class="article-back" href="archive.html">← The Archive</a>
          <span class="eyebrow">${esc(post.tag || 'Reading')} · ${esc(post.date || '')}</span>
          <h1>${esc(post.title)}</h1>
          ${post.subtitle ? `<p class="article-sub">${esc(post.subtitle)}</p>` : ''}
          <div class="article-actions">${substackTop}${audioBlock}</div>
          <div class="article-body">${blocks(post.free)}</div>
          ${clubClose}
          <div class="article-foot">
            <a href="${esc(subUrl)}" target="_blank" rel="noopener">Also on Substack ↗</a>
            <a href="archive.html">More readings →</a>
          </div>
        </div>
      </article>`;

    if (window.MMPlay && window.MMPlay.attach) window.MMPlay.attach();
  }
})();
