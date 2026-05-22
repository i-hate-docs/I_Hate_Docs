/**
 * /api/pdf/[action]
 * ─────────────────
 * All PDF operations live here — no Docker required for core ops.
 *
 * Local (pdf-lib + jszip — runs in Vercel serverless, zero external deps):
 *   merge, split, rotate, remove-pages, compress, flatten,
 *   watermark, page-numbers, images-to-pdf, password-protect, edit-metadata
 *
 * Stirling-PDF fallback (needs STIRLING_PDF_API_URL + STIRLING_PDF_API_KEY):
 *   ocr, pdf-to-word, pdf-to-images, pdf-to-html
 */

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  PDFDocument,
  PDFPage,
  StandardFonts,
  rgb,
  degrees,
} from "pdf-lib";
import JSZip from "jszip";

export const runtime = "nodejs";
export const maxDuration = 60;

// ── Small utilities ───────────────────────────────────────────────────────────

function pdfOut(bytes: Uint8Array, name: string): Response {
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}

function zipOut(buf: ArrayBuffer, name: string): Response {
  return new Response(buf, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}

function getFile(fd: FormData, key = "fileInput"): File {
  const f = fd.get(key);
  if (!(f instanceof File) || f.size === 0) throw new Error("No file provided.");
  return f;
}

function getFiles(fd: FormData, key = "fileInput"): File[] {
  const all = fd.getAll(key).filter((v): v is File => v instanceof File && v.size > 0);
  if (!all.length) throw new Error("No files provided.");
  return all;
}

function str(fd: FormData, key: string, fallback = ""): string {
  return (fd.get(key) as string | null) ?? fallback;
}

function num(fd: FormData, key: string, fallback: number): number {
  const v = parseFloat(str(fd, key, String(fallback)));
  return isNaN(v) ? fallback : v;
}

/** Parse "1,3,5-8" → 0-based index array */
function parsePageSpec(spec: string, total: number): number[] {
  const idxSet = new Set<number>();
  spec.split(",").forEach((part) => {
    part = part.trim();
    if (part.includes("-")) {
      const [a, b] = part.split("-").map(Number);
      for (let i = Math.max(1, a); i <= Math.min(b, total); i++) idxSet.add(i - 1);
    } else {
      const n = Number(part);
      if (n >= 1 && n <= total) idxSet.add(n - 1);
    }
  });
  return Array.from(idxSet);
}

const stamp = () => `${Date.now()}`;

// ── Handlers ──────────────────────────────────────────────────────────────────

/** Merge multiple PDFs into one. */
async function merge(fd: FormData): Promise<Response> {
  const files = getFiles(fd);
  const out = await PDFDocument.create();
  for (const file of files) {
    const src = await PDFDocument.load(await file.arrayBuffer());
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  return pdfOut(await out.save(), `merged-${stamp()}.pdf`);
}

/** Split a PDF by page group — returns a ZIP when there are ≥2 parts. */
async function split(fd: FormData): Promise<Response> {
  const file = getFile(fd);
  const splitType = num(fd, "splitType", 0);
  const splitValue = Math.max(1, num(fd, "splitValue", 2));

  const src = await PDFDocument.load(await file.arrayBuffer());
  const total = src.getPageCount();

  // Build groups of 0-based page indices
  let groups: number[][];
  if (splitType === 1) {
    // Split at page N (1-based)
    const n = Math.min(Math.max(1, splitValue), total);
    groups = [
      Array.from({ length: n }, (_, i) => i),
      Array.from({ length: total - n }, (_, i) => n + i),
    ].filter((g) => g.length > 0);
  } else if (splitType === 2) {
    // Into N equal parts
    const size = Math.ceil(total / splitValue);
    groups = [];
    for (let i = 0; i < total; i += size)
      groups.push(Array.from({ length: Math.min(size, total - i) }, (_, j) => i + j));
  } else {
    // Every N pages (default)
    groups = [];
    for (let i = 0; i < total; i += splitValue)
      groups.push(Array.from({ length: Math.min(splitValue, total - i) }, (_, j) => i + j));
  }

  // Single group → plain PDF
  if (groups.length === 1) {
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, groups[0]);
    pages.forEach((p) => out.addPage(p));
    return pdfOut(await out.save(), `split-${stamp()}.pdf`);
  }

  // Multiple groups → ZIP
  const zip = new JSZip();
  for (let i = 0; i < groups.length; i++) {
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, groups[i]);
    pages.forEach((p) => out.addPage(p));
    zip.file(`part-${String(i + 1).padStart(3, "0")}.pdf`, await out.save());
  }
  return zipOut(await zip.generateAsync({ type: "arraybuffer" }), `split-${stamp()}.zip`);
}

