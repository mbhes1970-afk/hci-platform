import { useDeals } from '../hooks/useDeals';
import { StageSelect } from '../components/StageSelect';

export function PartnerDeals() {
  const { deals, loading, updateStage } = useDeals();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-brand-text-bright">Mijn Deals</h1>
        <p className="text-sm text-brand-text-dim mt-1">{deals.length} deals</p>
      </div>

      <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-brand-text-dim">Laden...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-[11px] font-mono text-brand-text-dim uppercase tracking-wider border-b border-brand-border">
                <th className="text-left px-5 py-2.5">Naam</th>
                <th className="text-left px-5 py-2.5">Bedrijf</th>
                <th className="text-left px-5 py-2.5">Fase</th>
                <th className="text-left px-5 py-2.5">Score</th>
              </tr>
            </thead>
            <tbody>
              {deals.map(d => (
                <tr key={d.id} className="border-b border-brand-border last:border-0 hover:bg-brand-elevated/50">
                  <td className="px-5 py-3 text-sm text-brand-text-bright">{d.name}</td>
                  <td className="px-5 py-3 text-sm text-brand-text">{d.company}</td>
                  <td className="px-5 py-3"><StageSelect value={d.stage} onChange={s => updateStage(d.id, s)} /></td>
                  <td className="px-5 py-3 text-xs font-mono text-brand-text-dim">{d.score || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
