#!/usr/bin/env python3
"""Regenerate assets/og/social.png with today's actual moon phase.

The canonical SVG (assets/og/social.svg) stays untouched. This script
reads it, computes today's moon phase using the same synodic constants
the site's main.js uses, draws a soft semi-transparent terminator over
the gold disc (so the moon still reads as luminous in link previews
even at new moon), renders to PNG via rsvg-convert (Linux CI) or sips
(macOS local), and bumps the ?v= cache-buster on every og:image and
twitter:image URL across the site so messaging apps refetch.

Run by .github/workflows/og-moon-phase.yml once a day. Safe to run by
hand any time.
"""

import math
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

SYNODIC = 29.530588853
KNOWN_NEW_MOON = datetime(2000, 1, 6, 18, 14, tzinfo=timezone.utc)

# Per-target configuration. Each entry renders a phase-tracking PNG
# from the named SVG, with target-specific moon coordinates + ring
# proportions so the gold corona reads consistently at every output
# size. Laura 2026-06-13: 'we can do the tab also to match!!!' —
# the icon outputs make the favicon + apple-touch + PWA icons live
# the same look as the OG.
#
# Field guide:
#   svg            source SVG path (relative to ROOT)
#   png            output PNG path
#   width, height  output pixel dimensions (sips/rsvg both honour this)
#   cx, cy, r      moon centre + radius in the SVG's viewBox
#   ring_offset    primary gold ring radius offset from disc edge
#   ring_width     primary gold ring stroke width (in SVG units)
#   glow_offset    soft outer corona radius offset from disc edge
#   glow_width     soft outer corona stroke width
TARGETS = [
    {
        "svg": "assets/og/social.svg",
        "png": "assets/og/social.png",
        "width": 1200, "height": 630,
        "cx": 600, "cy": 305, "r": 135,
        "ring_offset": 17, "ring_width": 4.0,
        "glow_offset": 32, "glow_width": 6.0,
    },
    {
        "svg": "assets/og/icon.svg",
        "png": "assets/og/icon-512.png",
        "width": 512, "height": 512,
        "cx": 256, "cy": 256, "r": 155,
        "ring_offset": 20, "ring_width": 5.0,
        "glow_offset": 37, "glow_width": 7.0,
    },
    {
        "svg": "assets/og/icon.svg",
        "png": "assets/og/icon-192.png",
        "width": 192, "height": 192,
        "cx": 256, "cy": 256, "r": 155,
        "ring_offset": 20, "ring_width": 5.0,
        "glow_offset": 37, "glow_width": 7.0,
    },
    {
        "svg": "assets/og/icon.svg",
        "png": "assets/og/apple-touch-icon.png",
        "width": 180, "height": 180,
        "cx": 256, "cy": 256, "r": 155,
        "ring_offset": 20, "ring_width": 5.0,
        "glow_offset": 37, "glow_width": 7.0,
    },
]

# Solid obsidian shadow (matches the hero on the homepage —
# .moon-shadow uses background:var(--obsidian) at full opacity).
# Laura 2026-06-12: 'make the OG match the hero so it goes black in
# the middle at new moon, and black-and-gold depending on what phase
# the moon is in.' Previous pass used a translucent navy so the gold
# bled through at new moon; that's intentional out.
SHADOW_OPACITY = 1.0
SHADOW_FILL = "#070608"     # --obsidian on the site

# Permanent gold ring AROUND the moon — sits just outside the disc and
# stays visible at every phase, including pitch-black new moon. Echoes
# the hero's .moon-stage::after gilded ring at inset:-24px.
# Laura 2026-06-13: 'I want it to still have a gold ring around it
# when it's the new moon and also keep progressing as the moon
# changes so it always reflects that.' Pass 2 same day: original ring
# was too thin to read at link-preview scale (iMessage ~280px → 1.6px
# stroke becomes sub-pixel). Bumping to a much more present ring:
# wider stroke, full opacity, slightly further out for a clear gap.
RING_R_OFFSET   = 17        # px outside the disc edge (r=135 → ring at 152)
RING_STROKE     = "#E5C77B" # --gold-bright on the site
RING_OPACITY    = 1.0
RING_WIDTH      = 4.0       # was 1.6 — survives down-scaling to thumbnail size

# Softer outer corona glow — a second wider ring at low opacity that
# gives the moon the "halo" feel even when the platform's preview
# shrinks the image. Sits beyond the primary ring.
GLOW_R_OFFSET   = 32        # px outside the disc edge (r=135 → glow at 167)
GLOW_STROKE     = "#E5C77B"
GLOW_OPACITY    = 0.30
GLOW_WIDTH      = 6.0


