import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import {
  User, Cpu, Palette, Check,
} from 'lucide-react';

const AI_MODELS = [
  { id: 'gpt-4.5-turbo', label: 'GPT-4.5 Turbo' },
  { id: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { id: 'deepseek-v4', label: 'DeepSeek V4' },
];

const THEMES = [
  { id: 'dark', label: 'Deep Dark (Default)' },
  { id: 'midnight', label: 'Midnight Blue' },
  { id: 'obsidian', label: 'Obsidian Black' },
];

const FONTS = [
  { id: 'inter', label: 'Inter' },
  { id: 'jetbrains', label: 'JetBrains Mono' },
  { id: 'geist', label: 'Geist' },
  { id: 'system', label: 'System UI' },
];

export function Settings() {
  const addToast = useAppStore((s) => s.addToast);

  // Profile
  const [displayName, setDisplayName] = useState('Alex Chen');
  const [email, setEmail] = useState('alex@example.com');

  // AI Preferences
  const [model, setModel] = useState('gpt-4.5-turbo');
  const [temperature, setTemperature] = useState(70);

  // Appearance
  const [theme, setTheme] = useState('dark');
  const [font, setFont] = useState('inter');

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[600px] mx-auto px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
            Settings
          </h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Manage your account, AI preferences, and application appearance
          </p>
        </div>

        {/* --- Profile Section --- */}
        <Section icon={User} label="Profile">
          <div className="space-y-4">
            <Field label="Display Name">
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  addToast('Display name updated', 'success');
                }}
                placeholder="Your display name"
              />
            </Field>
            <Field label="Email Address">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  addToast('Email updated', 'success');
                }}
                placeholder="you@example.com"
              />
            </Field>
          </div>
        </Section>

        {/* --- AI Preferences Section --- */}
        <Section icon={Cpu} label="AI Preferences">
          <div className="space-y-5">
            <Field label="Default AI Model">
              <select
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  addToast(`Model set to ${AI_MODELS.find((m) => m.id === e.target.value)?.label}`, 'success');
                }}
              >
                {AI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </Field>

            <Field label={`Temperature (${(temperature / 100).toFixed(1)})`}>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-text-tertiary font-medium">Precise</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={temperature}
                  onChange={(e) => {
                    setTemperature(Number(e.target.value));
                    addToast(`Temperature: ${(Number(e.target.value) / 100).toFixed(1)}`, 'info');
                  }}
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${temperature}%, rgba(255,255,255,0.1) ${temperature}%, rgba(255,255,255,0.1) 100%)`,
                    accentColor: 'var(--color-accent)',
                  }}
                />
                <span className="text-[11px] text-text-tertiary font-medium">Creative</span>
              </div>
            </Field>
          </div>
        </Section>

        {/* --- Appearance Section --- */}
        <Section icon={Palette} label="Appearance">
          <div className="space-y-4">
            <Field label="Theme">
              <select
                value={theme}
                onChange={(e) => {
                  setTheme(e.target.value);
                  addToast(`Theme set to ${THEMES.find((t) => t.id === e.target.value)?.label}`, 'success');
                }}
              >
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Font">
              <select
                value={font}
                onChange={(e) => {
                  setFont(e.target.value);
                  addToast(`Font set to ${FONTS.find((f) => f.id === e.target.value)?.label}`, 'success');
                }}
              >
                {FONTS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        {/* Saved indicator */}
        <div className="flex items-center justify-end gap-2 text-[12px] text-emerald">
          <Check size={14} />
          All changes saved automatically
        </div>
      </div>
    </div>
  );
}

/* ================================
   Sub-components
   ================================ */

function Section({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border-subtle">
        <Icon size={14} className="text-accent-light" />
        <span className="text-[12px] font-bold text-text-primary uppercase tracking-[0.06em]">
          {label}
        </span>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export default Settings;
