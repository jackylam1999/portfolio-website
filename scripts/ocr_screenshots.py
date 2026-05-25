#!/usr/bin/env python3
"""
Run macOS Vision OCR over each portfolio screenshot and write the recognised
text (with bounding boxes) to a sidecar .txt file. This lets us extract every
piece of body copy, spec value, and section title from the source Readymag
screenshots so we can mirror them in the Next.js content files.

Usage:
    python3 scripts/ocr_screenshots.py
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import Quartz
import Vision
from Foundation import NSURL
from CoreFoundation import CFDictionaryCreate


SOURCE_DIR = Path("/Users/jacky/Desktop/PORTFOLIO WEBSITE")
OUT_DIR = Path("/tmp/portfolio_ocr")
TARGETS = [
    "CV.png",
    "HOME PAGE.png",
    "PARLIAMENT SPORTS COMPLEX.png",
    "SYMBIOSIS.png",
    "STOOL.png",
    "SHACK IN THE PADDYFIELD.png",
    "16 UNITS ABOVE A CITY BREWERY.png",
    "ETERNAL VOYAGE.png",
    "BREATHE ON THE LAND.png",
]


def _ocr_cgimage(cg_image, offset_x: int = 0, offset_y: int = 0) -> list[dict]:
    """OCR a single CGImage. Coordinates are shifted by (offset_x, offset_y)."""
    width = Quartz.CGImageGetWidth(cg_image)
    height = Quartz.CGImageGetHeight(cg_image)

    handler = Vision.VNImageRequestHandler.alloc().initWithCGImage_options_(
        cg_image, {}
    )
    request = Vision.VNRecognizeTextRequest.alloc().init()
    request.setRecognitionLevel_(Vision.VNRequestTextRecognitionLevelAccurate)
    request.setUsesLanguageCorrection_(False)
    request.setRecognitionLanguages_(["en-US"])

    success, error = handler.performRequests_error_([request], None)
    if not success:
        raise RuntimeError(f"OCR failed: {error}")

    observations = request.results() or []
    out = []
    for obs in observations:
        candidates = obs.topCandidates_(1)
        if not candidates:
            continue
        text = candidates[0].string()
        bbox = obs.boundingBox()
        nx, ny = bbox.origin.x, bbox.origin.y
        nw, nh = bbox.size.width, bbox.size.height
        x = int(nx * width) + offset_x
        w = int(nw * width)
        h = int(nh * height)
        y = int((1 - ny - nh) * height) + offset_y
        out.append(
            {
                "text": text,
                "x": x,
                "y": y,
                "w": w,
                "h": h,
                "confidence": candidates[0].confidence(),
            }
        )
    return out


def ocr_image(path: Path, tile_height: int = 2400, overlap: int = 200) -> list[dict]:
    """OCR a (potentially very tall) screenshot by tiling vertically.

    Vision downscales huge images internally which destroys 11px Georgia
    body copy. We crop the image into overlapping vertical tiles and run
    OCR on each tile separately, then merge.
    """
    url = NSURL.fileURLWithPath_(str(path))
    image_source = Quartz.CGImageSourceCreateWithURL(url, None)
    if image_source is None:
        raise RuntimeError(f"Could not open {path}")
    cg_image = Quartz.CGImageSourceCreateImageAtIndex(image_source, 0, None)
    if cg_image is None:
        raise RuntimeError(f"Could not decode {path}")
    width = Quartz.CGImageGetWidth(cg_image)
    height = Quartz.CGImageGetHeight(cg_image)

    if height <= tile_height:
        return _ocr_cgimage(cg_image)

    all_lines: list[dict] = []
    y = 0
    while y < height:
        slice_top = max(0, y - (overlap if y > 0 else 0))
        slice_bottom = min(height, y + tile_height)
        slice_height = slice_bottom - slice_top
        rect = Quartz.CGRectMake(0, slice_top, width, slice_height)
        sub = Quartz.CGImageCreateWithImageInRect(cg_image, rect)
        if sub is not None:
            all_lines.extend(_ocr_cgimage(sub, offset_x=0, offset_y=slice_top))
        y += tile_height

    # Deduplicate (overlap zones produce duplicates).
    seen: dict[tuple, dict] = {}
    for line in all_lines:
        # Bucket by approximate position + text.
        key = (line["text"], line["y"] // 6, line["x"] // 6)
        if key not in seen or seen[key]["confidence"] < line["confidence"]:
            seen[key] = line
    lines = list(seen.values())
    lines.sort(key=lambda l: (l["y"], l["x"]))
    return lines


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for name in TARGETS:
        src = SOURCE_DIR / name
        if not src.exists():
            print(f"SKIP (missing): {src}", file=sys.stderr)
            continue
        print(f"OCR: {name}")
        try:
            lines = ocr_image(src)
        except Exception as exc:
            print(f"  failed: {exc}", file=sys.stderr)
            continue

        base = OUT_DIR / Path(name).stem
        # Plain-text dump for human/agent reading (one line per recognised line).
        txt_path = base.with_suffix(".txt")
        with txt_path.open("w") as f:
            for line in lines:
                f.write(line["text"] + "\n")
        # JSON dump with coordinates so we can group by column / section later.
        json_path = base.with_suffix(".json")
        with json_path.open("w") as f:
            json.dump(lines, f, ensure_ascii=False, indent=2)
        print(f"  wrote {len(lines)} lines -> {txt_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
