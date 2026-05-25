import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { EditorSavePayload } from "@/lib/editor/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_SLUG = /^[a-z0-9-]+$/;

function projectRoot(): string {
  return process.cwd();
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const json = JSON.stringify(data, null, 2) + "\n";
  await fs.writeFile(filePath, json, "utf8");
}

export async function POST(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const isLocal =
    host.startsWith("127.0.0.1") ||
    host.startsWith("localhost") ||
    host.startsWith("[::1]");

  if (process.env.NODE_ENV !== "development" && !isLocal) {
    return NextResponse.json(
      { error: "Editor save is only available on localhost." },
      { status: 403 }
    );
  }

  let payload: EditorSavePayload;
  try {
    payload = (await req.json()) as EditorSavePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { slug, images, text, pageBottom } = payload;
  if (!slug || !ALLOWED_SLUG.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const root = projectRoot();
  const gridFile = path.join(root, "content", "grid", `${slug}.json`);
  const editsFile = path.join(root, "content", "edits", `${slug}.json`);

  try {
    /* Read existing grid file (if any) so we keep its constants/refWidth blocks. */
    let existingGrid: Record<string, unknown> = {};
    try {
      const raw = await fs.readFile(gridFile, "utf8");
      existingGrid = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      /* fresh file */
    }

    const nextGrid: Record<string, unknown> = {
      ...existingGrid,
      images: images && Object.keys(images).length ? images : existingGrid.images,
    };
    if (typeof pageBottom === "number" && pageBottom >= 0) {
      nextGrid.pageBottom = pageBottom;
    }

    await writeJson(gridFile, nextGrid);

    /* Persist text overrides next to the grid for the AI/runtime to pick up. */
    const cleanedText: Record<string, unknown> = {};
    for (const [sectionId, edit] of Object.entries(text ?? {})) {
      if (!edit) continue;
      const entry: Record<string, unknown> = {};
      if (edit.text) entry.text = edit.text;
      if (edit.specs) entry.specs = edit.specs;
      if (Object.keys(entry).length) cleanedText[sectionId] = entry;
    }
    await writeJson(editsFile, { sections: cleanedText });

    revalidatePath(`/projects/${slug}`);

    return NextResponse.json({
      ok: true,
      gridFile: path.relative(root, gridFile),
      editsFile: path.relative(root, editsFile),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