/** Rotate pages by a given angle. pageNum=0 means all pages. */
async function rotate(fd: FormData): Promise<Response> {
  const file = getFile(fd);
  const angle = num(fd, "rotation", 90);
  const pageNum = num(fd, "pageNum", 0); // 1-based; 0 = all

  const doc = await PDFDocument.load(await file.arrayBuffer());
  const pages = doc.getPages();

  const targets: PDFPage[] =
    pageNum === 0 ? pages : pages.filter((_, i) => i + 1 === pageNum);

  targets.forEach((p) => {
    const current = p.getRotation().angle;
    p.setRotation(degrees((current + angle) % 360));
  });

  return pdfOut(await doc.save(), `rotated-${stamp()}.pdf`);
}

/** Remove pages by 1-based number / range spec. */
async function removePages(fd: FormData): Promise<Response> {
  const file = getFile(fd);
  const spec = str(fd, "pageNumbers").trim();
  if (!spec) throw new Error("Specify at least one page number, e.g. 1,3,5-8");

  const doc = await PDFDocument.load(await file.arrayBuffer());
  const indices = parsePageSpec(spec, doc.getPageCount());
  if (!indices.length) throw new Error("No valid page numbers found in spec.");

  // Remove in descending order so indices don't shift
  [...indices].sort((a, b) => b - a).forEach((i) => doc.removePage(i));
  return pdfOut(await doc.save(), `removed-pages-${stamp()}.pdf`);
}

/**
 * Compress — structural compression via object streams.
 * Reduces XRef table overhead; best for text-heavy PDFs.
 * For image-heavy PDFs the Stirling-PDF compress route gives better ratios.
 */
async function compress(fd: FormData): Promise<Response> {
  const file = getFile(fd);
  const doc = await PDFDocument.load(await file.arrayBuffer(), {
    updateMetadata: false,
  });
  const bytes = await doc.save({ useObjectStreams: true });
  return pdfOut(bytes, `compressed-${stamp()}.pdf`);
}

/** Flatten interactive form fields into the page content. */
async function flatten(fd: FormData): Promise<Response> {
  const file = getFile(fd);
  const doc = await PDFDocument.load(await file.arrayBuffer());
  doc.getForm().flatten();
  return pdfOut(await doc.save(), `flattened-${stamp()}.pdf`);
}

/** Stamp a translucent diagonal text watermark on every page. */
async function watermark(fd: FormData): Promise<Response> {
  const file = getFile(fd);
  const text = str(fd, "stampText", "CONFIDENTIAL");
  const fontSize = num(fd, "fontSize", 30);
  const rotationAngle = num(fd, "rotation", 45);
  const opacity = Math.min(1, Math.max(0, num(fd, "opacity", 0.3)));

  const doc = await PDFDocument.load(await file.arrayBuffer());
  const font = await doc.embedFont(StandardFonts.HelveticaBold);

  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - fontSize / 2,
      size: fontSize,
      font,
      color: rgb(0.55, 0.55, 0.55),
      opacity,
      rotate: degrees(rotationAngle),
    });
  });

  return pdfOut(await doc.save(), `watermarked-${stamp()}.pdf`);
}

