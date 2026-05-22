"use client";

/**
 * ToolWorkspace
 * ─────────────
 * Client wrapper rendered inside each /dashboard/tools/[tool] page.
 * Holds the PdfDropZone and any tool-specific option controls.
 * Keeping this separate from the server page component lets us ship
 * auth/metadata as RSC while keeping the interactive bits client-only.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import type { PdfTool } from "@/lib/pdf-tools";
import { PdfDropZone } from "@/components/pdf/PdfDropZone";

interface Props {
  tool: PdfTool;
}

// ── Per-tool option panels ────────────────────────────────────────────────────
// Each returns a Record of extra FormData params to pass to the proxy.

function SplitOptions({
  params,
  onChange,
}: {
  params: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <OptionPanel title="Split options">
      <OptionRow label="Split type">
        <select
          className="option-select"
          value={params.splitType ?? "0"}
          onChange={(e) => onChange("splitType", e.target.value)}
        >
          <option value="0">After every N pages</option>
          <option value="1">After specific page numbers</option>
          <option value="2">Into N equal parts</option>
        </select>
      </OptionRow>
      <OptionRow label="Value">
        <input
          type="number"
          min={1}
          className="option-input"
          value={params.splitValue ?? "2"}
          onChange={(e) => onChange("splitValue", e.target.value)}
        />
      </OptionRow>
    </OptionPanel>
  );
}

function RotateOptions({
  params,
  onChange,
}: {
  params: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  const angles = ["90", "180", "270"];
  return (
    <OptionPanel title="Rotate options">
      <OptionRow label="Rotation">
        <div className="flex gap-2">
          {angles.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => onChange("rotation", a)}
              className="flex-1 rounded-xl border py-2 text-sm font-medium transition-colors"
              style={{
                borderColor:
                  params.rotation === a
                    ? "rgba(255,212,0,0.6)"
                    : "rgba(255,255,255,0.08)",
                background:
                  params.rotation === a
                    ? "rgba(255,212,0,0.1)"
                    : "rgba(255,255,255,0.03)",
                color: params.rotation === a ? "#FFD400" : "rgba(255,255,255,0.5)",
              }}
            >
              {a}°
            </button>
          ))}
        </div>
      </OptionRow>
      <OptionRow label="Pages (0 = all)">
        <input
          type="number"
          min={0}
          className="option-input"
          value={params.pageNum ?? "0"}
          onChange={(e) => onChange("pageNum", e.target.value)}
        />
      </OptionRow>
    </OptionPanel>
  );
}

function CompressOptions({
  params,
  onChange,
}: {
  params: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  const levels = [
    { value: "0", label: "Low", sub: "Best quality" },
    { value: "1", label: "Medium", sub: "Balanced" },
    { value: "2", label: "High", sub: "Recommended" },
    { value: "3", label: "Extreme", sub: "Max compression" },
  ];
  return (
    <OptionPanel title="Compression level">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {levels.map(({ value, label, sub }) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange("optimizeLevel", value)}
            className="flex flex-col items-center gap-0.5 rounded-xl border py-3 transition-colors"
            style={{
              borderColor:
                params.optimizeLevel === value
                  ? "rgba(0,229,255,0.55)"
                  : "rgba(255,255,255,0.07)",
              background:
                params.optimizeLevel === value
                  ? "rgba(0,229,255,0.08)"
                  : "rgba(255,255,255,0.03)",
            }}
          >
            <span
              className="text-sm font-semibold"
              style={{
                color:
                  params.optimizeLevel === value
                    ? "#00E5FF"
                    : "rgba(255,255,255,0.65)",
              }}
            >
              {label}
            </span>
            <span className="text-[11px] text-white/30">{sub}</span>
          </button>
        ))}
      </div>
    </OptionPanel>
  );
}

function WatermarkOptions({
  params,
  onChange,
}: {
  params: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <OptionPanel title="Watermark options">
      <OptionRow label="Stamp text">
        <input
          type="text"
          className="option-input"
          placeholder="CONFIDENTIAL"
          value={params.stampText ?? "CONFIDENTIAL"}
          onChange={(e) => onChange("stampText", e.target.value)}
        />
      </OptionRow>
      <OptionRow label="Font size">
        <input
          type="number"
          min={8}
          max={120}
          className="option-input"
          value={params.fontSize ?? "30"}
          onChange={(e) => onChange("fontSize", e.target.value)}
        />
      </OptionRow>
      <OptionRow label="Rotation (°)">
        <input
          type="number"
          min={0}
          max={360}
          className="option-input"
          value={params.rotation ?? "45"}
          onChange={(e) => onChange("rotation", e.target.value)}
        />
      </OptionRow>
      <OptionRow label="Opacity (0–1)">
        <input
          type="number"
          min={0}
          max={1}
          step={0.05}
          className="option-input"
          value={params.opacity ?? "0.3"}
          onChange={(e) => onChange("opacity", e.target.value)}
        />
      </OptionRow>
    </OptionPanel>
  );
}

function RemovePagesOptions({
  params,
  onChange,
}: {
  params: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <OptionPanel title="Pages to remove">
      <OptionRow label="Page numbers">
        <input
          type="text"
          className="option-input"
          placeholder="e.g. 1,3,5-8"
          value={params.pageNumbers ?? ""}
          onChange={(e) => onChange("pageNumbers", e.target.value)}
        />
      </OptionRow>
      <p className="font-mono text-[11px] text-white/30">
        Comma-separated, or use ranges like 2-5. Pages are 1-indexed.
      </p>
    </OptionPanel>
  );
}

function OcrOptions({
  params,
  onChange,
}: {
  params: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <OptionPanel title="OCR options">
      <OptionRow label="Mode">
        <select
          className="option-select"
          value={params.ocrType ?? "Force-OCR"}
          onChange={(e) => onChange("ocrType", e.target.value)}
        >
          <option value="Force-OCR">Force OCR (overwrite existing text)</option>
          <option value="Skip-Text">Skip pages that already have text</option>
          <option value="Redo-OCR">Re-OCR all pages</option>
        </select>
      </OptionRow>
      <OptionRow label="Language">
        <select
          className="option-select"
          value={params.ocrLanguages ?? "eng"}
          onChange={(e) => onChange("ocrLanguages", e.target.value)}
        >
          <option value="eng">English</option>
          <option value="deu">German</option>
          <option value="fra">French</option>
          <option value="spa">Spanish</option>
          <option value="ita">Italian</option>
          <option value="por">Portuguese</option>
          <option value="chi_sim">Chinese (Simplified)</option>
          <option value="jpn">Japanese</option>
          <option value="ara">Arabic</option>
        </select>
      </OptionRow>
    </OptionPanel>
  );
}

function PageNumberOptions({
  params,
  onChange,
}: {
  params: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  const positions = [
    "topLeft", "topMiddle", "topRight",
    "bottomLeft", "bottomMiddle", "bottomRight",
  ];
  return (
    <OptionPanel title="Page number options">
      <OptionRow label="Position">
        <select
          className="option-select"
          value={params.position ?? "bottomMiddle"}
          onChange={(e) => onChange("position", e.target.value)}
        >
          {positions.map((p) => (
            <option key={p} value={p}>
              {p.replace(/([A-Z])/g, " $1").trim()}
            </option>
          ))}
        </select>
      </OptionRow>
      <OptionRow label="Starting number">
        <input
          type="number"
          min={1}
          className="option-input"
          value={params.startingNumber ?? "1"}
          onChange={(e) => onChange("startingNumber", e.target.value)}
        />
      </OptionRow>
      <OptionRow label="Font size (pt)">
        <input
          type="number"
          min={6}
          max={48}
          className="option-input"
          value={params.fontSize ?? "12"}
          onChange={(e) => onChange("fontSize", e.target.value)}
        />
      </OptionRow>
    </OptionPanel>
  );
}

function PasswordProtectOptions({
  params,
  onChange,
}: {
  params: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <OptionPanel title="Encryption options">
      <OptionRow label="User password">
        <input
          type="password"
          className="option-input"
          placeholder="Opens the file"
          value={params.userPassword ?? ""}
          onChange={(e) => onChange("userPassword", e.target.value)}
          autoComplete="new-password"
        />
      </OptionRow>
      <OptionRow label="Owner password">
        <input
          type="password"
          className="option-input"
          placeholder="Full permissions (auto-generated if blank)"
          value={params.ownerPassword ?? ""}
          onChange={(e) => onChange("ownerPassword", e.target.value)}
          autoComplete="new-password"
        />
      </OptionRow>
      <p className="font-mono text-[11px] text-white/30">
        AES-128 encryption · leave owner password blank to auto-generate.
      </p>
    </OptionPanel>
  );
}

function EditMetadataOptions({
  params,
  onChange,
}: {
  params: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  const fields: { key: string; label: string; placeholder: string }[] = [
    { key: "title",    label: "Title",    placeholder: "Document title" },
    { key: "author",   label: "Author",   placeholder: "Author name" },
    { key: "subject",  label: "Subject",  placeholder: "Subject / description" },
    { key: "keywords", label: "Keywords", placeholder: "comma, separated, keywords" },
    { key: "creator",  label: "Creator",  placeholder: "I Hate Docs" },
  ];
  return (
    <OptionPanel title="Document metadata">
      {fields.map(({ key, label, placeholder }) => (
        <OptionRow key={key} label={label}>
          <input
            type="text"
            className="option-input"
            placeholder={placeholder}
            value={params[key] ?? ""}
            onChange={(e) => onChange(key, e.target.value)}
          />
        </OptionRow>
      ))}
      <p className="font-mono text-[11px] text-white/30">
        Blank fields are left unchanged in the output PDF.
      </p>
    </OptionPanel>
  );
}

function FlattenOptions() {
  return (
    <OptionPanel title="Flatten interactive forms">
      <p className="text-sm text-white/50 leading-relaxed">
        All form fields, checkboxes, and annotations will be merged into the
        page as static content. This action is{" "}
        <span className="text-white/80 font-medium">irreversible</span>.
      </p>
    </OptionPanel>
  );
}

// ── Option UI primitives ──────────────────────────────────────────────────────

function OptionPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-5 space-y-4"
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/35">
        {title}
      </p>
      {children}
    </motion.div>
  );
}

function OptionRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
      <label className="text-sm text-white/50">{label}</label>
      {children}
    </div>
  );
}

// ── Workspace ─────────────────────────────────────────────────────────────────

const OPTION_COMPONENTS: Record<
  string,
  React.ComponentType<{
    params: Record<string, string>;
    onChange: (k: string, v: string) => void;
  }>
> = {
  split:            SplitOptions,
  rotate:           RotateOptions,
  compress:         CompressOptions,
  watermark:        WatermarkOptions,
  "remove-pages":   RemovePagesOptions,
  ocr:              OcrOptions,
  "page-numbers":   PageNumberOptions,
  "password-protect": PasswordProtectOptions,
  "edit-metadata":  EditMetadataOptions,
  flatten:          FlattenOptions,
};

export function ToolWorkspace({ tool }: Props) {
  const [params, setParams] = useState<Record<string, string>>(
    tool.defaultParams ?? {},
  );

  const handleParamChange = (key: string, value: string) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const OptionsPanel = OPTION_COMPONENTS[tool.id];

  return (
    <div className="space-y-4">
      {/* Options panel (tool-specific) */}
      {OptionsPanel && (
        <OptionsPanel params={params} onChange={handleParamChange} />
      )}

      {/* Drop zone */}
      <PdfDropZone
        action={tool.id}
        multiFile={tool.multiFile}
        acceptedTypes={tool.acceptedTypes}
        extraParams={params}
      />
    </div>
  );
}

// ── Global option input / select styles injected into globals.css ─────────────
// Tailwind utilities below are shared by all option panels above.
// (Actual CSS is in globals.css via @layer utilities — see below)
//
// .option-input  → text input
// .option-select → <select>
//
// These are applied inline here so we don't need a separate CSS import:
// They use Tailwind's @apply equivalent inline style approach instead.
// Add to globals.css if you prefer the @layer utilities pattern.
