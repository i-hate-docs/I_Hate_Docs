import { useAppStore } from '@/stores/appStore';
import {
  Sigma, Braces, Quote, FileText, ArrowRight,
} from 'lucide-react';

interface ResearchTool {
  id: string;
  name: string;
  description: string;
  icon: typeof Sigma;
  color: string;
  action: string;
}

const TOOLS: ResearchTool[] = [
  {
    id: 'explain-equation',
    name: 'Explain Equation',
    description: 'Break down complex mathematical equations step by step with clear explanations and visualizations.',
    icon: Sigma,
    color: '#6366f1',
    action: 'Opening equation explainer...',
  },
  {
    id: 'latex-convert',
    name: 'LaTeX Conversion',
    description: 'Convert equations, tables, and formatted text into clean, compilable LaTeX code.',
    icon: Braces,
    color: '#06b6d4',
    action: 'Starting LaTeX conversion...',
  },
  {
    id: 'auto-citations',
    name: 'Auto Citations',
    description: 'Scan your document for claims and automatically generate verified citations in any format.',
    icon: Quote,
    color: '#10b981',
    action: 'Generating citations...',
  },
  {
    id: 'paper-summarizer',
    name: 'Paper Summarizer',
    description: 'Extract key findings, methodology, and conclusions from academic papers in seconds.',
    icon: FileText,
    color: '#8b5cf6',
    action: 'Summarizing paper content...',
  },
];

export function Research() {
  const addToast = useAppStore((s) => s.addToast);

  const handleToolAction = (tool: ResearchTool) => {
    addToast(tool.action, 'info');
    setTimeout(() => {
      addToast(`${tool.name} completed`, 'success');
    }, 2000);
  };

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
            Research Mode
          </h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Powerful tools for academic research and document analysis
          </p>
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TOOLS.map((tool) => (
            <div
              key={tool.id}
              className="group glass-panel rounded-2xl p-6 border border-border-subtle hover:border-border-glow hover:scale-[1.02] transition-all duration-300"
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: hexToRgba(tool.color, 0.1) }}
              >
                <tool.icon size={22} style={{ color: tool.color }} />
              </div>

              {/* Content */}
              <h3 className="text-[15px] font-bold text-text-primary mb-1.5">
                {tool.name}
              </h3>
              <p className="text-[13px] text-text-tertiary leading-relaxed mb-5">
                {tool.description}
              </p>

              {/* Action Button */}
              <button
                onClick={() => handleToolAction(tool)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-300"
                style={{
                  backgroundColor: hexToRgba(tool.color, 0.08),
                  border: `1px solid ${hexToRgba(tool.color, 0.2)}`,
                  color: tool.color,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = hexToRgba(tool.color, 0.15);
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 20px ${hexToRgba(tool.color, 0.25)}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = hexToRgba(tool.color, 0.08);
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                }}
              >
                Try it
                <ArrowRight size={14} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Research;
