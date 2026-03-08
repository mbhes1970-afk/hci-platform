import { useWizard } from '../hooks/useWizard';
import { useLanguage, t } from '../config/i18n';
import { SECTORS } from '../config/sectors';

export function SectorSelector() {
  const { sector, setSector } = useWizard();
  const { lang } = useLanguage();

  return (
    <div>
      <h2 className="font-serif text-2xl text-brand-text-bright mb-2">
        {t('sector.title', lang)}
      </h2>
      <p className="text-sm text-brand-text-dim mb-6">
        {t('sector.subtitle', lang)}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SECTORS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSector(s.id)}
            className={`
              group relative p-4 rounded-xl border text-left transition-all duration-200
              ${sector === s.id
                ? 'border-brand-primary bg-brand-primary-dim'
                : 'border-brand-border bg-brand-bg-card hover:border-brand-primary-light hover:bg-brand-bg-elevated'
              }
            `}
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`text-sm font-bold mb-1 ${sector === s.id ? 'text-brand-primary-light' : 'text-brand-text-bright'}`}>
              {s.label[lang]}
            </div>
            <div className="text-xs text-brand-text-dim leading-relaxed mb-2">
              {s.subtitle[lang]}
            </div>
            <div className="flex flex-wrap gap-1">
              {s.regulations.map((reg) => (
                <span key={reg} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-brand-bg-elevated text-brand-text-dim border border-brand-border">
                  {reg}
                </span>
              ))}
            </div>
            {sector === s.id && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
                <span className="text-white text-xs">\u2713</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
