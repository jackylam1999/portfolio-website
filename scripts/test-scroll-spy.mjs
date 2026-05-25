/**
 * Pure-logic tests for scroll-spy section selection (top edge vs content-top line).
 * Run: node scripts/test-scroll-spy.mjs
 */

function activeSectionByTop(centers, refY) {
  let candidate = centers[0]?.id ?? "";
  let bestTop = -Infinity;

  for (const { id, top } of centers) {
    if (top <= refY && top > bestTop) {
      bestTop = top;
      candidate = id;
    }
  }

  return candidate;
}

let failed = 0;

function assert(name, got, expected) {
  if (got !== expected) {
    console.error(`✗ ${name}: got ${got}, expected ${expected}`);
    failed++;
  } else {
    console.log(`✓ ${name}`);
  }
}

const refY = 312; // content-top @ ref

assert(
  "first section active when top above reference",
  activeSectionByTop(
    [
      { id: "overview", top: 280 },
      { id: "site-plan", top: 900 },
    ],
    refY
  ),
  "overview"
);

assert(
  "switches when top edge reaches purple content line",
  activeSectionByTop(
    [
      { id: "overview", top: 200 },
      { id: "site-plan", top: 310 },
    ],
    refY
  ),
  "site-plan"
);

assert(
  "detail-section-east active when its top touches reference",
  activeSectionByTop(
    [
      { id: "section-east", top: 100 },
      { id: "detail-section-east", top: 300 },
    ],
    refY
  ),
  "detail-section-east"
);

assert(
  "drawing top exactly on line selects that section",
  activeSectionByTop([{ id: "section-west", top: 312 }], refY),
  "section-west"
);

assert(
  "undershoot after click leaves previous section active (bug scenario)",
  activeSectionByTop(
    [
      { id: "floor-plan-g", top: 180 },
      { id: "floor-plan-b2", top: 335 },
    ],
    refY
  ),
  "floor-plan-g"
);

assert(
  "exact alignment after snap selects clicked section",
  activeSectionByTop(
    [
      { id: "floor-plan-g", top: 180 },
      { id: "floor-plan-b2", top: 312 },
    ],
    refY
  ),
  "floor-plan-b2"
);

if (failed) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}

console.log("\nAll scroll-spy logic tests passed.");