def phase_fraction(when):
    """Return moon phase as a fraction 0..1 (0 = new, 0.5 = full)."""
    days = (when - KNOWN_NEW_MOON).total_seconds() / 86400.0
    f = (days / SYNODIC) % 1.0
    if f < 0:
        f += 1.0
    return f


def shadow_path(cx, cy, r, phase):
    """SVG path tracing the unlit portion of the moon at this phase.

    Two arcs:
      1. A semicircle on the unlit side (left when waxing, right when
         waning), top to bottom.
      2. An elliptical arc with rx = |cos(phase angle)| * r tracing the
         terminator from bottom back to top.

    At new moon the terminator coincides with the full circle (shadow =
    whole disc). At full moon the terminator coincides with the lit
    semicircle (shadow = empty). At quarters rx = 0 and the terminator
    is a straight line.
    """
    phi = 2 * math.pi * phase
    c = math.cos(phi)
    rx = abs(c) * r
    waxing = phase < 0.5

    top_x, top_y = cx, cy - r
    bot_x, bot_y = cx, cy + r

    # Unlit-side semicircle sweep (top -> bottom)
    #   waxing  -> shadow on left  -> arc bows left  -> counter-clockwise (0)
    #   waning  -> shadow on right -> arc bows right -> clockwise (1)
    circ_sweep = 0 if waxing else 1

    # Terminator arc (bottom -> top). The bow direction depends on
    # whether the moon is gibbous (c<0, terminator bows into the shadow,
    # leaving most of the disc lit) or crescent (c>0, terminator bows
    # away from the shadow, leaving a thin sliver lit).
    if waxing:
        term_sweep = 0 if c > 0 else 1
    else:
        term_sweep = 1 if c > 0 else 0

    return (
        f"M {top_x} {top_y} "
        f"A {r} {r} 0 0 {circ_sweep} {bot_x} {bot_y} "
        f"A {rx:.4f} {r} 0 0 {term_sweep} {top_x} {top_y} Z"
    )


def inject_shadow(svg_text, phase, target):
    """Insert the phase shadow + permanent gold corona ring + soft glow.

    Target carries the moon coordinates + ring proportions specific to
    that SVG (the OG and icon SVGs have different canvas sizes and
    moon radii, so the ring offsets and stroke widths differ).

    Layers added on top of the existing gold disc:
      1. Phase shadow — covers the unlit portion (solid obsidian).
      2. Soft outer corona ring (wider, lower opacity) — the halo feel.
      3. Primary gold ring — the moon's definite outline at every phase.
    """
    cx, cy, r = target["cx"], target["cy"], target["r"]
    path_d = shadow_path(cx, cy, r, phase)
    shadow_el = (
        f'  <path d="{path_d}" fill="{SHADOW_FILL}" '
        f'fill-opacity="{SHADOW_OPACITY}"/>\n'
    )
    glow_r = r + target["glow_offset"]
    glow_el = (
        f'  <circle cx="{cx}" cy="{cy}" r="{glow_r}" '
        f'fill="none" stroke="{GLOW_STROKE}" '
        f'stroke-opacity="{GLOW_OPACITY}" '
        f'stroke-width="{target["glow_width"]}"/>\n'
    )
    ring_r = r + target["ring_offset"]
    ring_el = (
        f'  <circle cx="{cx}" cy="{cy}" r="{ring_r}" '
        f'fill="none" stroke="{RING_STROKE}" '
        f'stroke-opacity="{RING_OPACITY}" '
        f'stroke-width="{target["ring_width"]}"/>\n'
    )

    marker = (
        f'<circle cx="{cx}" cy="{cy}" r="{r}" '
        f'fill="url(#moonGold)"/>'
    )
    if marker not in svg_text:
        sys.exit(f"Could not find moon disc marker in {target['svg']}")
    return svg_text.replace(marker, marker + "\n" + shadow_el + glow_el + ring_el, 1)


