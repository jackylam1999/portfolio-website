"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Project, ProjectImage, ProjectSpecRow } from "@/content/types";
import {
  gridConstants,
  gridImageForSection,
  getPageBottomRef,
  resolveImageLayout,
  type GridConstants,
} from "@/content/grid/registry";
import type { ImageEdit, ProjectEdits, TextEdit } from "@/lib/editor/types";
import { isEditableTarget } from "@/lib/editor/keyboard";
import type { ProjectGrid } from "@/content/grid/registry";
import { useRouter } from "next/navigation";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type EditorSnapshot = {
  imageEdits: Record<string, ImageEdit>;
  textEdits: Record<string, TextEdit>;
  pageBottomRef: number;
};

const MAX_UNDO = 50;

function cloneSnapshot(s: EditorSnapshot): EditorSnapshot {
  return JSON.parse(JSON.stringify(s)) as EditorSnapshot;
}

interface EditorState {
  enabled: boolean;
  snapEnabled: boolean;
  setSnapEnabled: (v: boolean) => void;
  gridVisible: boolean;
  setGridVisible: (v: boolean) => void;
  selectedKey: string | null;
  setSelectedKey: (key: string | null) => void;

  imageEdits: Record<string, ImageEdit>;
  setImageEdit: (sectionId: string, patch: Partial<ImageEdit>) => void;

  textEdits: Record<string, TextEdit>;
  setSectionText: (sectionId: string, text: string[]) => void;
  setSectionSpec: (sectionId: string, index: number, patch: Partial<ProjectSpecRow>) => void;

  pushUndoSnapshot: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  resolveLayout: (sectionId: string, img: ProjectImage) => {
    w: number;
    x: number;
    marginLeft: number;
    marginTop: number;
    aspectRatio: string;
  };

  resolveSectionContent: (sectionId: string) => {
    text?: string[];
    specs?: ProjectSpecRow[];
  };

  isDirty: boolean;
  discard: () => void;
  save: () => Promise<void>;
  status: SaveStatus;
  message: string | null;

  pageBottomRef: number;
  adjustPageBottom: (deltaRefPx: number) => void;

  constants: GridConstants;
  slug: string;
  project: Project;
  /** `site` = grid-only editor on home/CV/contact; `project` = full project editor. */
  mode: "project" | "site";
}

const Ctx = createContext<EditorState | null>(null);

const noop = () => {
  /* intentionally empty */
};

const EMPTY_SNAPSHOT: EditorSnapshot = {
  imageEdits: {},
  textEdits: {},
  pageBottomRef: 200,
};

const DISABLED_STATE: EditorState = {
  enabled: false,
  snapEnabled: true,
  setSnapEnabled: noop,
  gridVisible: true,
  setGridVisible: noop,
  selectedKey: null,
  setSelectedKey: noop,
  imageEdits: {},
  setImageEdit: noop,
  textEdits: {},
  setSectionText: noop,
  setSectionSpec: noop,
  pushUndoSnapshot: noop,
  undo: noop,
  redo: noop,
  canUndo: false,
  canRedo: false,
  resolveLayout: () => ({
    w: 0,
    x: 0,
    marginLeft: 0,
    marginTop: 0,
    aspectRatio: "1 / 1",
  }),
  resolveSectionContent: () => ({}),
  isDirty: false,
  discard: noop,
  save: async () => {
    /* no-op */
  },
  status: "idle",
  message: null,
  pageBottomRef: 200,
  adjustPageBottom: noop,
  constants: {} as GridConstants,
  slug: "",
  project: { slug: "", title: "", year: "", category: "Public", sections: [] },
  mode: "site",
};

export function useEditor(): EditorState {
  const ctx = useContext(Ctx);
  if (ctx) return ctx;
  return DISABLED_STATE;
}

interface ProviderProps {
  project: Project;
  enabled: boolean;
  /** Grid JSON read from disk on the server — publish + editor baseline. */
  savedGrid: ProjectGrid;
  children: ReactNode;
}

const STORAGE_KEY_PREFIX = "portfolio-editor-draft:";

