# The Readings — how the website works

**The model:** every Friday reading is **free and in full on the website.**
The deeper *Crescent Club* reading stays on **Substack** for paying members
— the website doesn't lock anything and doesn't need a code. People who
want a focused deep dive can also buy the guides in the Atelier (the shop).

## Add this Friday's reading

1. Open `assets/js/content.js`.
2. Copy the example block (commented at the bottom) into the
   `MM_POSTS` array.
3. Fill in:
   - `slug` — short url id, e.g. `first-quarter-in-virgo`
   - `title` — **keep it identical to the Substack post title** so the
     two mirror each other
   - `subtitle`, `date`, `tag` (e.g. `First Quarter · Virgo`)
   - `substackUrl` — paste the **exact Substack post link** the morning
     it goes live (not the homepage). This is what the gold
     "Read this on Substack ↗" button points to.
   - `audio` — optional; see *Read-aloud* below
   - `free: [ {h:'Heading'}, {p:'Paragraph'}, … ]` — the whole free
     reading, in order. `{h:'…'}` is a heading, `{p:'…'}` is a paragraph.
4. Save. It appears on the homepage, on **The Archive**, and gets its
   own shareable page: `article.html?slug=your-slug`.

Every article automatically ends with a calm "the deeper reading
continues for Crescent Club members on Substack" invitation — you don't
add that yourself, and you no longer paste a members' section here.

## Read-aloud (your voice, like Substack)

Record an mp3, drop it in `site/assets/audio/`, and put the filename in
the post's `audio:` field, e.g. `audio: 'new-moon-taurus.mp3'`. A
"Listen in Luna's voice" player appears at the top of that article.
(See NARRATION.md for the full note.)

## Tips

- No backend, no account, no code gate — it's all in the static site.
- Each reading is its own link you can text or post anywhere.
- The free reading on the site should match the free Substack post; the
  members' deep dive only needs to exist on Substack.
