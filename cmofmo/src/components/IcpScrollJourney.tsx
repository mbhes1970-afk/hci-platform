import { useEffect, useRef } from 'react';
import type { StorySection } from '../config/icp-content';
import { useIntelligence } from '../hooks/useIntelligence';

interface Props {
  sections: StorySection[];
  children?: React.ReactNode; // QuickQualifier rendered after section 5
}

function ScrollSection({ section, index }: { section: StorySection; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);
  const incrementStorySections = useIntelligence(s => s.incrementStorySections);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !firedRef.current) {
          firedRef.current = true;
          incrementStorySections();
        }
      },
      { threshold: 0.7 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [incrementStorySections]);

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center px-6 py-24"
    >
      <div
        className="max-w-3xl w-full animate-fade-in"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Kicker */}
        <span className="inline-block font-mono text-xs tracking-widest uppercase text-brand-primary mb-4 px-3 py-1 rounded-full bg-brand-primary-dim">
          {section.kicker}
        </span>

        {/* Headline */}
        <h2 className="font-serif text-3xl md:text-5xl text-brand-text-bright leading-tight mb-8">
          {section.headline}
        </h2>

        {/* Body */}
        <p className="text-lg md:text-xl text-brand-text leading-relaxed max-w-2xl">
          {section.body}
        </p>

        {/* Section indicator */}
        <div className="mt-12 flex items-center gap-2">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i <= index ? 'w-8 bg-brand-primary' : 'w-4 bg-brand-border'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function IcpScrollJourney({ sections, children }: Props) {
  return (
    <div>
      {sections.map((section, i) => (
        <ScrollSection key={i} section={section} index={i} />
      ))}
      {/* QuickQualifier appears after the last section */}
      {children && (
        <section className="min-h-screen flex items-center justify-center px-6 py-24">
          <div className="max-w-3xl w-full">
            {children}
          </div>
        </section>
      )}
    </div>
  );
}
