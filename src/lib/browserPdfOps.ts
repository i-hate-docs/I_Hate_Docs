/**
 * browserPdfOps.ts
 * ────────────────
 * All local PDF operations running entirely in the browser via pdf-lib.
 * No server round-trip, no file size limits, no uploads.
 *
 * Stirling-PDF ops (ocr, pdf-to-word, pdf-to-images, pdf-to-html) still go
 * through /api/pdf/[action] because they require a server-side binary.
 */

import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import JSZip from "jszip";

// ── Public constants ──────────────────────────────────────────────────────────

/** Operations handled entirely in the browser — no server needed. */
export const LOCAL_OPS = new Set([
  "merge",
  "split",
  "rotate",
  "remove-pages",
  "compress",
  "flatten",
  "watermark",
  "page-numbers",
  "images-to-pdf",
  "password-protect",
  "edit-metadata",
]);

export interface BrowserResult {
  url: string;      // object URL — caller must revoke when done
  filename: string;
}

// ── Entry point ───────────────────────────────────────────────────────────────

export async function processLocally(
  action: string,
  files: File[],
  params: Record<string, string>,
): Promise<BrowserResult> {
  switch (action) {
    case "merge":            return merge(files);
    case "split":            return split(files[0], params);
    case "rotate":           return rotate(files[0], params);
    case "remove-pages":     return removePagesOp(files[0], params);
    case "compress":         return compressOp(files[0]);
    case "flatten":          return flattenOp(files[0]);
    case "watermark":        return watermarkOp(files[0], params);
    case "page-numbers":     return pageNumbersOp(files[0], params);
    case "images-to-pdf":    return imagesToPdf(files);
    case "password-protect": return passwordProtect(files[0], params);
    case "edit-metadata":    return editMetadata(files[0], params);
    default:
      throw new Error(`"${action}" is not a local operation.`);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const stamp = () => `${Date.now()}`;

function pdfResult(bytes: Uint8Array, name: string): BrowserResult {
  const blob = new Blob([bytes as unknown as ArrayBuffer], { type: "application/pdf" });
  return { url: URL.createObjectURL(blob), filename: name };
}

function zipResult(buf: ArrayBuffer, name: string): BrowserResult {
  const blob = new Blob([buf], { type: "application/zip" });
  return { url: URL.createObjectURL(blob), filename: name };
}

/** Parse "1,3,5-8" → sorted 0-based index array. */
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

// ── Operations ────────────────────────────────────────────────────────────────

async function merge(files: File[]): Promise<BrowserResult> {
  const out = await PDFDocument.create();
  for (const file of files) {
    const src = await PDFDocument.load(await file.arrayBuffer());
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  return pdfResult(await out.save(), `merged-${stamp()}.pdf`);
}

async function split(file: File, params: Record<string, string>): Promise<BrowserResult> {
  const splitType = parseInt(params.splitType ?? "0", 10);
  const splitValue = Math.max(1, parseInt(params.splitValue ?? "2", 10));

  const src = await PDFDocument.load(await file.arrayBuffer());
  const total = src.getPageCount();

  let groups: number[][];
  if (splitType === 1) {
    const n = Math.min(Math.max(1, splitValue), total);
    groups = [
      Array.from({ length: n }, (_, i) => i),
      Array.from({ length: total - n }, (_, i) => n + i),
    ].filter((g) => g.length > 0);
  } else if (splitType === 2) {
    const size = Math.ceil(total / splitValue);
    groups = [];
    for (let i = 0; i < total; i += size)
      groups.push(Array.from({ length: Math.min(size, total - i) }, (_, j) => i + j));
  } else {
    groups = [];
    for (let i = 0; i < total; i += splitValue)
      groups.push(Array.from({ length: Math.min(splitValue, total - i) }, (_, j) => i + j));
  }

  if (groups.length === 1) {
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, groups[0]);
    pages.forEach((p) => out.addPage(p));
    return pdfResult(await out.save(), `split-${stamp()}.pdf`);
  }

  const zip = new JSZip();
  for (let i = 0; i < groups.length; i++) {
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, groups[i]);
    pages.forEach((p) => out.addPage(p));
    zip.file(`part-${String(i + 1).padStart(3, "0")}.pdf`, await out.save());
  }
  return zipResult(await zip.generateAsync({ type: "arraybuffer" }), `split-${stamp()}.zip`);
}

async function rotate(file: File, params: Record<string, string>): Promise<BrowserResult> {
  const angle = parseFloat(params.rotation ?? "90");
  const pageNum = parseInt(params.pageNum ?? "0", 10);

  const doc = await PDFDocument.load(await file.arrayBuffer());
  const pages = doc.getPages();
  const targets = pageNum === 0 ? pages : pages.filter((_, i) => i + 1 === pageNum);
  targets.forEach((p) => {
    const current = p.getRotation().angle;
    p.setRotation(degrees((current + angle) % 360));
  });
  return pdfResult(await doc.save(), `rotated-${stamp()}.pdf`);
}

async function removePagesOp(file: File, params: Record<string, string>): Promise<BrowserResult> {
  const spec = (params.pageNumbers ?? "").trim();
  if (!spec) throw new Error("Specify at least one page number, e.g. 1,3,5-8");

  const doc = await PDFDocument.load(await file.arrayBuffer());
  const indices = parsePageSpec(spec, doc.getPageCount());
  if (!indices.length) throw new Error("No valid page numbers found.");

  [...indices].sort((a, b) => b - a).forEach((i) => doc.removePage(i));
  return pdfResult(await doc.save(), `removed-pages-${stamp()}.pdf`);
}

async function compressOp(file: File): Promise<BrowserResult> {
  const doc = await PDFDocument.load(await file.arrayBuffer(), { updateMetadata: false });
  const bytes = await doc.save({ useObjectStreams: true });
  return pdfResult(bytes, `compressed-${stamp()}.pdf`);
}

async function flattenOp(file: File): Promise<BrowserResult> {
  const doc = await PDFDocument.load(await file.arrayBuffer());
  doc.getForm().flatten();
  return pdfResult(await doc.save(), `flattened-${stamp()}.pdf`);
}

async function watermarkOp(file: File, params: Record<string, string>): Promise<BrowserResult> {
  const text = params.stampText ?? "CONFIDENTIAL";
  const fontSize = parseFloat(params.fontSize ?? "30");
  const rotationAngle = parseFloat(params.rotation ?? "45");
  const opacity = Math.min(1, Math.max(0, parseFloat(params.opacity ?? "0.3")));

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

  return pdfResult(await doc.save(), `watermarked-${stamp()}.pdf`);
}

async function pageNumbersOp(file: File, params: Record<string, string>): Promise<BrowserResult> {
  const position = params.position ?? "bottomMiddle";
  const start = parseInt(params.startingNumber ?? "1", 10);
  const fontSize = parseFloat(params.fontSize ?? "12");
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

  return pdfResult(await doc.save(), `numbered-${stamp()}.pdf`);
}

async function imagesToPdf(files: File[]): Promise<BrowserResult> {
  const doc = await PDFDocument.create();
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
      throw new Error(`"${file.name}" is ${file.type}. Only JPEG and PNG are supported.`);
    }
    const scale = Math.min(A4W / img.width, A4H / img.height, 1);
    const w = img.width * scale;
    const h = img.height * scale;
    const page = doc.addPage([A4W, A4H]);
    page.drawImage(img, { x: (A4W - w) / 2, y: (A4H - h) / 2, width: w, height: h });
  }

  return pdfResult(await doc.save(), `images-${stamp()}.pdf`);
}

async function passwordProtect(file: File, params: Record<string, string>): Promise<BrowserResult> {
  const userPw = params.userPassword ?? "";
  const ownerPw = params.ownerPassword || `owner-${stamp()}`;

  if (!userPw && !params.ownerPassword) {
    throw new Error("Provide at least a user password.");
  }

  const doc = await PDFDocument.load(await file.arrayBuffer());
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

  return pdfResult(bytes, `protected-${stamp()}.pdf`);
}

async function editMetadata(file: File, params: Record<string, string>): Promise<BrowserResult> {
  const doc = await PDFDocument.load(await file.arrayBuffer());
  if (params.title)    doc.setTitle(params.title);
  if (params.author)   doc.setAuthor(params.author);
  if (params.subject)  doc.setSubject(params.subject);
  if (params.keywords) doc.setKeywords(params.keywords.split(",").map((k) => k.trim()).filter(Boolean));
  if (params.creator)  doc.setCreator(params.creator);
  doc.setModificationDate(new Date());
  doc.setProducer("I Hate Docs — ihatedocs.app");
  return pdfResult(await doc.save(), `metadata-${stamp()}.pdf`);
}
