import { RefreshCw } from 'lucide-react';
import { useDeals } from '../hooks/useDeals';
import { PipelineBoard } from '../components/PipelineBoard';

export function AdminPipeline() {
  const { deals, loading, refresh } = useDeals();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-brand-text-bright">Pipeline</h1>
          <p className="text-sm text-brand-text-dim mt-1">Visueel overzicht van alle deal stages</p>
        </div>
        <button
          onClick={refresh}
          className="p-2 text-brand-text-dim hover:text-brand-text-bright border border-brand-border rounded transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      <PipelineBoard deals={deals} />
    </div>
  );
}
