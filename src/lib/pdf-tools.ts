/**
 * pdf-tools.ts
 * Single source of truth for every PDF tool the app exposes.
 * Used by the tools grid, individual tool pages, and the API proxy route.
 */

export type ToolCategory = "organize" | "optimize" | "convert" | "security" | "advanced";

export interface PdfTool {
  /** Unique slug — also the URL segment: /dashboard/tools/[id] */
  id: string;
  label: string;
  description: string;
  category: ToolCategory;
  /** Brand accent colour for glow / icon tint */
  accent: string;
  /** rgba version for box-shadow / radial gradients */
  accentGlow: string;
  /**
   * Path on the Stirling-PDF instance, e.g. "/api/v1/general/merge-pdfs".
   * null = handled locally by pdf-lib inside the proxy route.
   */
  stirlingEndpoint: string | null;
  /** Allow multiple file uploads (e.g. Merge, Images→PDF) */
  multiFile: boolean;
  /** MIME types the drop-zone should accept */
  acceptedTypes: string[];
  /** Extra FormData keys forwarded to Stirling-PDF with their default values */
  defaultParams?: Record<string, string>;
  /** Gray out the card and block the route */
  comingSoon?: boolean;
}

export const PDF_TOOLS: PdfTool[] = [
  // ── Organize ────────────────────────────────────────────────────────────────
  {
    id: "merge",
    label: "Merge PDFs",
    description: "Combine multiple PDF files into a single document in any order.",
    category: "organize",
    accent: "#FFD400",
    accentGlow: "rgba(255,212,0,0.35)",
    stirlingEndpoint: "/api/v1/general/merge-pdfs",
    multiFile: true,
    acceptedTypes: ["application/pdf"],
  },
  {
    id: "split",
    label: "Split PDF",
    description: "Extract a page range or burst every page into its own file.",
    category: "organize",
    accent: "#FFD400",
    accentGlow: "rgba(255,212,0,0.35)",
    stirlingEndpoint: "/api/v1/general/split-pdfs",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    defaultParams: { splitType: "0", splitValue: "2" },
  },
  {
    id: "rotate",
    label: "Rotate Pages",
    description: "Rotate individual pages or the entire document 90/180/270°.",
    category: "organize",
    accent: "#FFD400",
    accentGlow: "rgba(255,212,0,0.35)",
    stirlingEndpoint: "/api/v1/misc/rotate-pdf",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    defaultParams: { rotation: "90", pageNum: "0" },
  },
  {
    id: "remove-pages",
    label: "Remove Pages",
    description: "Delete one or more pages from a PDF without re-printing.",
    category: "organize",
    accent: "#FFD400",
    accentGlow: "rgba(255,212,0,0.35)",
    stirlingEndpoint: "/api/v1/general/remove-pages",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    defaultParams: { pageNumbers: "1" },
  },
  // ── Optimize ────────────────────────────────────────────────────────────────
  {
    id: "compress",
    label: "Compress PDF",
    description: "Shrink file size intelligently — without visible quality loss.",
    category: "optimize",
    accent: "#00E5FF",
    accentGlow: "rgba(0,229,255,0.35)",
    stirlingEndpoint: "/api/v1/misc/compress-pdf",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    defaultParams: { optimizeLevel: "2" },
  },
  {
    id: "flatten",
    label: "Flatten PDF",
    description: "Merge annotations and form fields into the page permanently.",
    category: "optimize",
    accent: "#00E5FF",
    accentGlow: "rgba(0,229,255,0.35)",
    stirlingEndpoint: null, // handled locally by pdf-lib (PDFForm.flatten())
    multiFile: false,
    acceptedTypes: ["application/pdf"],
  },
  // ── Convert ─────────────────────────────────────────────────────────────────
  {
    id: "pdf-to-word",
    label: "PDF → Word",
    description: "Convert a PDF to a fully editable DOCX document.",
    category: "convert",
    accent: "#00E5FF",
    accentGlow: "rgba(0,229,255,0.35)",
    stirlingEndpoint: "/api/v1/convert/pdf/word",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    comingSoon: true,
  },
  {
    id: "pdf-to-images",
    label: "PDF → Images",
    description: "Export every page as a high-resolution PNG or JPG file.",
    category: "convert",
    accent: "#00E5FF",
    accentGlow: "rgba(0,229,255,0.35)",
    stirlingEndpoint: "/api/v1/convert/pdf/img",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    defaultParams: { imageFormat: "png", singleOrMultiple: "multiple" },
    comingSoon: true,
  },
  {
    id: "images-to-pdf",
    label: "Images → PDF",
    description: "Pack a batch of JPEG or PNG images into a single A4 PDF.",
    category: "convert",
    accent: "#00E5FF",
    accentGlow: "rgba(0,229,255,0.35)",
    stirlingEndpoint: null, // handled locally by pdf-lib
    multiFile: true,
    acceptedTypes: ["image/png", "image/jpeg"],
  },
  {
    id: "pdf-to-html",
    label: "PDF → HTML",
    description: "Convert a PDF into a standalone HTML page.",
    category: "convert",
    accent: "#00E5FF",
    accentGlow: "rgba(0,229,255,0.35)",
    stirlingEndpoint: "/api/v1/convert/pdf/html",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    comingSoon: true,
  },
  // ── Security ────────────────────────────────────────────────────────────────
  {
    id: "watermark",
    label: "Add Watermark",
    description: "Stamp a custom text watermark on every page of your PDF.",
    category: "security",
    accent: "#B026FF",
    accentGlow: "rgba(176,38,255,0.35)",
    stirlingEndpoint: "/api/v1/misc/add-stamp",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    defaultParams: {
      stampText: "CONFIDENTIAL",
      fontSize: "30",
      rotation: "45",
      opacity: "0.3",
    },
  },
  {
    id: "password-protect",
    label: "Password Protect",
    description: "Encrypt your PDF with owner and user passwords.",
    category: "security",
    accent: "#B026FF",
    accentGlow: "rgba(176,38,255,0.35)",
    stirlingEndpoint: "/api/v1/security/add-password",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    defaultParams: { ownerPassword: "", userPassword: "" },
  },
  {
    id: "redact",
    label: "Redact Content",
    description: "Permanently black-out sensitive text or regions.",
    category: "security",
    accent: "#B026FF",
    accentGlow: "rgba(176,38,255,0.35)",
    stirlingEndpoint: "/api/v1/misc/redact-pdf",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    // Requires Stirling-PDF with API key — coming once OCR pipeline is stable
    comingSoon: true,
  },
  // ── Advanced ────────────────────────────────────────────────────────────────
  {
    id: "ocr",
    label: "OCR",
    description: "Make scanned PDFs text-searchable and copy-able.",
    category: "advanced",
    accent: "#FF2FD0",
    accentGlow: "rgba(255,47,208,0.35)",
    stirlingEndpoint: "/api/v1/misc/ocr-pdf",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    defaultParams: { ocrType: "Force-OCR", ocrLanguages: "eng" },
    comingSoon: true,
  },
  {
    id: "page-numbers",
    label: "Add Page Numbers",
    description: "Stamp sequential page numbers with custom fonts and position.",
    category: "advanced",
    accent: "#FF2FD0",
    accentGlow: "rgba(255,47,208,0.35)",
    stirlingEndpoint: "/api/v1/misc/add-page-numbers",
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    defaultParams: {
      position: "bottomMiddle",
      startingNumber: "1",
      fontSize: "12",
    },
  },
  {
    id: "edit-metadata",
    label: "Edit Metadata",
    description: "Update the title, author, subject, and keywords of any PDF.",
    category: "advanced",
    accent: "#FF2FD0",
    accentGlow: "rgba(255,47,208,0.35)",
    stirlingEndpoint: null, // handled locally by pdf-lib
    multiFile: false,
    acceptedTypes: ["application/pdf"],
    defaultParams: {
      title: "",
      author: "",
      subject: "",
      keywords: "",
      creator: "I Hate Docs",
    },
  },
];

export const TOOL_CATEGORIES: { id: ToolCategory | "all"; label: string }[] = [
  { id: "all", label: "All Tools" },
  { id: "organize", label: "Organize" },
  { id: "optimize", label: "Optimize" },
  { id: "convert", label: "Convert" },
  { id: "security", label: "Security" },
  { id: "advanced", label: "Advanced" },
];

/** Look up a single tool by its slug. */
export function getToolById(id: string): PdfTool | undefined {
  return PDF_TOOLS.find((t) => t.id === id);
}

/** Human-readable byte sizes — rendered in JetBrains Mono. */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1_024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(2)} MB`;
}
