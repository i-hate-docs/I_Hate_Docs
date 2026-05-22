/**
 * pdfEngine.ts
 * ────────────
 * Pure TypeScript PDF manipulation utilities built on pdf-lib.
 * Runs identically in:
 *   • The browser (client components, no network needed)
 *   • Vercel Serverless Functions (API routes)
 *   • Any Node.js environment
 *
 * Zero external dependencies beyond pdf-lib — no Docker, no Java, no proxy.
 */

import { PDFDocument, degrees } from "pdf-lib";

// ── Types ────────────────────────────────────────────────────────────────────

export type PDFBytes = Uint8Array;

/**
 * A single page edit descriptor used by `applyEdits`.
 * The array order defines the final page order in the output PDF.
 * Pages omitted from the array are deleted.
 */
export interface PageEdit {
  /** 0-based page index in the *source* document. */
  originalIndex: number;
  /**
   * Extra rotation to apply on top of the page's existing rotation.
   * Must be a multiple of 90.
   */
  extraRotation: 0 | 90 | 180 | 270;
}

/** 1-based inclusive page range [start, end]. */
export type PageRange = [number, number];

// ── Internal helper ───────────────────────────────────────────────────────────

async function toBytes(source: File | ArrayBuffer): Promise<ArrayBuffer> {
  return source instanceof File ? source.arrayBuffer() : source;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Merge an ordered list of PDF files into a single PDF.
 * Works entirely in-memory — no temporary files, no network.
 *
 * @example
 * const bytes = await mergePDFs([fileA, fileB, fileC]);
 * downloadPDF(bytes, "merged.pdf");
 */
export async function mergePDFs(files: File[]): Promise<PDFBytes> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const src = await PDFDocument.load(await file.arrayBuffer());
    const copied = await merged.copyPages(src, src.getPageIndices());
    copied.forEach((p) => merged.addPage(p));
  }
  return merged.save();
}

/**
 * Split a PDF into multiple smaller PDFs by page ranges.
 * Returns one Uint8Array per range, in the same order as `ranges`.
 *
 * @param source   - Source file or raw bytes.
 * @param ranges   - Array of 1-based inclusive ranges, e.g. [[1,3],[4,6]].
 *                   Ranges may overlap.
 *
 * @example
 * // Split 10-page PDF into two halves
 * const [firstHalf, secondHalf] = await splitPDF(file, [[1,5],[6,10]]);
 */
export async function splitPDF(
  source: File | ArrayBuffer,
  ranges: PageRange[],
): Promise<PDFBytes[]> {
  const src = await PDFDocument.load(await toBytes(source));
  const total = src.getPageCount();
  const results: PDFBytes[] = [];

  for (const [rawStart, rawEnd] of ranges) {
    const start = Math.max(1, rawStart);
    const end = Math.min(total, rawEnd);
    if (start > end) continue;

    const out = await PDFDocument.create();
    const indices = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
    const pages = await out.copyPages(src, indices);
    pages.forEach((p) => out.addPage(p));
    results.push(await out.save());
  }

  return results;
}

/**
 * Rotate specific pages (or all pages) of a PDF.
 *
 * @param pageIndices - 0-based indices. Omit or pass `undefined` to rotate all.
 *
 * @example
 * const bytes = await rotatePages(file, 90);           // rotate all 90° CW
 * const bytes = await rotatePages(file, 270, [0, 2]);  // rotate pages 1 and 3 90° CCW
 */
export async function rotatePages(
  source: File | ArrayBuffer,
  rotation: 90 | 180 | 270,
  pageIndices?: number[],
): Promise<PDFBytes> {
  const doc = await PDFDocument.load(await toBytes(source));
  const pages = doc.getPages();
  const targets = pageIndices ?? pages.map((_, i) => i);

  targets.forEach((i) => {
    if (i >= 0 && i < pages.length) {
      const current = pages[i].getRotation().angle;
      pages[i].setRotation(degrees((current + rotation) % 360));
    }
  });

  return doc.save();
}

/**
 * Remove specific pages from a PDF.
 *
 * @param pageIndices - 0-based indices of pages to remove.
 *
 * @example
 * const bytes = await removePages(file, [0, 4]); // remove pages 1 and 5
 */
export async function removePages(
  source: File | ArrayBuffer,
  pageIndices: number[],
): Promise<PDFBytes> {
  const doc = await PDFDocument.load(await toBytes(source));
  // Remove in descending order so indices stay valid
  [...pageIndices]
    .filter((i) => i >= 0 && i < doc.getPageCount())
    .sort((a, b) => b - a)
    .forEach((i) => doc.removePage(i));

  return doc.save();
}

/**
 * Reorder pages of a PDF.
 *
 * @param newOrder - Array of 0-based original page indices in the desired output order.
 *
 * @example
 * // Swap the first two pages of a 3-page PDF
 * const bytes = await reorderPages(file, [1, 0, 2]);
 */
export async function reorderPages(
  source: File | ArrayBuffer,
  newOrder: number[],
): Promise<PDFBytes> {
  const src = await PDFDocument.load(await toBytes(source));
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, newOrder);
  pages.forEach((p) => out.addPage(p));
  return out.save();
}

/**
 * Apply all pending edits (reorder + rotate + delete) in a **single pass**.
 * This is the preferred function for the visual editor — far more efficient
 * than chaining individual operations.
 *
 * Pages are emitted in the order of `edits`. Any source page whose index
 * does not appear in `edits` is silently deleted from the output.
 *
 * @example
 * const edits: PageEdit[] = [
 *   { originalIndex: 2, extraRotation: 0 },   // was page 3, now page 1
 *   { originalIndex: 0, extraRotation: 90 },  // was page 1, now page 2, rotated 90°
 *   // page at index 1 is omitted → deleted
 * ];
 * const bytes = await applyEdits(file, edits);
 */
export async function applyEdits(
  source: File | ArrayBuffer,
  edits: PageEdit[],
): Promise<PDFBytes> {
  const src = await PDFDocument.load(await toBytes(source));
  const out = await PDFDocument.create();

  // Copy all needed pages in the new order in one batch
  const indices = edits.map((e) => e.originalIndex);
  const pages = await out.copyPages(src, indices);

  pages.forEach((page, i) => {
    const { extraRotation } = edits[i];
    if (extraRotation !== 0) {
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + extraRotation) % 360));
    }
    out.addPage(page);
  });

  return out.save();
}

// ── Browser utilities ─────────────────────────────────────────────────────────

/**
 * Trigger a browser file download for a PDF Uint8Array.
 * No-op in non-browser environments.
 */
export function downloadPDF(bytes: PDFBytes, filename: string): void {
  if (typeof window === "undefined") return;
  // Cast to satisfy strictest TS lib — Uint8Array<ArrayBufferLike> is valid BlobPart at runtime
  const blob = new Blob([bytes as unknown as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  anchor.click();
  // Release the object URL after the download has started
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Read a File as an ArrayBuffer — convenience wrapper over the File API.
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}
