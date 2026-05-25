import type { GridAlign, WidthTier } from "@/content/grid/registry";

/** A single image's editable layout, in 2560-canvas reference px. */
export interface ImageEdit {
  /** Width on the 2560 canvas. */
  w?: number;
  /** Width tier (narrow / standard / full) — informational only. */
  widthTier?: WidthTier;
  /** Absolute X position on the 2560 canvas (left edge of the image). */
  x?: number;
  /** Vertical offset from natural stack position (2560 ref px). */
  marginTop?: number;
  /** Alignment within the image area. */
  align?: GridAlign;
  /** Vertical gap *below* the section that contains this image. */
  gapAfter?: number;
}

/** Draft text overrides — section id → field map. */
export interface TextEdit {
  /** Replaces section.text (full paragraph array) when defined. */
  text?: string[];
  /** Replaces section.specs when defined. */
  specs?: Array<{ label: string; value: string }>;
}

/** What a project's edits file looks like on disk. */
export interface ProjectEdits {
  /** Layout edits keyed by section id — written to content/grid/{slug}.json. */
  images?: Record<string, ImageEdit>;
  /** Text edits keyed by section id — written to content/edits/{slug}.json. */
  text?: Record<string, TextEdit>;
  /** Draft page bottom padding (2560 ref px) — merged into grid on save. */
  pageBottom?: number;
}

export interface EditorSavePayload {
  slug: string;
  images: Record<string, ImageEdit>;
  text: Record<string, TextEdit>;
  /** Total page bottom padding in 2560 ref px. */
  pageBottom?: number;
}
