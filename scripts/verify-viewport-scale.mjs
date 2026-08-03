/**
 * Viewport vertical scale — available left-text height vs old width-only floors.
 * Run: node scripts/verify-viewport-scale.mjs
 */

const REF_W = 2560;
const REF_VH = 900;

function clamp(min, val, max) {
  return Math.min(max, Math.max(min, val));
}

function oldContentTop(vw) {
  return clamp(220, (vw * 312) / REF_W, 312);
}

function oldSpecTop(vw) {
  return clamp(200, (vw * 242) / REF_W, 242);
}

function newContentTop(vw, vh) {
  return Math.min(oldContentTop(vw), (vh * 220) / REF_VH);
}

function newSpecTop(vw, vh) {
  return Math.min(oldSpecTop(vw), (vh * 200) / REF_VH);
}

function availableText(vh, specTop) {
  return vh - specTop - 24;
}

const viewports = [
  [1440, 900],
  [1920, 1080],
  [1280, 720],
  [2560, 1080],
  [1512, 982], // 14" MacBook-ish
];

let failed = 0;
function assert(name, cond) {
  if (!cond) {
    console.error(`✗ ${name}`);
    failed += 1;
  } else {
    console.log(`✓ ${name}`);
  }
}

console.log("viewport | old content-top → new | old avail → new avail\n");
for (const [vw, vh] of viewports) {
  const oc = oldContentTop(vw);
  const nc = newContentTop(vw, vh);
  const os = oldSpecTop(vw);
  const ns = newSpecTop(vw, vh);
  const oa = availableText(vh, os);
  const na = availableText(vh, ns);
  console.log(
    `${vw}×${vh}: content ${oc.toFixed(0)}→${nc.toFixed(0)}px  textAvail ${oa.toFixed(0)}→${na.toFixed(0)}px`
  );
}

// Mac reference unchanged
assert(
  "1440×900 content-top stays 220",
  Math.abs(newContentTop(1440, 900) - 220) < 0.5
);
assert(
  "1440×900 available text unchanged",
  Math.abs(availableText(900, newSpecTop(1440, 900)) - availableText(900, oldSpecTop(1440, 900))) < 0.5
);

// Short screen gains room for left copy
assert(
  "1280×720 content-top shrinks below old floor",
  newContentTop(1280, 720) < oldContentTop(1280)
);
assert(
  "1280×720 available text height increases",
  availableText(720, newSpecTop(1280, 720)) >
    availableText(720, oldSpecTop(1280))
);

// Ultrawide short: height caps chrome so first viewport isn't empty band
assert(
  "2560×1080 content-top height-capped below width max",
  newContentTop(2560, 1080) < oldContentTop(2560)
);

if (failed) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log("\nAll viewport scale checks passed.");
