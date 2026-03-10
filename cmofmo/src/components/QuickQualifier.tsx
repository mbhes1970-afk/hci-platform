import { useState } from 'react';
import type { IcpId, SectorId } from '../config/types';
import { useIntelligence } from '../hooks/useIntelligence';
import { SECTOR_MAP } from '../config/icp-content';
import { DynamicCTA } from './DynamicCTA';

interface QualifierConfig {
  question1: { label: string; options: string[] };
  question2: { label: string; options: string[] };
  getOutput: (a1: string, a2: string) => { lines: string[]; sector?: SectorId };
}

const ICP3_QUALIFIER: QualifierConfig = {
  question1: {
    label: 'In welke sector werkt uw organisatie?',
    options: ['Overheid', 'Zorg', 'Financieel', 'Energie', 'Onderwijs', 'Software/SaaS', 'Logistiek', 'Legal'],
  },
  question2: {
    label: 'Wat is uw grootste compliance-uitdaging?',
    options: ['Weten niet waar we staan', 'Budget vrijmaken', 'Technisch complex', 'Urgentie bewijzen', 'Al mee bezig'],
  },
  getOutput: (a1, a2) => {
    const sectorIndex = ['Overheid', 'Zorg', 'Financieel', 'Energie', 'Onderwijs', 'Software/SaaS', 'Logistiek', 'Legal'].indexOf(a1);
    const sectorId = (`s0${sectorIndex + 1}`) as SectorId;
    const sectorData = SECTOR_MAP[sectorId as keyof typeof SECTOR_MAP];

    const challengeMap: Record<string, string> = {
      'Weten niet waar we staan': 'Een CMO\u2192FMO assessment brengt uw huidige positie in kaart.',
      'Budget vrijmaken': 'Ons rapport bevat een concrete investerings-indicatie die u kunt presenteren aan uw bestuur.',
      'Technisch complex': 'Wij vertalen complexe frameworks naar heldere actie-items per afdeling.',
      'Urgentie bewijzen': 'Met boetes tot \u20ac17.5M en persoonlijke bestuursaansprakelijkheid is urgentie aantoonbaar.',
      'Al mee bezig': 'Goed! Een second opinion rapport valideert uw aanpak en identificeert resterende gaps.',
    };

    return {
      sector: sectorId,
      lines: [
        `Relevante frameworks: ${sectorData?.frameworks.join(', ') || 'NIS2, AVG'}`,
        `${a1}-organisaties hebben gemiddeld 4-6 compliance gaps.`,
        challengeMap[a2] || 'Start uw CMO\u2192FMO journey voor een persoonlijk rapport.',
      ],
    };
  },
};

const ICP1_QUALIFIER: QualifierConfig = {
  question1: {
    label: 'Wat voor product biedt u aan?',
    options: ['SaaS platform', 'Embedded software', 'AI-oplossing', 'Security product', 'Hardware + software', 'Anders'],
  },
  question2: {
    label: 'Waar staat u met EU-compliance?',
    options: ['Niet mee bezig', 'Ori\u00ebnterend', 'Actief bezig', 'Grotendeels compliant'],
  },
  getOutput: (a1, a2) => {
    const regs: Record<string, string[]> = {
      'SaaS platform': ['CRA', 'NIS2', 'AVG'],
      'Embedded software': ['CRA', 'CE-markering', 'NIS2'],
      'AI-oplossing': ['AI Act', 'CRA', 'AVG'],
      'Security product': ['CRA', 'NIS2', 'ENISA'],
      'Hardware + software': ['CRA', 'CE-markering', 'NIS2'],
      'Anders': ['CRA', 'AVG', 'NIS2'],
    };
    const timeline: Record<string, string> = {
      'Niet mee bezig': '9-12 maanden',
      'Ori\u00ebnterend': '6-9 maanden',
      'Actief bezig': '3-6 maanden',
      'Grotendeels compliant': '1-3 maanden',
    };
    return {
      lines: [
        `Top 3 EU-regelgevingen: ${(regs[a1] || regs['Anders']).join(', ')}`,
        `Geschatte tijdlijn tot eerste EU-klant: ${timeline[a2] || '6-9 maanden'}`,
        'HCI begeleidt het volledige traject \u2014 van compliance-mapping tot eerste introductie.',
      ],
    };
  },
};

