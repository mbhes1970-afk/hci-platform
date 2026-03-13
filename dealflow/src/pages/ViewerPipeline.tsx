import { useDeals } from '../hooks/useDeals';
import { PipelineBoard } from '../components/PipelineBoard';

export function ViewerPipeline() {
  const { deals, loading } = useDeals();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-brand-text-bright">Pipeline Overzicht</h1>
        <p className="text-sm text-brand-text-dim mt-1">Read-only weergave</p>
      </div>
      {loading ? (
        <div className="text-sm text-brand-text-dim">Laden...</div>
      ) : (
        <PipelineBoard deals={deals} />
      )}
    </div>
  );
}
