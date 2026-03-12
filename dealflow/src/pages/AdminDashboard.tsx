import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useDeals } from '../hooks/useDeals';
import { StageSelect } from '../components/StageSelect';
import { NewDealModal } from '../components/NewDealModal';
import { PIPELINE_STAGES } from '../config/stages';

export function AdminDashboard() {
  const { deals, loading, refresh, updateStage, createDeal } = useDeals();
  const [showNew, setShowNew] = useState(false);

  const stageCounts = PIPELINE_STAGES.map(s => ({
    ...s,
    count: deals.filter(d => d.stage === s.id).length,
  }));

  const activeDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-brand-text-bright">Dashboard</h1>
          <p className="text-sm text-brand-text-dim mt-1">{deals.length} deals totaal &middot; {activeDeals.length} actief</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="p-2 text-brand-text-dim hover:text-brand-text-bright border border-brand-border rounded transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-brand-accent text-white rounded hover:bg-brand-accent-light transition-colors"
          >
            <Plus size={16} />
            Nieuwe Deal
          </button>
        </div>
      </div>

      {/* Stage counters */}
      <div className="grid grid-cols-6 gap-3 mb-8">
        {stageCounts.map(s => (
          <div key={s.id} className="bg-brand-card border border-brand-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <span className="text-[11px] font-mono text-brand-text-dim uppercase tracking-wider">{s.label}</span>
            </div>
            <div className="text-2xl font-semibold text-brand-text-bright">{s.count}</div>
          </div>
        ))}
      </div>

      {/* Deals table */}
      <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-brand-border">
          <h2 className="text-sm font-mono text-brand-text-dim uppercase tracking-wider">Alle Deals</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-brand-text-dim">Laden...</div>
        ) : deals.length === 0 ? (
          <div className="p-8 text-center text-sm text-brand-text-dim">
            Nog geen deals. Klik "Nieuwe Deal" om te beginnen.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-[11px] font-mono text-brand-text-dim uppercase tracking-wider border-b border-brand-border">
                <th className="text-left px-5 py-2.5">Naam</th>
                <th className="text-left px-5 py-2.5">Bedrijf</th>
                <th className="text-left px-5 py-2.5">Fase</th>
                <th className="text-left px-5 py-2.5">Score</th>
                <th className="text-left px-5 py-2.5">Datum</th>
              </tr>
            </thead>
            <tbody>
              {deals.map(d => (
                <tr key={d.id} className="border-b border-brand-border last:border-0 hover:bg-brand-elevated/50 transition-colors">
                  <td className="px-5 py-3 text-sm text-brand-text-bright">{d.name}</td>
                  <td className="px-5 py-3 text-sm text-brand-text">{d.company}</td>
                  <td className="px-5 py-3">
                    <StageSelect value={d.stage} onChange={stage => updateStage(d.id, stage)} />
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-mono text-brand-text-dim">{d.score || '—'}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-brand-text-dim font-mono">
                    {new Date(d.created).toLocaleDateString('nl-NL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showNew && (
        <NewDealModal
          onSubmit={async data => {
            await createDeal(data);
            setShowNew(false);
          }}
          onClose={() => setShowNew(false)}
        />
      )}
    </div>
  );
}
