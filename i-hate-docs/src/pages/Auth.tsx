import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { APP_NAME } from '@/lib/constants';

export default function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/app" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    let result: { error?: string } = {};
    if (mode === 'login') {
      result = await signIn(email, password);
    } else if (mode === 'signup') {
      result = await signUp(email, password, name);
    }

    if (result.error) setError(result.error);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center p-6 relative">
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
      </div>
      <div className="bg-grid" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-cyan flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-text-primary to-accent-light bg-clip-text text-transparent">{APP_NAME}</span>
        </Link>

        {/* Card */}
        <div className="glass-panel-strong rounded-2xl p-8">
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Get started' : 'Reset password'}
          </h1>
          <p className="text-sm text-text-tertiary mb-8">
            {mode === 'login' ? 'Sign in to your workspace' : mode === 'signup' ? 'Create your free account' : 'We\'ll send you a reset link'}
          </p>

          {error && (
            <div className="mb-6 p-3 bg-rose/10 border border-rose/20 rounded-lg text-sm text-rose">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-text-tertiary mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-white/[0.04] border border-border-strong rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:ring-2 focus:ring-accent/10 transition-colors"
                  placeholder="Alex Chen"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-text-tertiary mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-white/[0.04] border border-border-strong rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:ring-2 focus:ring-accent/10 transition-colors"
                placeholder="alex@example.com"
                required
              />
            </div>
            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-semibold text-text-tertiary mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-white/[0.04] border border-border-strong rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:ring-2 focus:ring-accent/10 transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full p-3 bg-accent hover:bg-accent-light text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 shadow-[0_4px_16px_var(--color-accent-glow)]"
            >
              {submitting
                ? 'Please wait...'
                : mode === 'login'
                ? 'Sign in'
                : mode === 'signup'
                ? 'Create account'
                : 'Send reset link'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text-tertiary space-y-2">
            {mode === 'login' ? (
              <>
                <button onClick={() => setMode('signup')} className="text-accent-light hover:text-accent transition-colors">Don&apos;t have an account? <span className="font-semibold">Sign up free</span></button>
                <br />
                <button onClick={() => setMode('forgot')} className="text-text-tertiary hover:text-text-secondary transition-colors text-xs">Forgot password?</button>
              </>
            ) : mode === 'signup' ? (
              <button onClick={() => setMode('login')} className="text-accent-light hover:text-accent transition-colors">Already have an account? <span className="font-semibold">Sign in</span></button>
            ) : (
              <button onClick={() => setMode('login')} className="text-accent-light hover:text-accent transition-colors">Back to sign in</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
