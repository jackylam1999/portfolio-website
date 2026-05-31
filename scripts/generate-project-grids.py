#!/usr/bin/env python3
"""Generate grid JSON from Readymag full-page screenshots."""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path("/Users/jacky/Desktop/PORTFOLIO WEBSITE")
OUT = ROOT / "content" / "grid"

ORIGIN, AREA_W, RIGHT = 813, 1482, 2295
STD, NARROW, FULL = 1058, 736, 1482
AXIS = ORIGIN + 529


def measure_block(arr: np.ndarray, y0: int, y1: int) -> dict | None:
    sub = arr[y0:y1, ORIGIN:RIGHT]
    mask = (sub[:, :, 0] < 248) | (sub[:, :, 1] < 248) | (sub[:, :, 2] < 248)
    if not mask.any():
        return None
    ys, xs = np.where(mask)
    x = ORIGIN + int(xs.min())
    w = int(xs.max() - xs.min() + 1)
    y_ink0 = y0 + int(ys.min())
    y_ink1 = y0 + int(ys.max()) + 1
    return {"x": x, "w": w, "h": y_ink1 - y_ink0, "y0": y_ink0, "y1": y_ink1}


def find_blocks(path: Path) -> list[dict]:
    arr = np.array(Image.open(path).convert("RGB"))
    h = arr.shape[0]
    sub = arr[300 : h - 100, ORIGIN:RIGHT]
    mask = (sub[:, :, 0] < 248) | (sub[:, :, 1] < 248) | (sub[:, :, 2] < 248)
    row = mask.sum(axis=1)
    blocks: list[dict] = []
    in_block = False
    start = 0
    for i, v in enumerate(row):
        if v > 40 and not in_block:
            in_block = True
            start = i
        elif v <= 40 and in_block:
            if i - start > 60:
                m = measure_block(arr, start + 300, i + 300)
                if m and m["h"] > 50 and m["w"] > 80:
                    blocks.append(m)
            in_block = False
    return blocks