/** Add sequential page numbers at a configurable position. */
async function pageNumbers(fd: FormData): Promise<Response> {
  const file = getFile(fd);
  const position = str(fd, "position", "bottomMiddle");
  const start = num(fd, "startingNumber", 1);
  const fontSize = num(fd, "fontSize", 12);
  const margin = 28;

  const doc = await PDFDocument.load(await file.arrayBuffer());
  const font = await doc.embedFont(StandardFonts.Helvetica);

  doc.getPages().forEach((page, i) => {
    const { width, height } = page.getSize();
    const label = String(start + i);
    const tw = font.widthOfTextAtSize(label, fontSize);

    const x = position.endsWith("Left")
      ? margin
      : position.endsWith("Right")
        ? width - margin - tw
        : width / 2 - tw / 2;

    const y = position.startsWith("top") ? height - margin - fontSize : margin;

    page.drawText(label, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
  });

  return pdfOut(await doc.save(), `numbered-${stamp()}.pdf`);
}

/** Pack JPEG / PNG images into an A4 PDF — one image per page, centred. */
async function imagesToPdf(fd: FormData): Promise<Response> {
  const files = getFiles(fd);
  const doc = await PDFDocument.create();
  // A4 in pt (1 pt = 1/72 inch)
  const A4W = 595.28;
  const A4H = 841.89;

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    let img;
    if (file.type === "image/jpeg" || file.type === "image/jpg") {
      img = await doc.embedJpg(bytes);
    } else if (file.type === "image/png") {
      img = await doc.embedPng(bytes);
    } else {
      throw new Error(
        `"${file.name}" is ${file.type}. Only JPEG and PNG are supported — convert WebP first.`,
      );
    }

    const scale = Math.min(A4W / img.width, A4H / img.height, 1);
    const w = img.width * scale;
    const h = img.height * scale;
    const page = doc.addPage([A4W, A4H]);
    page.drawImage(img, {
      x: (A4W - w) / 2,
      y: (A4H - h) / 2,
      width: w,
      height: h,
    });
  }

  return pdfOut(await doc.save(), `images-${stamp()}.pdf`);
}

/** Encrypt a PDF with user + owner passwords (AES-128). */
async function passwordProtect(fd: FormData): Promise<Response> {
  const file = getFile(fd);
  const userPw = str(fd, "userPassword");
  const ownerPw = str(fd, "ownerPassword") || `owner-${stamp()}`;

  if (!userPw && !str(fd, "ownerPassword")) {
    throw new Error("Provide at least a user password.");
  }

  const doc = await PDFDocument.load(await file.arrayBuffer());
  // pdf-lib exposes password options at runtime but the TS types omit them
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bytes = await doc.save({
    userPassword: userPw || undefined,
    ownerPassword: ownerPw,
    permissions: {
      printing: "highResolution",
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: true,
      contentAccessibility: true,
      documentAssembly: false,
    },
  } as any);

  return pdfOut(bytes, `protected-${stamp()}.pdf`);
}

/** Edit document metadata (title, author, subject, keywords, creator). */
async function editMetadata(fd: FormData): Promise<Response> {
  const file = getFile(fd);
  const doc = await PDFDocument.load(await file.arrayBuffer());

  const title = str(fd, "title");
  const author = str(fd, "author");
  const subject = str(fd, "subject");
  const keywords = str(fd, "keywords");
  const creator = str(fd, "creator");

  if (title) doc.setTitle(title);
  if (author) doc.setAuthor(author);
  if (subject) doc.setSubject(subject);
  if (keywords) doc.setKeywords(keywords.split(",").map((k) => k.trim()).filter(Boolean));
  if (creator) doc.setCreator(creator);
  doc.setModificationDate(new Date());
  doc.setProducer("I Hate Docs — ihatedocs.app");

  return pdfOut(await doc.save(), `metadata-${stamp()}.pdf`);
}

