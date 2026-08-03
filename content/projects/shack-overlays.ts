/**
 * Sabusawa gutter titles — coords relative to composition frame origin
 * (tools image top at image-area left).
 */
import type { DrawingOverlays } from "../types";

const IMAGE_AREA_LEFT = 813;
const SABUSAWA_FRAME_TOP = 2350;

export const shackOverlays: Record<string, DrawingOverlays> = {
  "sabusawa-rice": {
    texts: [
      {
        id: "sab-tools",
        role: "gutter-title",
        text: "Tools",
        xRef: 640 - IMAGE_AREA_LEFT,
        yRef: 2316 - SABUSAWA_FRAME_TOP,
        fontSizeRef: 14,
      },
      {
        id: "sab-craft",
        role: "gutter-title",
        text: "Traditional Craft",
        xRef: 640 - IMAGE_AREA_LEFT,
        yRef: 2520 - SABUSAWA_FRAME_TOP,
        fontSizeRef: 14,
      },
      {
        id: "sab-biu",
        role: "gutter-title",
        text: "Building Integrated Units",
        xRef: 643 - IMAGE_AREA_LEFT,
        yRef: 2970 - SABUSAWA_FRAME_TOP,
        fontSizeRef: 14,
      },
    ],
  },
};
