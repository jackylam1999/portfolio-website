"use client";

import {
  PROJECT_FILTER_TYPES,
  useProjectFilter,
} from "@/components/ProjectFilterContext";

/**
 * Fixed "filter" control (home + project pages).
 * Left edge aligns with the project index column (`--site-index-left`).
 * Hover the "filter" label to reveal types; a selected type pins under the label.
 * Hovering the pinned name does not open the full menu.
 */
export default function SiteFilterToggle() {
  const { selectedCategory, toggleCategory } = useProjectFilter();

  return (
    <div
      className={
        "site-filter type-nav select-none tracking-tightish" +
        (selectedCategory ? " site-filter--has-selection" : "")
      }
    >
      <div className="site-filter__trigger">
        <button
          type="button"
          className="site-filter__label cursor-interactive"
          aria-haspopup="listbox"
          aria-label="Filter projects by type"
        >
          filter
        </button>

        <ul
          className="site-filter__menu"
          role="listbox"
          aria-label="Project types"
        >
          {PROJECT_FILTER_TYPES.map((type) => {
            const selected = selectedCategory === type;
            return (
              <li key={type}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={
                    "site-filter__type cursor-interactive" +
                    (selected ? " site-filter__type--selected" : "")
                  }
                  onClick={(e) => {
                    toggleCategory(type);
                    // Drop focus so the menu can close and the pinned name can show.
                    e.currentTarget.blur();
                  }}
                >
                  {type}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {selectedCategory ? (
        <button
          key={selectedCategory}
          type="button"
          className="site-filter__pinned site-filter__type site-filter__type--selected cursor-interactive"
          aria-label={`Clear ${selectedCategory} filter`}
          onClick={() => toggleCategory(selectedCategory)}
        >
          {selectedCategory}
        </button>
      ) : null}
    </div>
  );
}
