import type { CmoFmoRow, Language } from '../config/types';
import { t } from '../config/i18n';

interface Props {
  rows: CmoFmoRow[];
  lang: Language;
}

export function CmoFmoTable({ rows, lang }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-brand-bg-elevated">
            <th className="text-left p-3 text-xs font-mono text-brand-text-dim border-b border-brand-border">Dimensie</th>
            <th className="text-left p-3 text-xs font-mono text-red-400 border-b border-brand-border">CMO (huidige situatie)</th>
            <th className="text-left p-3 text-xs font-mono text-green-400 border-b border-brand-border">FMO (gewenste situatie)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-brand-border hover:bg-brand-bg-elevated/50 transition-colors">
              <td className="p-3 font-medium text-brand-text-bright">{row.dimension[lang]}</td>
              <td className="p-3 text-brand-text">{row.cmo[lang]}</td>
              <td className="p-3 text-brand-text">{row.fmo[lang]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
