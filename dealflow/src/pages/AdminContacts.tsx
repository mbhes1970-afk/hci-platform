import { RefreshCw } from 'lucide-react';
import { useContacts } from '../hooks/useContacts';

export function AdminContacts() {
  const { contacts, loading, refresh } = useContacts();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-brand-text-bright">Contacts</h1>
          <p className="text-sm text-brand-text-dim mt-1">{contacts.length} contacten</p>
        </div>
        <button
          onClick={refresh}
          className="p-2 text-brand-text-dim hover:text-brand-text-bright border border-brand-border rounded transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-brand-text-dim">Laden...</div>
        ) : contacts.length === 0 ? (
          <div className="p-8 text-center text-sm text-brand-text-dim">Nog geen contacten.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-[11px] font-mono text-brand-text-dim uppercase tracking-wider border-b border-brand-border">
                <th className="text-left px-5 py-2.5">Naam</th>
                <th className="text-left px-5 py-2.5">Email</th>
                <th className="text-left px-5 py-2.5">Bedrijf</th>
                <th className="text-left px-5 py-2.5">Rol</th>
                <th className="text-left px-5 py-2.5">Datum</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c.id} className="border-b border-brand-border last:border-0 hover:bg-brand-elevated/50 transition-colors">
                  <td className="px-5 py-3 text-sm text-brand-text-bright">{c.name}</td>
                  <td className="px-5 py-3 text-sm text-brand-accent">{c.email}</td>
                  <td className="px-5 py-3 text-sm text-brand-text">{c.company}</td>
                  <td className="px-5 py-3 text-sm text-brand-text-dim">{c.role || '—'}</td>
                  <td className="px-5 py-3 text-xs text-brand-text-dim font-mono">
                    {new Date(c.created).toLocaleDateString('nl-NL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
