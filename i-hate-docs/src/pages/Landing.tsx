import { Link } from 'react-router-dom';
import { APP_NAME } from '@/lib/constants';

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg-deep text-text-primary font-sans overflow-x-hidden">
      {/* Background */}
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      <div className="bg-grid" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-cyan flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-text-primary to-accent-light bg-clip-text text-transparent">{APP_NAME}</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/auth" className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors">Sign In</Link>
          <Link to="/auth" className="px-5 py-2.5 bg-accent hover:bg-accent-light text-white rounded-lg text-sm font-semibold transition-colors shadow-[0_4px_16px_var(--color-accent-glow)]">
            Try Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto text-center pt-24 pb-16 px-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-xs font-semibold text-accent-light mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-light animate-[ai-pulse_2s_infinite]" />
          Now with AI Agents — v2.3
        </div>
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
          <span className="bg-gradient-to-b from-text-primary to-text-secondary bg-clip-text text-transparent">The Future</span>
          <br />
          <span className="bg-gradient-to-r from-accent-light via-violet to-cyan bg-clip-text text-transparent">of Documents</span>
        </h1>
        <p className="text-lg text-text-tertiary max-w-2xl mx-auto mb-10 leading-relaxed">
          Edit, chat with, summarize, redesign, and translate your PDFs — all powered by AI.
          The document operating system built for the next generation.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/app" className="px-8 py-3.5 bg-accent hover:bg-accent-light text-white rounded-xl text-sm font-bold transition-colors shadow-[0_8px_32px_var(--color-accent-glow)]">
            Start free
          </Link>
          <Link to="/auth" className="px-8 py-3.5 bg-white/[0.04] border border-border-strong hover:border-border-glow text-text-secondary hover:text-text-primary rounded-xl text-sm font-bold transition-colors">
            Watch demo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Chat with PDFs', desc: 'Ask questions, get summaries, and extract insights from any document using natural language.' },
            { title: 'Smart Edit', desc: 'Rewrite, format, and restructure PDFs with AI-powered editing that understands context.' },
            { title: 'AI Redesign', desc: 'Transform documents with intelligent design — better typography, spacing, and layouts.' },
            { title: 'Auto Summarize', desc: 'Instantly generate executive summaries, key findings, and actionable takeaways.' },
            { title: 'Translate & Preserve', desc: 'Translate documents to 50+ languages while preserving formatting and layout.' },
            { title: 'Scan to Edit', desc: 'OCR-powered scanning converts images and scanned PDFs into editable documents.' },
          ].map((f) => (
            <div
              key={f.title}
              className="glass-panel-strong rounded-2xl p-6 hover:border-border-strong hover:scale-[1.02] transition-all duration-300 cursor-default group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-light"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10h-10V2z"/></svg>
              </div>
              <h3 className="text-base font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-text-tertiary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <div className="glass-panel-strong rounded-2xl p-12 text-center border border-accent/10">
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">Ready to hate docs less?</h2>
          <p className="text-text-tertiary mb-8 max-w-md mx-auto">Join thousands of researchers, engineers, and teams already using I Hate Docs.</p>
          <Link to="/auth" className="inline-block px-8 py-3.5 bg-accent hover:bg-accent-light text-white rounded-xl text-sm font-bold transition-colors shadow-[0_8px_32px_var(--color-accent-glow)]">
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border-subtle py-8 text-center">
        <p className="text-xs text-text-tertiary">© 2025 {APP_NAME}. Built for the future of documents.</p>
      </footer>
    </div>
  );
}
