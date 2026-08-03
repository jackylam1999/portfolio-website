/**
 * Viewport scale — content-top + font vs Mac 1440×900 reference.
 * Run: node scripts/verify-viewport-scale.mjs
 */

const REF_W = 2560;
const REF_VW = 1440;
const REF_VH = 900;
const FONT_MAC = 13.5;

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

/** Matches globals.css --font-site */
function fontSite(vw, vh) {
  return clamp(
    10,
    Math.min((vw * FONT_MAC) / REF_VW, (vh * FONT_MAC) / REF_VH),
    17
  );
}

const viewports = [
  [1440, 900],
  [1920, 1080],
  [1280, 720],
  [2560, 1080],
  [1512, 982],
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

console.log("viewport | content-top | textAvail | font\n");
for (const [vw, vh] of viewports) {
  const nc = newContentTop(vw, vh);
  const ns = newSpecTop(vw, vh);
  const na = availableText(vh, ns);
  const f = fontSite(vw, vh);
  console.log(
    `${vw}×${vh}: content ${nc.toFixed(0)}px  textAvail ${na.toFixed(0)}px  font ${f.toFixed(2)}px`
  );
}

assert(
  "1440×900 content-top stays 220",
  Math.abs(newContentTop(1440, 900) - 220) < 0.5
);
assert(
  "1440×900 font is Mac reference 13.5px",
  Math.abs(fontSite(1440, 900) - 13.5) < 0.05
);
assert(
  "1280×720 content-top shrinks below old floor",
  newContentTop(1280, 720) < oldContentTop(1280)
);
assert(
  "1280×720 available text height increases",
  availableText(720, newSpecTop(1280, 720)) >
    availableText(720, oldSpecTop(1280))
);
assert(
  "1280×720 font shrinks below Mac",
  fontSite(1280, 720) < FONT_MAC
);
assert(
  "2560×1080 content-top height-capped below width max",
  newContentTop(2560, 1080) < oldContentTop(2560)
);
assert(
  "2560×1080 font height-capped (not full width scale)",
  fontSite(2560, 1080) < (2560 * FONT_MAC) / REF_VW - 0.5
);
assert(
  "1920×1080 font grows above Mac but stays ≤17",
  fontSite(1920, 1080) > FONT_MAC && fontSite(1920, 1080) <= 17
);

if (failed) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log("\nAll viewport scale checks passed.");