def svg_to_png(svg_path, png_path, width, height):
    """Render SVG to PNG at the given dimensions.
    Try rsvg-convert (Linux CI) first, then sips (macOS local).
    sips can't size-control SVG input directly, so we render then
    z-resize."""
    if shutil.which("rsvg-convert"):
        subprocess.run(
            ["rsvg-convert", "-w", str(width), "-h", str(height),
             "-o", str(png_path), str(svg_path)],
            check=True,
        )
        return "rsvg-convert"
    if shutil.which("sips"):
        # sips renders the SVG at its natural dimensions, then we
        # resize to the target. Two-step but works without rsvg.
        subprocess.run(
            ["sips", "-s", "format", "png", str(svg_path),
             "--out", str(png_path)],
            check=True, stdout=subprocess.DEVNULL,
        )
        subprocess.run(
            ["sips", "-z", str(height), str(width), str(png_path)],
            check=True, stdout=subprocess.DEVNULL,
        )
        return "sips"
    sys.exit("Need rsvg-convert (Linux) or sips (macOS) on PATH.")


def bump_cache_buster(stamp):
    """Update every og:image / twitter:image / icon ?v= to a fresh value.

    Always rolls to a NEW value, even on same-day re-runs, so re-renders
    on the same day force social platforms + browsers to refetch. If
    today's date already appears across the files, we add an alpha suffix
    that picks up where the previous run left off (20260613 → 20260613b
    → 20260613c). The same value is applied to OG image, twitter image,
    apple-touch-icon, and the manifest icons — one cache-buster value
    per day across all the brand assets.
    """
    # Matches social.png, icon-192.png, icon-512.png, apple-touch-icon.png
    pattern = re.compile(r"(og/(?:social|icon-192|icon-512|apple-touch-icon)\.png\?v=)([\w.-]+)")
    targets = (list(ROOT.glob("*.html"))
               + [ROOT / "pendulum/index.html"]
               + [ROOT / "manifest.webmanifest"])

    # Look at the highest existing version across the targets to know
    # what to bump TO. If it's not today's date yet, we just write
    # today's date. If it's today's date already, we add (or roll) a
    # lowercase letter suffix.
    existing = set()
    for html in targets:
        if not html.exists():
            continue
        for m in pattern.finditer(html.read_text()):
            existing.add(m.group(2))

    def _next_value():
        same_day = sorted(v for v in existing if v == stamp or v.startswith(stamp))
        if not same_day:
            return stamp
        last = same_day[-1]
        # last is either "YYYYMMDD" → bump to "YYYYMMDDb", or
        # "YYYYMMDD<letter>" → bump the letter.
        if last == stamp:
            return f"{stamp}b"
        suffix = last[len(stamp):]
        if len(suffix) == 1 and suffix.isalpha() and suffix < "z":
            return f"{stamp}{chr(ord(suffix) + 1)}"
        # Fall through: just append an 'a' incrementally.
        return f"{stamp}{suffix}a"

    new_value = _next_value()
    changed = 0
    for html in targets:
        if not html.exists():
            continue
        text = html.read_text()
        updated = pattern.sub(rf"\g<1>{new_value}", text)
        if updated != text:
            html.write_text(updated)
            changed += 1
    return changed, new_value


def main():
    when = datetime.now(timezone.utc)
    phase = phase_fraction(when)
    illum = (1 - math.cos(2 * math.pi * phase)) / 2
    waxing = phase < 0.5

    print(
        f"[og-moon-phase] {when.isoformat(timespec='minutes')} "
        f"phase={phase:.4f} illum={illum:.3f} "
        f"{'waxing' if waxing else 'waning'}"
    )

    # Per-source caching: read each unique source SVG once, even if
    # multiple targets render from it (icon.svg → three PNG sizes).
    source_cache: dict[str, str] = {}
    renderer_used = None

    for target in TARGETS:
        svg_path = ROOT / target["svg"]
        png_path = ROOT / target["png"]

        # Read + inject shadow + ring (or use cached source if the
        # same SVG was already processed this run).
        if str(svg_path) not in source_cache:
            source_cache[str(svg_path)] = svg_path.read_text()
        out_svg_text = inject_shadow(source_cache[str(svg_path)], phase, target)

        # Render via a temp SVG so the canonical templates stay clean.
        tmp_svg = svg_path.with_name(svg_path.stem + f".today-{target['width']}.svg")
        tmp_svg.write_text(out_svg_text)
        try:
            renderer_used = svg_to_png(
                tmp_svg, png_path, target["width"], target["height"]
            )
        finally:
            tmp_svg.unlink(missing_ok=True)
        print(f"  → {target['png']} ({target['width']}x{target['height']}) via {renderer_used}")

    stamp = when.strftime("%Y%m%d")
    n, new_value = bump_cache_buster(stamp)
    print(f"[og-moon-phase] rendered {len(TARGETS)} target(s); bumped ?v={new_value} in {n} files")


if __name__ == "__main__":
    main()
