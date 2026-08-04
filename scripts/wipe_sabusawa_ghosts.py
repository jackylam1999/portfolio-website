#!/usr/bin/env python3
"""Remove baked-in project-index ghost text from sabusawa rice.webp."""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "public/images/projects/shack-in-the-paddyfield"
REF = Path("/Users/jacky/Desktop/PORTFOLIO WEBSITE/SHACK IN THE PADDYFIELD.png")
OUT_DIR = ROOT / ".verify-screenshots/overlays"
BAND = (813, 2350, 2115, 4110)

# OCR line boxes in plate coords (Stool / Eternal Voyage / Symbiosis), padded
LINES = [
    (500, 185, 1100, 215),
    (500, 203, 1100, 240),
    (500, 233, 1100, 275),
    (500, 1380, 1100, 1410),
    (500, 1402, 1100, 1438),
    (500, 1432, 1100, 1472),
]


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    final = np.array(Image.open(REF).crop(BAND).convert("RGB"))
    for x0, y0, x1, y1 in LINES:
        final[y0:y1, x0:x1] = 255

    out = Image.fromarray(final)
    out.crop((480, 170, 1120, 290)).save(OUT_DIR / "sabusawa-wipe6-upper.png")
    out.crop((480, 1365, 1120, 1485)).save(OUT_DIR / "sabusawa-wipe6-lower.png")
    out.save(OUT_DIR / "sabusawa-rice-cleaned.png")
    out.save(BASE / "sabusawa rice.webp", "WEBP", quality=92, method=6)

    for label, y0, y1 in (("upper", 185, 275), ("lower", 1380, 1472)):
        rows = (final[y0:y1, 500:1100].mean(2) < 150).sum(1)
        print(label, "max dark/row", int(rows.max()), "rows>80", int((rows > 80).sum()))
    print("wrote", BASE / "sabusawa rice.webp")


if __name__ == "__main__":
    main()
