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
SVG = ROOT / "assets/og/social.svg"
PNG = ROOT / "assets/og/social.png"

SYNODIC = 29.530588853
KNOWN_NEW_MOON = datetime(2000, 1, 6, 18, 14, tzinfo=timezone.utc)

# Where the moon is drawn in the SVG (must match social.svg)
MOON_CX, MOON_CY, MOON_R = 600, 305, 135

# Solid obsidian shadow (matches the hero on the homepage —
# .moon-shadow uses background:var(--obsidian) at full opacity).
# Laura 2026-06-12: 'make the OG match the hero so it goes black in
# the middle at new moon, and black-and-gold depending on what phase
# the moon is in.' Previous pass used a translucent navy so the gold
# bled through at new moon; that's intentional out.
SHADOW_OPACITY = 1.0
SHADOW_FILL = "#070608"     # --obsidian on the site

# Permanent gold corona ring — sits just outside the disc and stays
# visible at every phase, including pitch-black new moon. Matches the
# hero's .moon-stage::after gilded ring at inset:-24px.
# Laura 2026-06-13: 'I want it to still have a gold ring around it
# when it's the new moon and also keep progressing as the moon
# changes so it always reflects that.'
RING_R_OFFSET   = 13        # px outside the disc edge (r=135 → ring at 148)
RING_STROKE     = "#E5C77B" # --gold-bright on the site
RING_OPACITY    = 0.78
RING_WIDTH      = 1.6


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


def inject_shadow(svg_text, phase):
    """Insert the phase shadow path + a permanent gold corona ring.

    Layers added on top of the existing gold disc:
      1. Phase shadow — covers the unlit portion (solid obsidian).
      2. Gold corona ring at r=MOON_R+13 — always visible, gives the
         moon a definite outline even at pitch-black new moon. Echoes
         the hero's .moon-stage::after gilded ring.
    """
    path_d = shadow_path(MOON_CX, MOON_CY, MOON_R, phase)
    shadow_el = (
        f'  <path d="{path_d}" fill="{SHADOW_FILL}" '
        f'fill-opacity="{SHADOW_OPACITY}"/>\n'
    )
    ring_r = MOON_R + RING_R_OFFSET
    ring_el = (
        f'  <circle cx="{MOON_CX}" cy="{MOON_CY}" r="{ring_r}" '
        f'fill="none" stroke="{RING_STROKE}" '
        f'stroke-opacity="{RING_OPACITY}" '
        f'stroke-width="{RING_WIDTH}"/>\n'
    )

    marker = (
        f'<circle cx="{MOON_CX}" cy="{MOON_CY}" r="{MOON_R}" '
        f'fill="url(#moonGold)"/>'
    )
    if marker not in svg_text:
        sys.exit(f"Could not find moon disc marker in {SVG}")
    return svg_text.replace(marker, marker + "\n" + shadow_el + ring_el, 1)


def svg_to_png(svg_path, png_path):
    """Try rsvg-convert (Linux CI) first, then sips (macOS local)."""
    if shutil.which("rsvg-convert"):
        subprocess.run(
            ["rsvg-convert", "-w", "1200", "-h", "630",
             "-o", str(png_path), str(svg_path)],
            check=True,
        )
        return "rsvg-convert"
    if shutil.which("sips"):
        subprocess.run(
            ["sips", "-s", "format", "png", str(svg_path),
             "--out", str(png_path)],
            check=True, stdout=subprocess.DEVNULL,
        )
        return "sips"
    sys.exit("Need rsvg-convert (Linux) or sips (macOS) on PATH.")


def bump_cache_buster(stamp):
    """Update every og:image and twitter:image ?v= to a fresh value.

    Always rolls to a NEW value, even on same-day re-runs, so re-renders
    on the same day force social platforms to refetch. If today's date
    already appears across the files, we add an alpha suffix that picks
    up where the previous run left off (20260613 → 20260613b → 20260613c).
    """
    pattern = re.compile(r"(og/social\.png\?v=)([\w.-]+)")
    targets = list(ROOT.glob("*.html")) + [ROOT / "pendulum/index.html"]

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

    svg_text = SVG.read_text()
    out_svg_text = inject_shadow(svg_text, phase)

    # Render via a temp SVG so the canonical template stays clean.
    tmp_svg = SVG.with_name("social.today.svg")
    tmp_svg.write_text(out_svg_text)
    try:
        renderer = svg_to_png(tmp_svg, PNG)
    finally:
        tmp_svg.unlink(missing_ok=True)

    stamp = when.strftime("%Y%m%d")
    n, new_value = bump_cache_buster(stamp)
    print(f"[og-moon-phase] rendered via {renderer}; bumped ?v={new_value} in {n} files")


if __name__ == "__main__":
    main()
