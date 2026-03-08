import type { DimensionScore, Language } from '../config/types';

const COLOR_MAP = {
  green: { ring: '#059669', bg: 'rgba(5,150,105,0.1)', text: '#34d399' },
  amber: { ring: '#f59e0b', bg: 'rgba(245,158,11,0.1)', text: '#fbbf24' },
  red:   { ring: '#ef4444', bg: 'rgba(239,68,68,0.1)', text: '#f87171' },
};

interface Props {
  score: DimensionScore;
  lang: Language;
}

export function ScoreCard({ score, lang }: Props) {
  const colors = COLOR_MAP[score.color];
  const pct = (score.score / score.maxScore) * 100;
  const circumference = 2 * Math.PI * 45; // r=45
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="bg-brand-bg-card border border-brand-border rounded-xl p-4 text-center">
      {/* Score ring */}
      <div className="relative w-20 h-20 mx-auto mb-3">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6"
            className="text-brand-bg-elevated" />
          <circle cx="50" cy="50" r="45" fill="none" strokeWidth="6" strokeLinecap="round"
            stroke={colors.ring}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color: colors.text }}>
            {score.score}/{score.maxScore}
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="text-xs font-medium text-brand-text-bright mb-1">
        {score.label[lang]}
      </div>

      {/* Status badge */}
      <div
        className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {score.className}
      </div>
    </div>
  );
}
