/**
 * Drawing composition layout — pure logic tests.
 * Run: node scripts/test-drawing-composition.mjs
 */

function imageHeightRef(img) {
  if (img.displayHeightRef != null) return img.displayHeightRef;
  const w = img.displayWidthRef ?? 100;
  const nw = img.naturalWidth ?? 1600;
  const nh = img.naturalHeight ?? 1200;
  return (w * nh) / nw;
}

function layoutComposition(images) {
  let cursorY = 0;
  const placed = [];
  images.forEach((img, i) => {
    const w = img.displayWidthRef ?? 100;
    const h = imageHeightRef(img);
    const x = img.marginLeftRef ?? 0;
    const mt = i === 0 ? 0 : (img.marginTopRef ?? 0);
    const y = i === 0 ? 0 : cursorY + mt;
    placed.push({ x, y, w, h });
    cursorY = y + h;
  });
  const minX = Math.min(...placed.map((p) => p.x));
  const minY = Math.min(...placed.map((p) => p.y));
  const maxX = Math.max(...placed.map((p) => p.x + p.w));
  const maxY = Math.max(...placed.map((p) => p.y + p.h));
  return {
    frameW: maxX - minX,
    frameH: maxY - minY,
    pieces: placed.map((p) => ({
      x: p.x - minX,
      y: p.y - minY,
      w: p.w,
      h: p.h,
    })),
  };
}

function autoClusterLength(images, start) {
  const BREAK = 280;
  if (start >= images.length) return 0;
  let len = 1;
  let i = start + 1;
  while (i < images.length) {
    const mt = images[i].marginTopRef ?? 0;
    if (mt < 0) {
      len += 1;
      i += 1;
      continue;
    }
    if (len > 1 && mt < BREAK) {
      len += 1;
      i += 1;
      continue;
    }
    break;
  }
  if (len === 1) return 1;
  const hadPullUp = images
    .slice(start + 1, start + len)
    .some((img) => (img.marginTopRef ?? 0) < 0);
  return hadPullUp ? len : 1;
}

let failed = 0;
function assert(name, cond) {
  if (!cond) {
    console.error(`✗ ${name}`);
    failed++;
  } else console.log(`✓ ${name}`);
}

// Corridor-like: 2-up + legends
const corridor = [
  { displayWidthRef: 573, naturalWidth: 1032, naturalHeight: 964, marginLeftRef: 113 },
  { displayWidthRef: 547, naturalWidth: 982, naturalHeight: 937, marginLeftRef: 821, marginTopRef: -535 },
  { displayWidthRef: 147, naturalWidth: 304, naturalHeight: 196, marginLeftRef: 640, marginTopRef: 120 },
  { displayWidthRef: 133, naturalWidth: 276, naturalHeight: 187, marginLeftRef: 1205, marginTopRef: -94 },
];

assert("corridor clusters as one composition", autoClusterLength(corridor, 0) === 4);

const layout = layoutComposition(corridor);
assert("corridor frame wider than one plan", layout.frameW > 700);
assert("legends smaller than plans in frame", layout.pieces[2].w < layout.pieces[0].w * 0.4);
assert(
  "plans share a top row",
  Math.abs(layout.pieces[0].y - layout.pieces[1].y) < 1
);
assert(
  "legend sits below plans",
  layout.pieces[2].y > layout.pieces[0].y + layout.pieces[0].h * 0.5
);

// Stacked overview images with large gaps are NOT one composition
const overview = [
  { displayWidthRef: 700, naturalWidth: 1000, naturalHeight: 1000 },
  { displayWidthRef: 700, naturalWidth: 1000, naturalHeight: 1000, marginTopRef: 604 },
];
assert("large positive gap is not a composition", autoClusterLength(overview, 0) === 1);

if (failed) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log("\nAll composition tests passed.");
