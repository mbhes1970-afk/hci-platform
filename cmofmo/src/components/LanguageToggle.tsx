import { useLanguage } from '../config/i18n';

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex gap-1">
      {(['nl', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`
            px-3 py-1 text-[11px] font-bold font-mono rounded transition-all
            ${lang === l
              ? 'bg-brand-primary text-white'
              : 'bg-brand-bg-elevated text-brand-text-dim border border-brand-border hover:text-brand-text-bright'
            }
          `}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
