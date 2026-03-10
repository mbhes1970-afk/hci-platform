import { useIntelligence } from '../hooks/useIntelligence';

const TIER_COLORS = {
  cold: { bg: 'bg-gray-800', border: 'border-gray-600', text: 'text-gray-400' },
  warm: { bg: 'bg-amber-950', border: 'border-amber-600', text: 'text-amber-400' },
  hot: { bg: 'bg-orange-950', border: 'border-orange-500', text: 'text-orange-400' },
  tier1: { bg: 'bg-red-950', border: 'border-red-500', text: 'text-red-400' },
};

export function ScoreIndicator() {
  const { fitScore, intentScore, dealFlowScore, tier, storySectionsRead } = useIntelligence();
  const colors = TIER_COLORS[tier];

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 ${colors.bg} ${colors.border} border
                  rounded-xl px-4 py-3 font-mono text-xs backdrop-blur-md
                  transition-all duration-500 opacity-70 hover:opacity-100`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${
          tier === 'cold' ? 'bg-gray-500' :
          tier === 'warm' ? 'bg-amber-500' :
          tier === 'hot' ? 'bg-orange-500 animate-pulse' :
          'bg-red-500 animate-pulse'
        }`} />
        <span className={colors.text}>
          F:{fitScore} I:{intentScore} D:{Math.round(dealFlowScore)}
        </span>
        <span className={`uppercase font-bold ${colors.text}`}>
          {tier}
        </span>
        <span className="text-brand-text-dim">
          S:{storySectionsRead}/5
        </span>
      </div>
    </div>
  );
}
