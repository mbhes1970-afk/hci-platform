import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch {
      // error state is handled by useAuth
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-xs font-mono text-brand-accent tracking-widest uppercase mb-2">HCI DealFlow</div>
          <h1 className="text-2xl font-semibold text-brand-text-bright">Inloggen</h1>
          <p className="text-sm text-brand-text-dim mt-2">Pipeline management platform</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-4">
          {error && (
            <div className="px-3 py-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-mono text-brand-text-dim uppercase tracking-wider">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              className="mt-1 w-full px-3 py-2.5 text-sm bg-brand-elevated border border-brand-border rounded text-brand-text-bright placeholder:text-brand-text-dim focus:outline-none focus:ring-1 focus:ring-brand-accent"
              placeholder="uw@email.nl"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-brand-text-dim uppercase tracking-wider">Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2.5 text-sm bg-brand-elevated border border-brand-border rounded text-brand-text-bright placeholder:text-brand-text-dim focus:outline-none focus:ring-1 focus:ring-brand-accent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-brand-accent text-white rounded hover:bg-brand-accent-light transition-colors disabled:opacity-50"
          >
            <LogIn size={16} />
            {loading ? 'Bezig...' : 'Inloggen'}
          </button>
        </form>

        <p className="text-center text-[11px] text-brand-text-dim mt-6">
          HES Consultancy International &middot; DealFlow v1.0
        </p>
      </div>
    </div>
  );
}
