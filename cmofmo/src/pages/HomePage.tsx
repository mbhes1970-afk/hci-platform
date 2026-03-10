import { useIntelligence } from '../hooks/useIntelligence';
import type { IcpId } from '../config/types';

const ICP_CARDS: { id: IcpId; label: string; subtitle: string; icon: string; href: string }[] = [
  {
    id: 'icp1',
    label: 'EU Market Entry',
    subtitle: 'Voor tech-bedrijven die de EU-markt willen betreden. CRA, AI Act, NIS2 compliance + go-to-market.',
    icon: '\ud83c\udf0d',
    href: '/eu-entry',
  },
  {
    id: 'icp2',
    label: 'Partners & Resellers',
    subtitle: 'Vergroot uw portfolio met compliance-oplossingen. Partner enablement van dag \u00e9\u00e9n.',
    icon: '\ud83e\udd1d',
    href: '/growth',
  },
  {
    id: 'icp3',
    label: 'Compliance Assessment',
    subtitle: 'NIS2, DORA, CRA, AVG \u2014 weet waar uw organisatie staat. CMO\u2192FMO rapport in 9 vragen.',
    icon: '\ud83d\udee1\ufe0f',
    href: '/compliance',
  },
];

export function HomePage() {
  const { setIcp } = useIntelligence();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <span className="font-mono text-xs tracking-widest uppercase text-brand-primary mb-6 px-4 py-1.5 rounded-full bg-brand-primary-dim">
          HES Consultancy International
        </span>

        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-brand-text-bright leading-tight max-w-4xl mb-6">
          From Strategy to{' '}
          <span className="text-brand-primary">First Customer</span>
        </h1>

        <p className="text-lg md:text-xl text-brand-text max-w-2xl mb-16">
          EU compliance, market entry en partner enablement.
          30+ jaar ervaring. C-level netwerk in Benelux en DACH.
        </p>

        {/* ICP selector grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {ICP_CARDS.map(card => (
            <a
              key={card.id}
              href={card.href}
              onClick={() => setIcp(card.id)}
              className="group relative bg-brand-bg-card border border-brand-border rounded-2xl p-8
                         hover:border-brand-primary hover:bg-brand-bg-elevated
                         transition-all duration-300 text-left"
            >
              <span className="text-4xl mb-4 block">{card.icon}</span>
              <h3 className="font-serif text-xl text-brand-text-bright mb-3 group-hover:text-brand-primary transition-colors">
                {card.label}
              </h3>
              <p className="text-sm text-brand-text leading-relaxed">
                {card.subtitle}
              </p>
              <span className="inline-block mt-4 text-brand-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Ontdek meer \u2192
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-t border-brand-border px-6 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '30+', label: 'Jaar ervaring' },
            { value: '8', label: 'Compliance sectoren' },
            { value: 'EU', label: 'Market coverage' },
            { value: '3', label: 'Programma\u2019s' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="font-serif text-3xl text-brand-primary mb-1">{stat.value}</div>
              <div className="text-xs text-brand-text-dim uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Programma overview */}
      <section className="border-t border-brand-border px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl text-brand-text-bright text-center mb-10">
            Programma\u2019s
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'EU Market Intelligence', price: '\u20ac5.000', model: 'eenmalig \u00b7 3 weken', num: 'I' },
              { name: 'EU Market Entry', price: '\u20ac14.500/kw', model: 'verlengbaar', num: 'II' },
              { name: 'First Customer', price: '\u20ac9.500/kw', model: '+ 8-12% succesfee', num: 'III' },
            ].map(p => (
              <div key={p.num} className="bg-brand-bg-card border border-brand-border rounded-xl p-6">
                <span className="font-mono text-xs text-brand-primary">{`Programma ${p.num}`}</span>
                <h3 className="font-serif text-lg text-brand-text-bright mt-2 mb-1">{p.name}</h3>
                <div className="text-brand-primary font-semibold text-xl mb-1">{p.price}</div>
                <div className="text-xs text-brand-text-dim">{p.model}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-brand-text-dim text-center mt-6">
            Succesfee Programma III: {'<'}\u20ac50k = 12% \u00b7 \u20ac50k-\u20ac150k = 10% \u00b7 {'>'}\u20ac150k = 8%
          </p>
        </div>
      </section>
    </div>
  );
}
