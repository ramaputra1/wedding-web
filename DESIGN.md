# DESIGN.md — Wedding Invitation

Single source of truth for the look: a dusty-blue (`#90a4af`) felt envelope sealed with an ivory
wax seal, opening to a deep navy lining.

## Mood
Quiet, tactile, editorial. Paper and felt, not glossy. Lots of air. One script face used sparingly
for names only; everything else is a classic serif.

## Colour tokens (`css/style.css` `:root`)
| Token | Hex | Use |
|---|---|---|
| `--blue` | `#90a4af` | **Theme colour.** Envelope felt, desktop side panel, heart card, portraits |
| `--blue-light` | `#9cafb9` | Envelope side flaps |
| `--blue-deep` | `#546a76` | Dark sections with light text (RSVP, closing) |
| `--navy` | `#2f4450` | Buttons, labels, ornaments, accents, envelope lining |
| `--navy-deep` | `#22333d` | Text on `--blue`, hover/pressed states |
| `--night` | `#1c2a33` | First-look screen ground |
| `--cream` | `#f5f6f3` | Page ground |
| `--paper` | `#e8edef` | Alternate section ground, cards |
| `--ivory` | `#f4f2ec` | Text on dark blues, wax seal |
| `--ink` | `#1f2a31` | Body text |
| `--muted` | `#5a6872` | Secondary text (≥4.5:1 on cream and paper) |

Contrast rule: `--blue` is light, so text on it is always `--navy-deep` (never ivory: ~2.2:1).
Light text only sits on `--blue-deep`, `--navy` or `--night`.

Rule: a section is cream, paper, blue-deep, navy or night — flat, with a faint felt/paper noise.
No gradients other than the wax seal's sheen and the silver frame.

## Type
- **Names / monogram:** `Allura` (Google Fonts) — a thin, legible script: clearer than a heavy
  flourish face, lighter than a bold/chubby one. Only for the couple's names, the seal monogram
  and the closing signature. Never below 40px.
- **Everything else:** `Cormorant Garamond` 400/500/600 + italic.
  - Labels: uppercase, `letter-spacing: .28em`, 12–13px, weight 600.
  - Section titles: italic 300/400, 36–44px.
  - Body: 18–19px, line-height 1.6 (Cormorant runs small).

## Layout
- Mobile-first single column, content max 560px, 24px side gutter.
- ≥1024px: a sticky felt panel on the left (names, date, guest) and the scrolling invitation on
  the right (max 600px column).
- Section rhythm: 96px vertical padding (72px on phones). Centred text.
- Radii: 2px on cards/inputs (paper corners), full round only for the seal and avatars.
- Navigation: after the envelope opens, a floating bottom navbar (night-blue pill, icon + label):
  Home · Story · Event · Gallery · RSVP · Gift (opens the Support Us pop-up) · EN/ID.
  The item for the section in view is highlighted. On desktop it is centred under the invitation column.

## First look (first screen after the envelope)
A layered paper collage on deep night-blue: a silver arch frame, a pale note with the script
"Save our Date", a white photostrip (3 photos), a dusty-blue heart card (date + place), and a
decorative vinyl record with the monogram. Optional cut-out decorations (frame, paper, lily, greenery, lace)
are image slots in `config.firstLook`; empty slots show as faint dashed outlines. Below it: the
countdown, a script tagline, the RSVP button, contact line and the couple's names.

## Ornament
A small hand-drawn sprig (inline SVG, navy) between label and title. Thin 1px rules in `--line`.

## Motion
- Envelope: seal + text fade (0.4s) → top flap rotates open revealing the navy lining (0.9s) →
  letter slides up (0.8s) → cover fades (0.6s). Total ≈ 2.4s.
- Sections: a single gentle rise-and-fade (16px, 0.8s) when they enter the viewport, once.
- Hover: buttons darken and lift 1px; press returns. Photos zoom 1.03 inside their frame.
- `prefers-reduced-motion`: everything is instant, nothing stays hidden.

## Voice
Warm and short. Bilingual (English default, Indonesian toggle). The guest's name (from `?to=`) is
the only personalised text.
