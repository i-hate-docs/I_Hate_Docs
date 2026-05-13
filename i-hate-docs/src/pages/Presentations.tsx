import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { PRESENTATION_THEMES } from '@/lib/constants';
import {
  Plus, Palette, Download, Trash2, Play,
} from 'lucide-react';

interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  bullets: string[];
}

const INITIAL_SLIDES: SlideData[] = [
  {
    id: 1,
    title: 'Introduction',
    subtitle: 'Setting the stage',
    bullets: ['Problem statement', 'Current landscape', 'Key objectives'],
  },
  {
    id: 2,
    title: 'Analysis',
    subtitle: 'Deep dive into the data',
    bullets: ['Market trends', 'Competitive analysis', 'SWOT findings'],
  },
  {
    id: 3,
    title: 'Solution',
    subtitle: 'Our proposed approach',
    bullets: ['Core strategy', 'Implementation plan', 'Expected outcomes'],
  },
];

export function Presentations() {
  const addToast = useAppStore((s) => s.addToast);
  const [slides, setSlides] = useState<SlideData[]>(INITIAL_SLIDES);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTheme, setActiveTheme] = useState<string>(PRESENTATION_THEMES[0].id);

  const currentTheme = PRESENTATION_THEMES.find((t) => t.id === activeTheme) ?? PRESENTATION_THEMES[0];
  const currentSlide = slides[activeSlide] ?? slides[0];

  const addSlide = () => {
    const newSlide: SlideData = {
      id: Date.now(),
      title: 'New Slide',
      subtitle: 'Click to edit',
      bullets: ['Point one', 'Point two'],
    };
    setSlides([...slides, newSlide]);
    setActiveSlide(slides.length);
    addToast('Slide added', 'success');
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 1) {
      addToast('Cannot delete the last slide', 'error');
      return;
    }
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (activeSlide >= newSlides.length) setActiveSlide(newSlides.length - 1);
    addToast('Slide removed', 'info');
  };

  const handleExport = () => {
    addToast('Exporting presentation to PPTX...', 'info');
    setTimeout(() => addToast('Presentation exported successfully', 'success'), 1800);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
              Presentation Generator
            </h1>
            <p className="mt-1 text-sm text-text-tertiary">
              Convert documents into beautiful, AI-designed slide decks
            </p>
          </div>
          <button
            onClick={addSlide}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-light text-white rounded-lg font-semibold text-[13px] transition-colors shadow-[0_4px_20px_var(--color-accent-glow)] hover:shadow-[0_4px_28px_var(--color-accent-glow)]"
          >
            <Plus size={16} />
            New Presentation
          </button>
        </div>

        <div className="flex gap-4" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Left: Slide Thumbnails */}
          <div className="w-[200px] shrink-0 glass-panel rounded-xl border border-border-subtle flex flex-col overflow-hidden">
            <div className="px-3 py-3 border-b border-border-subtle text-[11px] font-bold text-text-tertiary uppercase tracking-[0.08em]">
              Slides
              <span className="ml-1.5 text-text-secondary">{slides.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {slides.map((slide, i) => (
                <div
                  key={slide.id}
                  onClick={() => setActiveSlide(i)}
                  className={`group relative rounded-lg cursor-pointer transition-all duration-200 ${
                    i === activeSlide
                      ? 'ring-1 ring-accent/50 shadow-[0_0_12px_var(--color-accent-glow)]'
                      : 'hover:ring-1 hover:ring-border-strong'
                  }`}
                >
                  {/* Thumbnail Preview */}
                  <div
                    className="aspect-[16/10] rounded-md overflow-hidden border border-border-subtle"
                    style={{ background: currentTheme.gradient }}
                  >
                    <div className="w-full h-full flex flex-col justify-center items-center p-2 opacity-70">
                      <div className="w-[60%] h-[3px] bg-white/30 rounded mb-1.5" />
                      <div className="w-[40%] h-[2px] bg-white/20 rounded mb-3" />
                      <div className="w-[50%] h-[1.5px] bg-white/15 rounded mb-1" />
                      <div className="w-[45%] h-[1.5px] bg-white/15 rounded mb-1" />
                      <div className="w-[55%] h-[1.5px] bg-white/15 rounded" />
                    </div>
                  </div>
                  {/* Slide number + name */}
                  <div className="mt-1.5 flex items-center gap-1.5 px-0.5">
                    <span className="text-[10px] font-semibold text-text-tertiary">{i + 1}</span>
                    <span className="text-[11px] text-text-secondary truncate flex-1">{slide.title}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeSlide(i); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-text-tertiary hover:text-rose transition-all"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                  {/* Active indicator */}
                  {i === activeSlide && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent rounded-r-sm" />
                  )}
                </div>
              ))}

              {/* Add slide button */}
              <button
                onClick={addSlide}
                className="w-full aspect-[16/10] rounded-lg border border-dashed border-border-strong hover:border-accent/50 hover:bg-accent/[0.04] flex flex-col items-center justify-center gap-2 transition-all duration-200"
              >
                <Plus size={18} className="text-text-tertiary" />
                <span className="text-[10px] font-semibold text-text-tertiary">Add Slide</span>
              </button>
            </div>
          </div>

          {/* Center: Main Slide Preview */}
          <div className="flex-1 flex items-center justify-center min-w-0">
            <div
              className="w-full max-w-[720px] rounded-2xl border border-border-strong shadow-[0_16px_64px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500"
              style={{ aspectRatio: '16/10' }}
            >
              {/* Slide Content */}
              <div
                className="w-full h-full flex flex-col relative overflow-hidden"
                style={{ background: currentTheme.gradient }}
              >
                {/* Decorative Ornaments */}
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: 'rgba(255,255,255,0.3)', transform: 'translate(30%, -30%)' }} />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: 'rgba(255,255,255,0.2)', transform: 'translate(-30%, 30%)' }} />
                <div className="absolute top-[15%] right-[10%] w-[120px] h-[120px] border border-white/5 rounded-full opacity-40" />
                <div className="absolute top-[30%] right-[8%] w-[80px] h-[80px] border border-white/5 rounded-full opacity-30" />

                {/* Accent line */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-white/20 via-white/10 to-transparent" />

                {/* Content */}
                <div className="relative z-[1] flex-1 flex flex-col justify-center px-16 py-12">
                  <h2 className="text-[28px] font-extrabold text-white/95 tracking-tight mb-3">
                    {currentSlide.title}
                  </h2>
                  <p className="text-[15px] text-white/60 mb-8">
                    {currentSlide.subtitle}
                  </p>
                  <ul className="space-y-3">
                    {currentSlide.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3 text-[14px] text-white/80">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer */}
                <div className="relative z-[1] flex items-center justify-between px-16 py-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-accent to-cyan" />
                    <span className="text-[11px] font-semibold text-white/40">I Hate Docs</span>
                  </div>
                  <span className="text-[11px] text-white/30">{activeSlide + 1} / {slides.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Theme Options */}
          <div className="w-[180px] shrink-0 glass-panel rounded-xl border border-border-subtle p-4 flex flex-col gap-6">
            <div>
              <h3 className="flex items-center gap-2 text-[11px] font-bold text-text-tertiary uppercase tracking-[0.08em] mb-3">
                <Palette size={13} />
                Theme
              </h3>
              <div className="space-y-2">
                {PRESENTATION_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setActiveTheme(theme.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                      activeTheme === theme.id
                        ? 'bg-white/[0.06] border border-border-strong'
                        : 'border border-transparent hover:bg-white/[0.03] hover:border-border-subtle'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-md border border-white/10 shrink-0"
                      style={{ background: theme.gradient }}
                    />
                    <span className={`text-[11px] font-medium truncate ${
                      activeTheme === theme.id ? 'text-text-primary' : 'text-text-secondary'
                    }`}>
                      {theme.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border-subtle" />

            {/* Export */}
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-emerald/10 border border-emerald/20 text-emerald text-[13px] font-semibold hover:bg-emerald/15 hover:border-emerald/30 hover:shadow-[0_0_16px_rgba(16,185,129,0.15)] transition-all duration-200"
            >
              <Download size={14} />
              Export PPTX
            </button>

            {/* Preview */}
            <button
              onClick={() => addToast('Starting presentation preview...', 'info')}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white/[0.04] border border-border-subtle text-text-secondary text-[13px] font-semibold hover:bg-white/[0.08] hover:border-border-strong transition-all duration-200"
            >
              <Play size={14} />
              Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Presentations;
