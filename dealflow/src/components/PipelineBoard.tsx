import { PIPELINE_STAGES } from '../config/stages';
import type { Deal } from '../hooks/useDeals';

interface Props {
  deals: Deal[];
}

export function PipelineBoard({ deals }: Props) {
  return (
    <div className="grid grid-cols-6 gap-3 min-h-[400px]">
      {PIPELINE_STAGES.map(stage => {
        const stageDeals = deals.filter(d => d.stage === stage.id);
        return (
          <div key={stage.id} className="flex flex-col">
            <div className="flex items-center gap-2 mb-3 px-2">
              <div className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
              <span className="text-xs font-mono text-brand-text-dim uppercase tracking-wider">{stage.label}</span>
              <span className="text-[10px] font-mono text-brand-text-dim ml-auto">{stageDeals.length}</span>
            </div>
            <div className="flex-1 space-y-2">
              {stageDeals.map(d => (
                <div
                  key={d.id}
                  className="p-3 bg-brand-card border border-brand-border rounded-lg hover:border-brand-border-hover transition-colors"
                >
                  <div className="text-sm font-medium text-brand-text-bright truncate">{d.name}</div>
                  <div className="text-xs text-brand-text-dim mt-1">{d.company}</div>
                  {d.score > 0 && (
                    <div className="mt-2 flex items-center gap-1">
                      <div className="h-1 flex-1 bg-brand-elevated rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${d.score}%`, background: stage.color }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-brand-text-dim">{d.score}</span>
                    </div>
                  )}
                </div>
              ))}
              {stageDeals.length === 0 && (
                <div className="text-xs text-brand-text-dim text-center py-8 border border-dashed border-brand-border rounded-lg">
                  Geen deals
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
