import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { REDESIGN_TEMPLATES } from '@/lib/constants';
import {
  ArrowRight, Sparkles, PanelLeft, PanelRight, Check,
} from 'lucide-react';

interface PresetData {
  id: string;
  label: string;
  gradient: string;
}

export function Redesign() {
  const addToast = useAppStore((s) => s.addToast);
  const [activePreset, setActivePreset] = useState<PresetData>(REDESIGN_TEMPLATES[0]);
  const [isTransforming, setIsTransforming] = useState(false);

  const handleTransform = () => {
    setIsTransforming(true);
    addToast('AI is transforming your document...', 'info');
    setTimeout(() => {
      setIsTransforming(false);
      addToast('Document redesigned successfully', 'success');
    }, 2000);
  };

  const handlePresetSelect = (preset: PresetData) => {
    setActivePreset(preset);
    addToast(`Style "${preset.label}" applied`, 'info');
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
            AI Redesign
          </h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Transform raw documents into professionally formatted layouts
          </p>
        </div>

        {/* Before/After Panels */}
        <div className="flex items-stretch gap-0 mb-8">
          {/* Before Panel */}
          <div className="flex-1 glass-panel rounded-2xl border border-border-subtle overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle">
              <PanelLeft size={14} className="text-text-tertiary" />
              <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.08em]">
                Before
              </span>
            </div>
            <div className="p-6 space-y-4">
              {/* Raw lines representing unformatted doc */}
              <div className="space-y-2">
                <div className="h-3 w-[80%] bg-white/[0.06] rounded" />
                <div className="h-3 w-[95%] bg-white/[0.06] rounded" />
                <div className="h-3 w-[70%] bg-white/[0.06] rounded" />
              </div>
              <div className="space-y-1.5 mt-5">
                <div className="h-2 w-full bg-white/[0.04] rounded" />
                <div className="h-2 w-[90%] bg-white/[0.04] rounded" />
                <div className="h-2 w-[85%] bg-white/[0.04] rounded" />
                <div className="h-2 w-[95%] bg-white/[0.04] rounded" />
                <div className="h-2 w-[75%] bg-white/[0.04] rounded" />
                <div className="h-2 w-[60%] bg-white/[0.04] rounded" />
              </div>
              <div className="space-y-1.5 mt-5">
                <div className="h-2 w-full bg-white/[0.04] rounded" />
                <div className="h-2 w-[92%] bg-white/[0.04] rounded" />
                <div className="h-2 w-[80%] bg-white/[0.04] rounded" />
                <div className="h-2 w-[70%] bg-white/[0.04] rounded" />
                <div className="h-2 w-[88%] bg-white/[0.04] rounded" />
                <div className="h-2 w-[50%] bg-white/[0.04] rounded" />
                <div className="h-2 w-[65%] bg-white/[0.04] rounded" />
              </div>
              <div className="space-y-2 mt-5">
                <div className="h-3 w-[75%] bg-white/[0.06] rounded" />
                <div className="h-3 w-[60%] bg-white/[0.06] rounded" />
              </div>
            </div>
          </div>

          {/* Center Transform Arrow */}
          <div className="flex flex-col items-center justify-center px-3 shrink-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-full glass-panel-strong border border-border-strong flex items-center justify-center">
                <ArrowRight size={18} className="text-accent-light" />
              </div>
              <div className="absolute inset-0 rounded-full animate-[float-pulse_2s_ease-out_infinite] opacity-0 border-2 border-accent" />
            </div>
            <button
              onClick={handleTransform}
              disabled={isTransforming}
              className="mt-2 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap"
              style={{
                background: isTransforming ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.25)',
                color: '#818cf8',
              }}
            >
              {isTransforming ? (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(129,140,248,0.3)', borderTopColor: '#818cf8' }} />
                  AI Transform
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Sparkles size={11} />
                  AI Transform
                </span>
              )}
            </button>
          </div>

          {/* After Panel */}
          <div className="flex-1 glass-panel-strong rounded-2xl border border-accent/20 overflow-hidden relative">
            {/* Glow accent top border */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-accent/60 via-accent/20 to-transparent" />

            <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle">
              <PanelRight size={14} className="text-accent-light" />
              <span className="text-[11px] font-bold text-accent-light uppercase tracking-[0.08em]">
                After (AI Enhanced)
              </span>
              <Check size={12} className="ml-auto text-emerald" />
            </div>
            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <div className="h-5 w-[50%] bg-white/[0.12] rounded mb-2" />
                <div className="h-3 w-[30%] bg-white/[0.07] rounded" />
              </div>

              {/* Section header */}
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-accent" />
                <div className="h-4 w-[35%] bg-white/[0.1] rounded" />
              </div>
              <div className="space-y-2 pl-3">
                <div className="h-2 w-full bg-white/[0.05] rounded" />
                <div className="h-2 w-[92%] bg-white/[0.05] rounded" />
                <div className="h-2 w-[85%] bg-white/[0.05] rounded" />
                <div className="h-2 w-[70%] bg-white/[0.05] rounded" />
              </div>

              {/* Another section */}
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-cyan" />
                <div className="h-4 w-[40%] bg-white/[0.1] rounded" />
              </div>
              <div className="space-y-2 pl-3">
                <div className="h-2 w-full bg-white/[0.05] rounded" />
                <div className="h-2 w-[88%] bg-white/[0.05] rounded" />
                <div className="h-2 w-[75%] bg-white/[0.05] rounded" />
              </div>

              {/* Callout box */}
              <div className="p-3 rounded-lg border border-accent/15 bg-accent/[0.04]">
                <div className="flex items-start gap-2">
                  <Sparkles size={13} className="text-accent-light mt-0.5 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-2.5 w-[80%] bg-white/[0.08] rounded" />
                    <div className="h-2.5 w-[65%] bg-white/[0.06] rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Style Presets */}
        <div>
          <h3 className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.08em] mb-3">
            Style Presets
          </h3>
          <div className="flex gap-3">
            {REDESIGN_TEMPLATES.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset as PresetData)}
                className={`flex-1 p-4 rounded-xl border transition-all duration-300 ${
                  activePreset.id === preset.id
                    ? 'border-accent/50 bg-accent/[0.06] shadow-[0_0_20px_var(--color-accent-glow)]'
                    : 'border-border-subtle bg-white/[0.02] hover:bg-white/[0.04] hover:border-border-strong'
                }`}
              >
                <div
                  className="w-full aspect-[16/9] rounded-lg mb-3 border border-white/5 relative overflow-hidden"
                  style={{ background: preset.gradient }}
                >
                  {/* Mini preview lines */}
                  <div className="absolute inset-0 flex flex-col justify-center p-3 opacity-60">
                    <div className="w-[60%] h-[3px] bg-white/40 rounded mb-1.5" />
                    <div className="w-[40%] h-[2px] bg-white/25 rounded mb-3" />
                    <div className="space-y-1">
                      <div className="w-[50%] h-[1.5px] bg-white/20 rounded" />
                      <div className="w-[45%] h-[1.5px] bg-white/20 rounded" />
                      <div className="w-[55%] h-[1.5px] bg-white/20 rounded" />
                    </div>
                  </div>
                </div>
                <span className={`text-[12px] font-semibold ${
                  activePreset.id === preset.id ? 'text-accent-light' : 'text-text-secondary'
                }`}>
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Redesign;