export function EditorProvider({ project, enabled, savedGrid, children }: ProviderProps) {
  const slug = project.slug;
  const router = useRouter();
  const constants = useMemo(() => gridConstants(slug, savedGrid), [slug, savedGrid]);
  const savedPageBottomRef = useRef(getPageBottomRef(slug, savedGrid));

  const [snapEnabled, setSnapEnabled] = useState(true);
  const [gridVisible, setGridVisible] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [imageEdits, setImageEdits] = useState<Record<string, ImageEdit>>({});
  const [textEdits, setTextEdits] = useState<Record<string, TextEdit>>({});
  const [pageBottomRef, setPageBottomRef] = useState(() => getPageBottomRef(slug, savedGrid));
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<EditorSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<EditorSnapshot[]>([]);

  const storageKey = STORAGE_KEY_PREFIX + slug;
  const hydrated = useRef(false);
  const restoringRef = useRef(false);
  const stateRef = useRef<EditorSnapshot>({
    imageEdits: {},
    textEdits: {},
    pageBottomRef: getPageBottomRef(slug, savedGrid),
  });

  stateRef.current = { imageEdits, textEdits, pageBottomRef };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ProjectEdits;
      if (parsed.images) setImageEdits(parsed.images);
      if (parsed.text) setTextEdits(parsed.text);
      if (typeof parsed.pageBottom === "number") {
        setPageBottomRef(parsed.pageBottom);
      }
    } catch {
      /* ignore corrupted draft */
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hydrated.current) return;
    const empty =
      Object.keys(imageEdits).length === 0 &&
      Object.keys(textEdits).length === 0 &&
      pageBottomRef === savedPageBottomRef.current;
    if (empty) {
      window.localStorage.removeItem(storageKey);
      return;
    }
    const draft: ProjectEdits = { images: imageEdits, text: textEdits };
    if (pageBottomRef !== savedPageBottomRef.current) {
      draft.pageBottom = pageBottomRef;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [imageEdits, textEdits, pageBottomRef, storageKey]);

  const pushUndoSnapshot = useCallback(() => {
    if (restoringRef.current) return;
    const snap = cloneSnapshot(stateRef.current);
    setUndoStack((prev) => [...prev, snap].slice(-MAX_UNDO));
    setRedoStack([]);
  }, []);

  const applySnapshot = useCallback((snap: EditorSnapshot) => {
    restoringRef.current = true;
    setImageEdits(snap.imageEdits);
    setTextEdits(snap.textEdits);
    setPageBottomRef(snap.pageBottomRef);
    setStatus("idle");
    queueMicrotask(() => {
      restoringRef.current = false;
    });
  }, []);

  const undo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const previous = prev[prev.length - 1];
      setRedoStack((r) => [...r, cloneSnapshot(stateRef.current)]);
      applySnapshot(previous);
      return prev.slice(0, -1);
    });
  }, [applySnapshot]);

  const redo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const next = prev[prev.length - 1];
      setUndoStack((u) => [...u, cloneSnapshot(stateRef.current)]);
      applySnapshot(next);
      return prev.slice(0, -1);
    });
  }, [applySnapshot]);

  /* Click blank space → deselect the active figure. */
  useEffect(() => {
    if (!enabled) return;

    function onPointerDown(e: PointerEvent) {
      const el = e.target as HTMLElement;
      if (el.closest(".editable-figure")) return;
      if (el.closest(".editor-toolbar")) return;
      if (el.closest(".editor-page-length")) return;
      if (el.closest(".layout-grid-legend")) return;
      setSelectedKey(null);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [enabled]);

  const setImageEdit = useCallback(
    (sectionId: string, patch: Partial<ImageEdit>) => {
      setImageEdits((prev) => {
        const next = { ...prev };
        const current = next[sectionId] ?? {};
        const merged: ImageEdit = { ...current, ...patch };
        (Object.keys(merged) as Array<keyof ImageEdit>).forEach((k) => {
          if (merged[k] === undefined) delete merged[k];
        });
        if (Object.keys(merged).length === 0) {
          delete next[sectionId];
        } else {
          next[sectionId] = merged;
        }
        return next;
      });
      setStatus("idle");
    },
    []
  );

  const setSectionText = useCallback((sectionId: string, text: string[]) => {
    setTextEdits((prev) => {
      const next = { ...prev };
      const current = next[sectionId] ?? {};
      next[sectionId] = { ...current, text };
      return next;
    });
    setStatus("idle");
  }, []);

  const setSectionSpec = useCallback(
    (sectionId: string, index: number, patch: Partial<ProjectSpecRow>) => {
      setTextEdits((prev) => {
        const section = project.sections.find((s) => s.id === sectionId);
        const baseSpecs: ProjectSpecRow[] = section?.specs ?? [];
        const current = prev[sectionId]?.specs ?? baseSpecs.map((r) => ({ ...r }));
        const updated = current.map((row, i) => (i === index ? { ...row, ...patch } : row));
        return {
          ...prev,
          [sectionId]: { ...prev[sectionId], specs: updated },
        };
      });
      setStatus("idle");
    },
    [project.sections]
  );

  const resolveLayout = useCallback(
    (sectionId: string, img: ProjectImage) => {
      const base = resolveImageLayout(slug, sectionId, img, savedGrid);
      const edit = imageEdits[sectionId];
      if (!edit) {
        return {
          w: base.w,
          x: base.x,
          marginLeft: base.marginLeft,
          marginTop: base.marginTop,
          aspectRatio: base.aspectRatio,
        };
      }
      const w = edit.w ?? base.w;
      const x = edit.x ?? base.x;
      const marginTop = edit.marginTop ?? base.marginTop;
      return {
        w,
        x,
        marginLeft: x - constants.imageAreaLeft,
        marginTop,
        aspectRatio: base.aspectRatio,
      };
    },
    [slug, imageEdits, constants.imageAreaLeft, savedGrid]
  );

  const resolveSectionContent = useCallback(
    (sectionId: string) => {
      const section = project.sections.find((s) => s.id === sectionId);
      if (!section) return {};
      const edit = textEdits[sectionId];
      return {
        text: edit?.text ?? section.text,
        specs: edit?.specs ?? section.specs,
      };
    },
    [project.sections, textEdits]
  );

  const adjustPageBottom = useCallback(
    (deltaRefPx: number) => {
      pushUndoSnapshot();
      setPageBottomRef((prev) => {
        const min = constants.gridUnit;
        const max = constants.gridUnit * 40;
        return Math.min(max, Math.max(min, prev + deltaRefPx));
      });
      setStatus("idle");
    },
    [constants.gridUnit, pushUndoSnapshot]
  );

  const isDirty =
    Object.keys(imageEdits).length > 0 ||
    Object.keys(textEdits).length > 0 ||
    pageBottomRef !== savedPageBottomRef.current;

  const discard = useCallback(() => {
    setImageEdits({});
    setTextEdits({});
    setPageBottomRef(savedPageBottomRef.current);
    setUndoStack([]);
    setRedoStack([]);
    setStatus("idle");
    setMessage(null);
  }, []);

  const save = useCallback(async () => {
    if (!isDirty) return;
    setStatus("saving");
    setMessage(null);

    const baseGrid: Record<string, ImageEdit> = {};
    for (const section of project.sections) {
      const existing = gridImageForSection(slug, section.id, savedGrid);
      if (existing) baseGrid[section.id] = { ...(existing as ImageEdit) };
    }
    for (const [sectionId, edit] of Object.entries(imageEdits)) {
      baseGrid[sectionId] = { ...baseGrid[sectionId], ...edit };
    }

    try {
      const res = await fetch("/api/editor/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug,
          images: baseGrid,
          text: textEdits,
          pageBottom: pageBottomRef,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Save failed (${res.status})`);
      }
      setStatus("saved");
      savedPageBottomRef.current = pageBottomRef;
      window.localStorage.removeItem(storageKey);
      setImageEdits({});
      setTextEdits({});
      setUndoStack([]);
      setRedoStack([]);

      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      const target = url.pathname + url.search;
      router.push(target);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Save failed");
    }
  }, [isDirty, slug, imageEdits, textEdits, pageBottomRef, project.sections, storageKey, savedGrid, router]);

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return;

      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        redo();
      } else if (key === "s") {
        e.preventDefault();
        void save();
      }
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [enabled, undo, redo, save]);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  const value: EditorState = useMemo(
    () => ({
      enabled,
      snapEnabled,
      setSnapEnabled,
      gridVisible,
      setGridVisible,
      selectedKey,
      setSelectedKey,
      imageEdits,
      setImageEdit,
      textEdits,
      setSectionText,
      setSectionSpec,
      pushUndoSnapshot,
      undo,
      redo,
      canUndo,
      canRedo,
      resolveLayout,
      resolveSectionContent,
      isDirty,
      discard,
      save,
      status,
      message,
      pageBottomRef,
      adjustPageBottom,
      constants,
      slug,
      project,
      mode: "project" as const,
    }),
    [
      enabled,
      snapEnabled,
      gridVisible,
      selectedKey,
      imageEdits,
      setImageEdit,
      textEdits,
      setSectionText,
      setSectionSpec,
      pushUndoSnapshot,
      undo,
      redo,
      canUndo,
      canRedo,
      resolveLayout,
      resolveSectionContent,
      isDirty,
      discard,
      save,
      status,
      message,
      pageBottomRef,
      adjustPageBottom,
      constants,
      slug,
      project,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const EMPTY_PROJECT: Project = {
  slug: "",
  title: "",
  year: "",
  category: "Public",
  sections: [],
};

/** Grid + toolbar only — home, CV, contact (?edit=1). */
export function SiteEditorProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  const constants = useMemo(() => gridConstants(), []);
  const [gridVisible, setGridVisible] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);

  const value: EditorState = useMemo(
    () => ({
      enabled,
      snapEnabled,
      setSnapEnabled,
      gridVisible,
      setGridVisible,
      selectedKey: null,
      setSelectedKey: noop,
      imageEdits: {},
      setImageEdit: noop,
      textEdits: {},
      setSectionText: noop,
      setSectionSpec: noop,
      pushUndoSnapshot: noop,
      undo: noop,
      redo: noop,
      canUndo: false,
      canRedo: false,
      resolveLayout: () => ({
        w: 0,
        x: 0,
        marginLeft: 0,
        marginTop: 0,
        aspectRatio: "1 / 1",
      }),
      resolveSectionContent: () => ({}),
      isDirty: false,
      discard: noop,
      save: async () => {
        /* no-op */
      },
      status: "idle",
      message: null,
      pageBottomRef: 200,
      adjustPageBottom: noop,
      constants,
      slug: "",
      project: EMPTY_PROJECT,
      mode: "site",
    }),
    [enabled, snapEnabled, gridVisible, constants]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
