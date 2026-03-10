import { SECTOR_MAP, type SectorCode } from '../config/icp-content';
import { useIntelligence } from '../hooks/useIntelligence';
import type { SectorId } from '../config/types';

export function SectorSelector() {
  const { selectedSector, setSector, addSignal } = useIntelligence();

  const handleSelect = (code: SectorCode) => {
    setSector(code as SectorId);
    addSignal({ type: 'icp_select', fitDelta: 5, meta: { sector: code } });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {(Object.entries(SECTOR_MAP) as [SectorCode, typeof SECTOR_MAP[SectorCode]][]).map(([code, sector]) => {
        const isActive = selectedSector === code;
        return (
          <a
            key={code}
            href={`/compliance/${code}`}
            onClick={(e) => {
              e.preventDefault();
              handleSelect(code);
              window.location.href = `/compliance/${code}`;
            }}
            className={`relative rounded-xl border p-5 transition-all duration-200 text-left
              ${isActive
                ? 'border-brand-primary bg-brand-primary-dim'
                : 'border-brand-border bg-brand-bg-card hover:border-brand-primary/50 hover:bg-brand-bg-elevated'
              }`}
          >
            <span className="text-2xl mb-2 block">{sector.icon}</span>
            <h3 className="text-sm font-medium text-brand-text-bright mb-1">{sector.naam}</h3>
            <div className="flex flex-wrap gap-1 mt-2">
              {sector.frameworks.map(fw => (
                <span
                  key={fw}
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-brand-bg-elevated text-brand-text-dim"
                >
                  {fw}
                </span>
              ))}
            </div>
          </a>
        );
      })}
    </div>
  );
}
