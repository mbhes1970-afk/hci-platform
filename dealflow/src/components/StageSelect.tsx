import { PIPELINE_STAGES, type Stage } from '../config/stages';

interface Props {
  value: Stage;
  onChange: (stage: Stage) => void;
  disabled?: boolean;
}

export function StageSelect({ value, onChange, disabled }: Props) {
  const current = PIPELINE_STAGES.find(s => s.id === value);

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as Stage)}
      disabled={disabled}
      className="text-xs font-mono px-2 py-1 rounded border border-brand-border bg-brand-elevated text-brand-text-bright appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-accent"
      style={{ borderColor: current?.color }}
    >
      {PIPELINE_STAGES.map(s => (
        <option key={s.id} value={s.id}>{s.label}</option>
      ))}
    </select>
  );
}
