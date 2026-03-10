import type { IcpId, SectorId } from '../config/types';
import { useIntelligence, type Tier } from '../hooks/useIntelligence';

interface CtaVariant {
  label: string;
  href: string;
  style: 'primary' | 'calendly' | 'urgent';
  subtitle?: string;
}

const CALENDLY = 'https://calendly.com/mbhes1970/30min';

function getCtaVariant(icp: IcpId, tier: Tier, sector?: SectorId): CtaVariant {
  if (icp === 'icp1') {
    switch (tier) {
      case 'cold': return { label: 'Download EU Market Entry Guide', href: '/eu-entry#guide', style: 'primary' };
      case 'warm': return { label: 'Start Market Readiness Assessment', href: `/quickscan?sector=s06&role=cto`, style: 'primary' };
      case 'hot': return { label: 'Boek Market Entry Review', href: CALENDLY, style: 'calendly' };
      case 'tier1': return { label: 'Direct gesprek plannen', href: CALENDLY, style: 'urgent', subtitle: '+31 6 · Pre-filled intake' };
    }
  }

  if (icp === 'icp2') {
    switch (tier) {
      case 'cold': return { label: 'Bekijk ons Partner Programma', href: '/growth#programma', style: 'primary' };
      case 'warm': return { label: 'Download Partner Playbook', href: '/growth#playbook', style: 'primary' };
      case 'hot': return { label: 'Vraag Partner Briefing aan', href: CALENDLY, style: 'calendly' };
      case 'tier1': return { label: 'Direct gesprek + deal registration', href: CALENDLY, style: 'urgent' };
    }
  }

  // ICP3
  const sectorParam = sector || 's01';
  switch (tier) {
    case 'cold': return { label: 'Lees meer over NIS2/CRA', href: `/compliance/${sectorParam}`, style: 'primary' };
    case 'warm': return { label: 'Start je CMO\u2192FMO journey', href: `/quickscan?sector=${sectorParam}`, style: 'primary' };
    case 'hot': return { label: 'Plan uw Assessment', href: CALENDLY, style: 'calendly' };
    case 'tier1': return { label: 'Bel direct \u2014 pre-filled intake', href: CALENDLY, style: 'urgent' };
  }
}

interface Props {
  icpId: IcpId;
  sector?: SectorId;
}

export function DynamicCTA({ icpId, sector }: Props) {
  const { tier, markCtaClicked } = useIntelligence();
  const variant = getCtaVariant(icpId, tier, sector);

  const isExternal = variant.href.startsWith('http');
  const styleMap = {
    primary: 'bg-brand-primary text-black hover:bg-brand-primary-light',
    calendly: 'bg-brand-primary text-black hover:bg-brand-primary-light ring-2 ring-brand-primary/30',
    urgent: 'bg-gradient-to-r from-red-600 to-orange-500 text-white hover:from-red-500 hover:to-orange-400 ring-2 ring-red-500/30',
  };

  const handleClick = () => {
    markCtaClicked();
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <a
        href={isExternal ? variant.href : `#${variant.href}`}
        onClick={(e) => {
          handleClick();
          if (!isExternal) {
            e.preventDefault();
            window.location.href = variant.href;
          }
        }}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg
                    transition-all duration-200 ${styleMap[variant.style]}`}
      >
        {variant.label}
        <span className="text-xl">\u2192</span>
      </a>
      {variant.subtitle && (
        <span className="text-sm text-brand-text-dim">{variant.subtitle}</span>
      )}
    </div>
  );
}