def grid_entry(block: dict) -> dict:
    x, w = block["x"], block["w"]
    e: dict = {}
    tier = None
    for name, ref in [("narrow", NARROW), ("standard", STD), ("full", FULL)]:
        if abs(w - ref) <= 45:
            tier = name
            break
    if tier:
        e["widthTier"] = tier
    else:
        e["w"] = w

    if abs(x - ORIGIN) <= 25:
        align = "left"
    elif abs(x + w - RIGHT) <= 25:
        align = "right"
    elif abs(x - (ORIGIN + (AREA_W - w) // 2)) <= 40:
        align = "area"
    elif abs((x + w // 2) - AXIS) <= 50:
        align = "standard"
    else:
        align = "left"
        e["x"] = x

    if align != "left" or tier == "narrow":
        e["align"] = align
    return e


def image_override(block: dict, first: bool, margin_top: int = 0) -> dict:
    o: dict = {}
    w, x = block["w"], block["x"]
    ml = x - ORIGIN

    if abs(w - FULL) <= 45:
        o["displayWidthRef"] = FULL
    elif abs(w - STD) > 45 and abs(w - NARROW) > 45:
        o["displayWidthRef"] = w

    if ml > 30 and not (abs((x + w // 2) - AXIS) <= 50 and abs(w - STD) <= 45):
        o["marginLeftRef"] = ml
    if not first and margin_top > 0:
        o["marginTopRef"] = margin_top
    return o


def build_project(
    screenshot: str,
    section_blocks: dict[str, list[int]],
    page_bottom: int = 149,
    manual: dict[str, dict] | None = None,
) -> tuple[dict, dict[str, list[dict]]]:
    blocks = find_blocks(SOURCE / screenshot)
    images: dict[str, dict] = {}
    overrides: dict[str, list[dict]] = {}
    manual = manual or {}

    section_ids = list(section_blocks.keys())
    section_bottoms: dict[str, int] = {}

    for sid, indices in section_blocks.items():
        chosen = [blocks[i] for i in indices if 0 <= i < len(blocks)]
        if not chosen:
            if sid in manual:
                images[sid] = manual[sid]
            overrides[sid] = []
            continue

        entry = {**grid_entry(chosen[0]), **manual.get(sid, {})}
        images[sid] = entry

        sec_overrides: list[dict] = []
        for j, b in enumerate(chosen):
            mt = 0 if j == 0 else max(9, b["y0"] - chosen[j - 1]["y1"])
            sec_overrides.append(image_override(b, j == 0, mt))
        overrides[sid] = sec_overrides
        section_bottoms[sid] = chosen[-1]["y1"]

    for i, sid in enumerate(section_ids):
        if sid not in section_bottoms or sid not in images:
            continue
        if i + 1 >= len(section_ids):
            break
        nxt = section_ids[i + 1]
        if nxt not in section_blocks:
            continue
        nxt_indices = section_blocks[nxt]
        nxt_chosen = [blocks[j] for j in nxt_indices if 0 <= j < len(blocks)]
        if not nxt_chosen:
            continue
        gap = nxt_chosen[0]["y0"] - section_bottoms[sid]
        if gap > 0:
            images[sid]["gapAfter"] = gap

    return {"images": images, "pageBottom": page_bottom}, overrides


PROJECTS = {
    "shack-in-the-paddyfield": (
        "SHACK IN THE PADDYFIELD.png",
        {
            "overview": [0],
            "context-mapping": [1],
            "sabusawa-rice": [4, 5, 6],
            "farm-with-the-hut": [7],
            "elevation": [8],
            "floor-plan": [10, 11, 12],
            "section": [15],
            "hut-in-seasons": [13],
            "exploded": [16],
        },
        {
            "floor-plan": {"w": 671, "align": "left", "x": 813},
            "section": {"w": 1280, "align": "left", "x": 813},
            "hut-in-seasons": {"widthTier": "full", "align": "left"},
        },
    ),
    "eternal-voyage": (
        "ETERNAL VOYAGE.png",
        {
            "overview": [0],
            "water-infrastructure": [1],
            "transect-sections": [2, 3, 4],
            "masterplan": [6],
            "dam": [7],
            "pivot-irrigation-cycle": [8],
            "4wd-on-the-field": [9, 10],
            "4wd-in-motion": [11],
            "ranger-station": [12, 13],
            "station-to-wetland": [14],
            "water-treatment-plant": [12, 13],
            "sewage-canal-to-pool": [14],
        },
        {
            "overview": {
                "w": 1217,
                "x": 945,
                "align": "area",
                "gapAfter": 563,
            },
            "water-infrastructure": {"w": 935, "align": "left", "x": 813},
            "masterplan": {"widthTier": "standard", "align": "standard"},
            "dam": {"w": 442, "align": "left", "x": 813},
            "pivot-irrigation-cycle": {"w": 1115, "align": "left", "x": 879},
            "4wd-on-the-field": {"w": 1324, "align": "left", "x": 813},
            "ranger-station": {"w": 1324, "align": "left", "x": 813},
            "water-treatment-plant": {"w": 1199, "align": "left", "x": 813},
        },
    ),
    "breathe-on-the-land": (
        "BREATHE ON THE LAND.png",
        {
            "overview": [0, 1, 2],
            "edge-conditions": [4],
            "ground-floor-plan": [6],
            "first-floor-plan": [7],
            "open-air-corridor": [8, 9],
            "construction-details": [10],
            "corridor-floor-plan": [11, 12, 13, 14],
            "co-working": [15],
            "childcare": [16],
            "grassland-domesticity": [18],
            "build-on-the-land": [21],
            "net-zero-carbon": [17, 19, 20],
            "adaptability": [18, 19, 20],
            "flexibility": [21],
        },
        {
            "overview": {"w": 1267, "align": "left", "x": 813},
            "edge-conditions": {"widthTier": "standard", "align": "standard", "x": 891},
            "ground-floor-plan": {"w": 1242, "align": "left", "x": 813},
            "first-floor-plan": {"w": 1235, "align": "left", "x": 813},
            "open-air-corridor": {"w": 1009, "align": "left", "x": 813},
            "construction-details": {"w": 1165, "align": "right", "x": 1130},
            "co-working": {"w": 1183, "align": "left", "x": 813},
            "childcare": {"w": 815, "align": "standard", "x": 1045},
            "grassland-domesticity": {"widthTier": "narrow", "align": "standard", "x": 980},
            "build-on-the-land": {"w": 846, "align": "standard", "x": 954},
            "flexibility": {"w": 846, "align": "standard", "x": 954},
        },
    ),
}


def main() -> int:
    for slug, (fname, sections, manual) in PROJECTS.items():
        grid, overrides = build_project(fname, sections, manual=manual)
        (OUT / f"{slug}.json").write_text(json.dumps(grid, indent=2) + "\n")
        (OUT / f"{slug}.overrides.json").write_text(json.dumps(overrides, indent=2) + "\n")
        print(f"{slug}: {len(grid['images'])} sections, {len(find_blocks(SOURCE / fname))} blocks")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
