#!/usr/bin/env python3
"""Measure Readymag layout from a full-page screenshot and emit grid JSON.

Grid model (see content/grid/site.json + registry.ts):
  · Page margin (22) + text column (642) + gap (149) → image area left (813)
  · Image area width (1482) ends before the drawing bar (right reserve 265)
  · Width tiers: narrow 736, standard 1058, full 1482 (100% of image area)
  · Align: left | standard (axis at 813+529=1342) | area | right

Usage:
  python3 scripts/measure-readymag-grid.py parliament-sports-complex
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path("/Users/jacky/Desktop/PORTFOLIO WEBSITE")
OUT = ROOT / "content" / "grid"

ORIGIN = 813
AREA_W = 1482
AXIS = ORIGIN + 529  # standard axis
FULL = AREA_W
STD = 1058
NARROW = 736

SCREENSHOTS = {
    "parliament-sports-complex": {
        "file": "PARLIAMENT SPORTS COMPLEX.png",
        "sections": [
            ("overview", 300, 1020, STD, "standard", False),
            ("site-plan", 1180, 1970, STD, "standard", False),
            ("floor-plan-2", 2140, 2520, FULL, "left", False),
            ("floor-plan-g", 2500, 2850, FULL, "left", False),
            ("floor-plan-b2", 2850, 3200, FULL, "left", False),
            ("side-street", 5340, 6260, NARROW, "left", False),
            ("basement-hall", 6370, 7290, NARROW, "left", False),
            ("undercroft-transit", 7330, 8310, NARROW, "left", False),
            ("cricket-practice", 8410, 9340, NARROW, "left", False),
            ("sports-hall", 9440, 10370, NARROW, "left", False),
            ("elevation-west", 10530, 11240, FULL, "left", False),
            ("section-west", 11420, 12220, STD, "standard", False),
            ("detail-section-west", 12420, 13170, FULL, "left", False),
            ("section-east", 13220, 14100, FULL, "left", False),
            ("detail-section-east", 14340, 15130, NARROW, "left", False),
        ],
    },
}


def load_mask(path: Path) -> np.ndarray:
    arr = np.array(Image.open(path).convert("RGB"))
    return (arr[:, :, 0] < 248) | (arr[:, :, 1] < 248) | (arr[:, :, 2] < 248)


def ink_bbox(mask: np.ndarray, y0: int, y1: int, x0: int = 550, x1: int = 2100):
    sub = mask[y0:y1, x0:x1]
    ys, xs = np.where(sub)
    if len(xs) == 0:
        return None
    return {
        "x": x0 + int(xs.min()),
        "w": int(xs.max() - xs.min() + 1),
        "y0": y0 + int(ys.min()),
        "y1": y0 + int(ys.max()) + 1,
        "h": int(ys.max() - ys.min() + 1),
    }


def left_for(w: int, align: str) -> int:
    if align == "left":
        return ORIGIN
    if align == "right":
        return ORIGIN + AREA_W - w
    if align == "area":
        return ORIGIN + (AREA_W - w) // 2
    return AXIS - w // 2


def clamp_to_area(x: int, w: int) -> tuple[int, int]:
    """Keep measured box inside the image area (813 → 2295)."""
    clamped_w = min(w, AREA_W)
    clamped_x = max(ORIGIN, min(x, ORIGIN + AREA_W - clamped_w))
    return clamped_x, clamped_w


def tier_for_width(w: int) -> str | None:
    for name, tw in [("narrow", NARROW), ("standard", STD), ("full", FULL)]:
        if abs(w - tw) <= 24:
            return name
    return None


def main() -> int:
    slug = sys.argv[1] if len(sys.argv) > 1 else "parliament-sports-complex"
    cfg = SCREENSHOTS.get(slug)
    if not cfg:
        print(f"No screenshot config for slug: {slug}", file=sys.stderr)
        return 1
    path = SOURCE / cfg["file"]
    if not path.exists():
        print(f"Missing screenshot: {path}", file=sys.stderr)
        return 1

    mask = load_mask(path)
    images: dict[str, dict] = {}
    prev_bottom: int | None = None

    for section_id, y0, y1, default_w, default_align, crop in cfg["sections"]:
        x_scan = ORIGIN if default_align == "left" else 550
        bb = ink_bbox(mask, y0, y1, x_scan, 2100)
        if not bb:
            print(f"  skip {section_id}: no ink in band", file=sys.stderr)
            continue

        w = bb["w"]
        x, w = clamp_to_area(bb["x"], w)
        align = default_align
        entry: dict = {}
        tier = tier_for_width(w)
        if tier and abs(w - default_w) <= 30:
            entry["widthTier"] = tier
        else:
            entry["w"] = w
        calc_x = left_for(entry.get("w", default_w), align)
        # Only store explicit x when it differs from grid align AND stays in bounds.
        if abs(x - calc_x) > 12 and x >= ORIGIN and x + w <= ORIGIN + AREA_W:
            entry["x"] = x
        if crop:
            entry["h"] = bb["h"]
        if prev_bottom is not None:
            gap = bb["y0"] - prev_bottom
            if gap > 0:
                entry["gapAfter"] = gap
        if align != "left" or tier == "narrow":
            entry["align"] = align
        images[section_id] = entry
        prev_bottom = bb["y1"]
        print(
            f"{section_id:22s} w={w:4d} h={bb['h']:4d} x={x:4d} "
            f"gapAfter={entry.get('gapAfter', '-')}"
        )

    out_path = OUT / f"{slug}.json"
    out_path.write_text(json.dumps({"images": images}, indent=2) + "\n")
    print(f"\nWrote {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