const ICP2_QUALIFIER: QualifierConfig = {
  question1: {
    label: 'Welk type oplossing zoeken uw klanten het meest?',
    options: ['Post-quantum', 'Data encryption', 'Compliance tooling', 'Security services', 'AI-governance', 'Cloud sovereignty'],
  },
  question2: {
    label: 'Wat is uw primaire klantprofiel?',
    options: ['Overheid', 'Zorg', 'Finance', 'Enterprise', 'Software-bedrijven', 'Mix'],
  },
  getOutput: (a1, _a2) => {
    const vendorMap: Record<string, string[]> = {
      'Post-quantum': ['QCrypt Solutions', 'PQ Shield'],
      'Data encryption': ['CipherTrust', 'Virtru'],
      'Compliance tooling': ['OneTrust', 'Vanta'],
      'Security services': ['BlueVoyant', 'Arctic Wolf'],
      'AI-governance': ['Credo AI', 'Holistic AI'],
      'Cloud sovereignty': ['Scaleway', 'OVHcloud'],
    };
    return {
      lines: [
        `Gematchte vendors: ${(vendorMap[a1] || ['Neem contact op']).join(', ')}`,
        'Commissie-indicatie: 15-25% op eerste jaarcontract',
        'Compleet partner playbook beschikbaar na registratie.',
      ],
    };
  },
};

const QUALIFIERS: Record<string, QualifierConfig> = {
  icp1: ICP1_QUALIFIER,
  icp2: ICP2_QUALIFIER,
  icp3: ICP3_QUALIFIER,
};

interface Props {
  icpId: IcpId;
  preselectedSector?: SectorId;
}

export function QuickQualifier({ icpId, preselectedSector }: Props) {
  const [step, setStep] = useState(0); // 0 = q1, 1 = q2, 2 = output
  const [answer1, setAnswer1] = useState<string | null>(null);
  const [answer2, setAnswer2] = useState<string | null>(null);
  const { addSignal, setQualifierAnswer, markQualifierCompleted, setSector } = useIntelligence();

  const config = QUALIFIERS[icpId] || ICP3_QUALIFIER;

  const handleQ1 = (option: string) => {
    setAnswer1(option);
    setQualifierAnswer('q1', option);
    addSignal({ type: 'qualifier_q1', fitDelta: 10, intentDelta: 10 });
    setStep(1);
  };

  const handleQ2 = (option: string) => {
    setAnswer2(option);
    setQualifierAnswer('q2', option);
    addSignal({ type: 'qualifier_q2', fitDelta: 10, intentDelta: 10 });

    // Calculate output and possibly set sector
    const output = config.getOutput(answer1!, option);
    if (output.sector) {
      setSector(output.sector);
    } else if (preselectedSector) {
      setSector(preselectedSector);
    }

    markQualifierCompleted();
    setStep(2);
  };

  if (step === 2 && answer1 && answer2) {
    const output = config.getOutput(answer1, answer2);
    return (
      <div className="animate-fade-in">
        <div className="bg-brand-bg-card border border-brand-border rounded-2xl p-8 mb-8">
          <h3 className="font-serif text-2xl text-brand-text-bright mb-6">
            Uw situatie in het kort
          </h3>
          <ul className="space-y-3">
            {output.lines.map((line, i) => (
              <li key={i} className="flex items-start gap-3 text-brand-text">
                <span className="text-brand-primary mt-1">\u2192</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <DynamicCTA
          icpId={icpId}
          sector={output.sector || preselectedSector}
        />
      </div>
    );
  }

  const currentQ = step === 0 ? config.question1 : config.question2;
  const handleSelect = step === 0 ? handleQ1 : handleQ2;

  return (
    <div className="animate-fade-in">
      <span className="inline-block font-mono text-xs tracking-widest uppercase text-brand-primary mb-4 px-3 py-1 rounded-full bg-brand-primary-dim">
        Vraag {step + 1} van 2
      </span>
      <h3 className="font-serif text-2xl md:text-3xl text-brand-text-bright mb-8">
        {currentQ.label}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQ.options.map(option => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className="text-left px-5 py-4 rounded-xl border border-brand-border bg-brand-bg-card
                       hover:border-brand-primary hover:bg-brand-primary-dim
                       transition-all duration-200 text-brand-text hover:text-brand-text-bright"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
