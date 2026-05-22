/**
 * /api/pdf/proxy — Stirling-PDF reverse proxy
 *
 * Accepts multipart/form-data from the client, authenticates the request via
 * NextAuth, then forwards the file(s) + parameters to the configured
 * Stirling-PDF instance. Returns the processed blob directly so the browser
 * can trigger a download without the file touching Vercel's storage.
 *
 * Environment variables
 * ─────────────────────
 * STIRLING_PDF_API_URL   Required. Base URL of your Stirling-PDF instance,
 *                        e.g. https://pdf.yourdomain.com
 * STIRLING_PDF_API_KEY   Optional. Passed as the X-API-KEY header when
 *                        Stirling-PDF is running with auth enabled.
 *
 * Vercel limits
 * ─────────────
 * Hobby plan: 10s function timeout, 4.5 MB request body.
 * Pro plan  : 60s timeout (configured via maxDuration), 4.5 MB body.
 * For large PDFs, point STIRLING_PDF_API_URL at a self-hosted instance and
 * use the /api/pdf/[action] pattern with streaming body forwarding.
 */

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ── Runtime config ────────────────────────────────────────────────────────────
export const runtime = "nodejs"; // needs Node.js APIs (FormData, Buffer)
export const maxDuration = 60; // Pro tier: up to 60 s

// ── Endpoint mapping ──────────────────────────────────────────────────────────
// Maps the tool id sent from the client to the Stirling-PDF REST path.
const ENDPOINT_MAP: Record<string, string> = {
  merge: "/api/v1/general/merge-pdfs",
  split: "/api/v1/general/split-pdfs",
  rotate: "/api/v1/misc/rotate-pdf",
  "remove-pages": "/api/v1/general/remove-pages",
  compress: "/api/v1/misc/compress-pdf",
  flatten: "/api/v1/misc/flatten",
  "pdf-to-word": "/api/v1/convert/pdf/word",
  "pdf-to-images": "/api/v1/convert/pdf/img",
  "images-to-pdf": "/api/v1/convert/img/pdf",
  "pdf-to-html": "/api/v1/convert/pdf/html",
  watermark: "/api/v1/misc/add-stamp",
  "password-protect": "/api/v1/security/add-password",
  redact: "/api/v1/misc/redact-pdf",
  ocr: "/api/v1/misc/ocr-pdf",
  "page-numbers": "/api/v1/misc/add-page-numbers",
  "edit-metadata": "/api/v1/misc/edit-metadata",
};

// ── Output MIME / extension overrides ────────────────────────────────────────
// Most actions return application/pdf; these return something else.
const OUTPUT_MIME: Record<string, string> = {
  "pdf-to-word": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "pdf-to-images": "application/zip",
  "pdf-to-html": "text/html",
};
const OUTPUT_EXT: Record<string, string> = {
  "pdf-to-word": "docx",
  "pdf-to-images": "zip",
  "pdf-to-html": "html",
};

// ── Handler ───────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Auth guard — must be signed in to use any PDF tool
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate backend is configured
  const stirlingBase = process.env.STIRLING_PDF_API_URL?.replace(/\/$/, "");
  if (!stirlingBase) {
    return Response.json(
      {
        error:
          "PDF backend is not configured. " +
          "Set STIRLING_PDF_API_URL in your environment.",
      },
      { status: 503 },
    );
  }

  // 3. Parse incoming form data
  let incoming: FormData;
  try {
    incoming = await req.formData();
  } catch {
    return Response.json(
      { error: "Could not parse multipart/form-data body." },
      { status: 400 },
    );
  }

  // 4. Resolve action → endpoint
  const action = incoming.get("action");
  if (typeof action !== "string" || !ENDPOINT_MAP[action]) {
    return Response.json(
      { error: `Unknown action: "${action}". Check ENDPOINT_MAP.` },
      { status: 400 },
    );
  }

  const targetUrl = `${stirlingBase}${ENDPOINT_MAP[action]}`;

  // 5. Build forwarded FormData — pass every key except "action"
  //    Stirling-PDF expects the file(s) under the key "fileInput"
  const forward = new FormData();
  for (const [key, value] of incoming.entries()) {
    if (key === "action") continue;
    forward.append(key, value);
  }

  // 6. Call Stirling-PDF
  let stirlingRes: Response;
  try {
    const headers: Record<string, string> = {};
    if (process.env.STIRLING_PDF_API_KEY) {
      headers["X-API-KEY"] = process.env.STIRLING_PDF_API_KEY;
    }

    stirlingRes = await fetch(targetUrl, {
      method: "POST",
      body: forward,
      headers,
      // Rely on maxDuration; no manual signal needed
    });
  } catch (err) {
    console.error("[pdf/proxy] Network error contacting Stirling-PDF:", err);
    return Response.json(
      {
        error:
          "Could not reach the PDF backend. " +
          "Make sure Stirling-PDF is running and STIRLING_PDF_API_URL is correct.",
      },
      { status: 502 },
    );
  }

  // 7. Propagate errors from Stirling-PDF
  if (!stirlingRes.ok) {
    const body = await stirlingRes.text().catch(() => "");
    console.error(
      `[pdf/proxy] Stirling-PDF returned ${stirlingRes.status} for action "${action}":`,
      body,
    );
    return Response.json(
      { error: `PDF processing failed (HTTP ${stirlingRes.status}).` },
      { status: stirlingRes.status >= 500 ? 502 : stirlingRes.status },
    );
  }

  // 8. Stream processed file back to the client
  const buffer = await stirlingRes.arrayBuffer();
  const contentType =
    OUTPUT_MIME[action] ??
    stirlingRes.headers.get("content-type") ??
    "application/pdf";
  const ext = OUTPUT_EXT[action] ?? "pdf";
  const filename = `ihatedocs-${action}-${Date.now()}.${ext}`;

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store, no-cache",
      "X-Robots-Tag": "noindex",
    },
  });
}