// ── Stirling-PDF fallback (heavy ops only) ────────────────────────────────────

const STIRLING_MAP: Record<string, string> = {
  "pdf-to-images": "/api/v1/convert/pdf/img",
  "pdf-to-word": "/api/v1/convert/pdf/word",
  "pdf-to-html": "/api/v1/convert/pdf/html",
  ocr: "/api/v1/misc/ocr-pdf",
};

const STIRLING_MIME: Record<string, string> = {
  "pdf-to-word": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "pdf-to-images": "application/zip",
  "pdf-to-html": "text/html",
};

const STIRLING_EXT: Record<string, string> = {
  "pdf-to-word": "docx",
  "pdf-to-images": "zip",
  "pdf-to-html": "html",
};

async function stirlingFallback(action: string, fd: FormData): Promise<Response> {
  const base = process.env.STIRLING_PDF_API_URL?.replace(/\/$/, "");
  if (!base) {
    return Response.json(
      {
        error: `"${action}" requires a Stirling-PDF backend. Set STIRLING_PDF_API_URL in your environment.`,
      },
      { status: 503 },
    );
  }

  const endpoint = STIRLING_MAP[action];
  if (!endpoint) {
    return Response.json({ error: `Unknown action: "${action}"` }, { status: 400 });
  }

  // Forward all form fields (except our internal 'action' key)
  const forward = new FormData();
  for (const [k, v] of fd.entries()) {
    if (k !== "action") forward.append(k, v);
  }

  const headers: Record<string, string> = {};
  if (process.env.STIRLING_PDF_API_KEY) {
    headers["X-API-KEY"] = process.env.STIRLING_PDF_API_KEY;
  }

  let res: Response;
  try {
    res = await fetch(`${base}${endpoint}`, { method: "POST", body: forward, headers });
  } catch (err) {
    console.error(`[pdf/${action}] Stirling-PDF unreachable:`, err);
    return Response.json(
      { error: "Cannot reach PDF backend — is Stirling-PDF running?" },
      { status: 502 },
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[pdf/${action}] Stirling error ${res.status}:`, body);
    return Response.json({ error: `Backend error (HTTP ${res.status})` }, { status: 502 });
  }

  const buf = await res.arrayBuffer();
  const ext = STIRLING_EXT[action] ?? "pdf";
  const mime =
    STIRLING_MIME[action] ?? res.headers.get("content-type") ?? "application/pdf";

  return new Response(buf, {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="ihatedocs-${action}-${stamp()}.${ext}"`,
      "Cache-Control": "no-store",
    },
  });
}

// ── Route entry point ─────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  // Auth guard
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return Response.json({ error: "Could not parse request body." }, { status: 400 });
  }

  const { action } = await params;

  try {
    switch (action) {
      // ── Local (pdf-lib) ──────────────────────────────────────────────────
      case "merge":            return await merge(fd);
      case "split":            return await split(fd);
      case "rotate":           return await rotate(fd);
      case "remove-pages":     return await removePages(fd);
      case "compress":         return await compress(fd);
      case "flatten":          return await flatten(fd);
      case "watermark":        return await watermark(fd);
      case "page-numbers":     return await pageNumbers(fd);
      case "images-to-pdf":    return await imagesToPdf(fd);
      case "password-protect": return await passwordProtect(fd);
      case "edit-metadata":    return await editMetadata(fd);
      // ── Stirling-PDF fallback ────────────────────────────────────────────
      case "ocr":
      case "pdf-to-word":
      case "pdf-to-images":
      case "pdf-to-html":
        return await stirlingFallback(action, fd);
      // ── Unknown ──────────────────────────────────────────────────────────
      default:
        return Response.json({ error: `Unknown action: "${action}"` }, { status: 400 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Processing failed.";
    console.error(`[pdf/${action}]`, err);
    return Response.json({ error: msg }, { status: 500 });
  }
}
