# Narration — recording in your own voice

There is **no robot voice** on the site. Everything spoken is a real
recording in Luna Wilde's voice, and whatever is playing **keeps
playing as you move between pages** (it saves its place and resumes).

## The Welcome
`assets/audio/invocation.mp3` is the default track in the player bar
(bottom-right). Press play and it follows you around the whole site.
To replace it, just record a new file and overwrite that filename
(or change `data-welcome="…"` on the `#mmPlayer` div).

## Narrating any longer passage (in your voice)
1. Record an MP3 (phone voice memo is fine — export/convert to .mp3).
2. Drop it in `assets/audio/`  (e.g. `aries-guide-intro.mp3`).
3. On the section you want narrated, add two attributes:

   ```html
   <section data-audio="assets/audio/aries-guide-intro.mp3"
            data-audio-label="The Aries Reading">
   ```

That's it. A gold **“Listen in Luna’s voice”** button appears at the
top of that section. Tapping it plays your recording through the same
player bar — so it continues if the visitor clicks to another page.

## Product previews
A product can have a voice intro too. In `assets/js/shop.js`, add an
`audio:` field to any product:

```js
{ cat:'…', glyph:'Aries', name:'Aries Moon Money Guide',
  desc:'…', link:'', prev:'aries.png',
  audio:'assets/audio/aries-guide-intro.mp3' }
```

The preview will then show a **“Listen in Luna’s voice”** button.
No `audio:` = no button (no robot fallback — recordings only).

## Tips
- Keep files reasonably small (a few MB). MP3 at ~96–128 kbps is plenty
  for voice.
- The speed control (1× / 1.25× / 1.5× / 0.85×) works on every
  recording and is remembered per visitor.
- Same filename overwrite = instant update, no code change.
