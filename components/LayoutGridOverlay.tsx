import siteGrid from "@/content/grid/site.json";
import {
  gridColumnLabels,
  gridRowLabels,
  gridSubunit,
  imageAreaRightRef,
  standardAxisX,
} from "@/content/grid/registry";
import GridReferenceLabels from "@/components/GridReferenceLabels";

const GRID_BOOT_SCRIPT = `(function(){try{var e=new URLSearchParams(location.search).get("edit");var on=e==="1"||e==="true";if(e==="0"){document.documentElement.removeAttribute("data-layout-grid");}else if(on){document.documentElement.setAttribute("data-layout-grid","1");}else{document.documentElement.removeAttribute("data-layout-grid");}}catch(x){}})();`;

type Props = {
  /** Server-side flag — grid shows in edit mode only. */
  enabled: boolean;
};

/** Server-rendered layout guides — toggled via data-layout-grid on html. */
export default function LayoutGridOverlay({ enabled }: Props) {
  const c = siteGrid.constants;
  const areaRight = imageAreaRightRef(c);
  const axis = standardAxisX(c);
  const sub = gridSubunit(c);
  const areaCenter = c.imageAreaLeft + Math.round(c.imageAreaWidth / 2);
  const columns = gridColumnLabels(c);
  const rowCount = gridRowLabels(c, 20000).length;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: GRID_BOOT_SCRIPT }} />
      <div
        className="layout-grid-overlay"
        aria-hidden={!enabled}
        data-grid-server={enabled ? "1" : "0"}
      >
        <div className="layout-grid-v layout-grid-v--margin" />
        <div className="layout-grid-v layout-grid-v--text-col" />
        <div className="layout-grid-v layout-grid-v--area-left" />
        <div className="layout-grid-v layout-grid-v--area-right" />
        <div className="layout-grid-v layout-grid-v--drawing-bar" />
        <div className="layout-grid-v layout-grid-v--axis" />
        <div className="layout-grid-v layout-grid-v--center" />
        <div className="layout-grid-subdiv layout-grid-subdiv--v-minor" />
        <div className="layout-grid-subdiv layout-grid-subdiv--v-major" />
        <div className="layout-grid-subdiv layout-grid-subdiv--h-minor" />
        <div className="layout-grid-subdiv layout-grid-subdiv--h-major" />
        <div className="layout-grid-h layout-grid-h--content-top" />
        <div className="layout-grid-h layout-grid-h--spec-top" />
        <GridReferenceLabels />
        <div className="layout-grid-badge">Edit mode</div>
        <div className="layout-grid-legend">
          <p className="layout-grid-legend__title">Editor layout grid (2560 ref)</p>
          <p className="layout-grid-legend__meta">
            image area {c.imageAreaLeft}–{areaRight}px · module {c.gridUnit}px · sub {sub}px
          </p>
          <p className="layout-grid-legend__meta">
            standard axis {axis} · center {areaCenter}
          </p>
          <p className="layout-grid-legend__meta">
            columns A–{columns[columns.length - 1]?.label ?? "A"} · rows 1–{rowCount}
          </p>
          <ul className="layout-grid-legend__list">
            <li>
              <span className="layout-grid-swatch layout-grid-swatch--margin" /> page margin
            </li>
            <li>
              <span className="layout-grid-swatch layout-grid-swatch--text" /> text column
            </li>
            <li>
              <span className="layout-grid-swatch layout-grid-swatch--area" /> image area edges
            </li>
            <li>
              <span className="layout-grid-swatch layout-grid-swatch--sub" /> {sub}px / {c.gridUnit}px
              subdivisions
            </li>
            <li>
              <span className="layout-grid-swatch layout-grid-swatch--purple" /> content / spec top (scroll target = content top)
            </li>
            <li>
              <span className="layout-grid-swatch layout-grid-swatch--label" /> A, B, C columns · 1, 2, 3 rows
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
