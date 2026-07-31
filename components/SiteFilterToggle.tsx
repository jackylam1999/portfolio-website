"use client";

import {
  PROJECT_FILTER_TYPES,
  useProjectFilter,
} from "@/components/ProjectFilterContext";

/**
 * Fixed top-right "filter" control (home + project pages).
 * Hover reveals project types; click selects one and filters the middle list.
 * When a type is selected, its name stays pinned directly under "filter".
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
      <button
        type="button"
        className="site-filter__label cursor-interactive"
        aria-haspopup="listbox"
        aria-label="Filter projects by type"
      >
        filter
      </button>

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

      <ul className="site-filter__menu" role="listbox" aria-label="Project types">
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
                onClick={() => toggleCategory(type)}
              >
                {type}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
