import { useWizard } from '../hooks/useWizard';
import { useLanguage, t } from '../config/i18n';
import { ROLES } from '../config/roles';

export function RoleSelector() {
  const { role, setRole } = useWizard();
  const { lang } = useLanguage();

  return (
    <div>
      <h2 className="font-serif text-2xl text-brand-text-bright mb-2">
        {t('role.title', lang)}
      </h2>
      <p className="text-sm text-brand-text-dim mb-6">
        {t('role.subtitle', lang)}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ROLES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            className={`
              group relative p-4 rounded-xl border text-left transition-all duration-200
              ${role === r.id
                ? 'border-brand-primary bg-brand-primary-dim'
                : 'border-brand-border bg-brand-bg-card hover:border-brand-primary-light hover:bg-brand-bg-elevated'
              }
            `}
          >
            <div className="text-2xl mb-2">{r.icon}</div>
            <div className={`text-sm font-bold mb-1 ${role === r.id ? 'text-brand-primary-light' : 'text-brand-text-bright'}`}>
              {r.label[lang]}
            </div>
            <div className="text-xs text-brand-text-dim leading-relaxed">
              {r.hook[lang]}
            </div>
            {role === r.id && (
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
