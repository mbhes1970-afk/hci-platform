import type { SectorId } from './types';

export interface StorySection {
  kicker: string;
  headline: string;
  body: string;
}

export interface IcpJourneyContent {
  id: string;
  sections: StorySection[];
}

export const ICP1_CONTENT: IcpJourneyContent = {
  id: 'icp1',
  sections: [
    {
      kicker: 'De EU-markt',
      headline: 'Europa is de grootste digitale markt ter wereld. Maar de regels zijn veranderd.',
      body: '450 miljoen consumenten, de hoogste ARPU ter wereld, en een exploderende vraag naar cloud, security en AI-oplossingen. Maar sinds 2024 heeft de EU een muur van regelgeving gebouwd: CRA, NIS2, AI Act, GDPR. De markt is er. De drempel ook.',
    },
    {
      kicker: 'Waarom het misgaat',
      headline: 'De meeste tech-bedrijven falen in Europa niet op product, maar op strategie.',
      body: 'Geen lokale entiteit, geen kanaalpartners, geen compliance-bewijs. 70% van de tech-bedrijven die EU-expansie probeert, haalt het eerste jaar geen significante omzet. Niet omdat het product niet past \u2014 maar omdat de go-to-market niet klopt.',
    },
    {
      kicker: 'Wat er veranderd is',
      headline: 'CRA en AI Act veranderen de spelregels voor elke softwareleverancier.',
      body: 'CE-markering wordt verplicht voor software met digitale elementen. SBOM\u2019s moeten continu gegenereerd. AI-systemen moeten geclassificeerd. Compliant zijn is niet meer een nice-to-have \u2014 het is je markttoegangsbewijs.',
    },
    {
      kicker: 'Hoe HCI het oplost',
      headline: 'Van strategie tot eerste klant. Zonder lokaal kantoor.',
      body: 'HCI biedt een complete EU market entry service: compliance-mapping, kanaalstrategie, partner-enablement, en directe introductie bij enterprise-kopers. 30+ jaar ervaring. C-level netwerk in Benelux en DACH.',
    },
    {
      kicker: 'Uw situatie in 2 minuten',
      headline: 'Hoe ver is uw organisatie klaar voor de EU-markt?',
      body: 'In 2 vragen brengen we uw EU Market Readiness in kaart. U ontvangt een concrete routekaart met eerste stappen, tijdlijn en investerings-indicatie.',
    },
  ],
};

export const ICP2_CONTENT: IcpJourneyContent = {
  id: 'icp2',
  sections: [
    {
      kicker: 'De uitdaging',
      headline: 'Uw klanten worden geconfronteerd met NIS2, CRA en DORA. Ze verwachten dat u een antwoord heeft.',
      body: 'Elke klant in uw portfolio \u2014 van gemeente tot ziekenhuis tot softwarebedrijf \u2014 krijgt te maken met nieuwe EU-regelgeving. Als u dat antwoord niet heeft, heeft uw concurrent dat wel.',
    },
    {
      kicker: 'Het probleem',
      headline: 'Nieuwe vendor-relaties opbouwen kost tijd die u niet heeft.',
      body: 'De juiste vendors vinden, evalueren, contracteren, en uw sales-team trainen \u2014 dat is een investering van maanden. En ondertussen loopt u deals mis.',
    },
    {
      kicker: 'De kans',
      headline: 'Wij vertegenwoordigen tech-bedrijven die specifiek zoeken naar Europese kanaalpartners.',
      body: 'HCI werkt met ISV\u2019s die de EU-markt willen betreden via het indirecte model. Zij hebben het product. U heeft het klantennetwerk. Samen is dat een compleet verhaal.',
    },
    {
      kicker: 'Het model',
      headline: 'Partner enablement van dag \u00e9\u00e9n. Geen maanden opstartijd.',
      body: 'Compleet partner playbook: positionering per sector, battlecards, ROI-calculators, deal registration. U kunt binnen weken uw eerste gesprekken voeren.',
    },
    {
      kicker: 'Start nu',
      headline: 'Welke oplossingen mist u in uw portfolio?',
      body: 'In 2 vragen matchen we u met relevante vendors uit ons netwerk.',
    },
  ],
};

// ICP3 sector-specific content for section 01
const SECTOR_RECOGNITION: Record<string, { headline: string; body: string }> = {
  s01: {
    headline: 'Overheid staat onder druk van nieuwe EU-regelgeving.',
    body: 'Gemeenten hebben tot 2025 om BIO en NIS2 te implementeren. De verantwoordelijkheid ligt bij het bestuur.',
  },
  s02: {
    headline: 'Zorg staat onder druk van nieuwe EU-regelgeving.',
    body: '67% van zorginstellingen is non-compliant op NEN7510:2 encryptie. Pati\u00ebntdata is het meest gevoelige data-type.',
  },
  s03: {
    headline: 'Finance staat onder druk van nieuwe EU-regelgeving.',
    body: 'DORA verplicht financi\u00eble instellingen tot ICT-risicobeheersing per januari 2025. Third-party risk wordt persoonlijke bestuursverantwoordelijkheid.',
  },
  s04: {
    headline: 'Energie staat onder druk van nieuwe EU-regelgeving.',
    body: 'NIS2 + CER verplichten energiebedrijven tot strenge beveiligingseisen. OT-security wordt net zo belangrijk als IT-security.',
  },
  s05: {
    headline: 'Onderwijs staat onder druk van nieuwe EU-regelgeving.',
    body: 'AVG en Wet digitale overheid stellen nieuwe eisen aan onderwijsinstellingen. Studentdata en digitale examens vereisen extra bescherming.',
  },
  s06: {
    headline: 'Software staat onder druk van nieuwe EU-regelgeving.',
    body: 'CRA en AI Act verplichten softwarebedrijven tot CE-markering en SBOM. Elk product met een digitaal element moet aantoonbaar veilig zijn.',
  },
  s07: {
    headline: 'Logistiek staat onder druk van nieuwe EU-regelgeving.',
    body: 'NIS2 en eFTI veranderen de compliance-eisen in logistiek fundamenteel. Digitale ketenbeveiliging wordt verplicht.',
  },
  s08: {
    headline: 'Legal staat onder druk van nieuwe EU-regelgeving.',
    body: 'AI Act reclassificeert juridische AI-tools als high-risk systemen. Advocatenkantoren moeten hun AI-gebruik documenteren en auditen.',
  },
};

export function getIcp3Content(sector?: SectorId | null): IcpJourneyContent {
  const sectorKey = sector || 's01';
  const recognition = SECTOR_RECOGNITION[sectorKey] || SECTOR_RECOGNITION.s01;

  return {
    id: 'icp3',
    sections: [
      {
        kicker: 'De regelgeving',
        headline: recognition.headline,
        body: recognition.body,
      },
      {
        kicker: 'Het probleem',
        headline: 'Weet u precies waar uw organisatie staat?',
        body: 'De meeste organisaties weten niet welke gaps ze hebben. Totdat de AP of een incident het zichtbaar maakt. Dan is het te laat \u2014 en te duur.',
      },
      {
        kicker: 'De kosten van wachten',
        headline: 'Compliance is geen IT-project. Het is een bestuursverantwoordelijkheid.',
        body: 'Bestuurders worden persoonlijk aansprakelijk (NIS2 art. 20). Boetes tot \u20ac17.5M of 4% jaaromzet. Incidenten die vermijdbaar waren.',
      },
      {
        kicker: 'De CMO\u2192FMO aanpak',
        headline: 'Van huidige situatie naar gewenste eindsituatie \u2014 in een helder rapport.',
        body: 'HCI brengt uw Current Mode of Operations in kaart en beschrijft de Future Mode of Operations. Met concrete deliverables en een realistische investerings-indicatie.',
      },
      {
        kicker: 'Start nu',
        headline: 'Waar staat uw organisatie op dit moment?',
        body: 'Start de CMO\u2192FMO journey. 9 vragen. Uw persoonlijk compliance-rapport binnen 2 minuten.',
      },
    ],
  };
}

// Sector mapping with extended metadata
export const SECTOR_MAP = {
  s01: { naam: 'Gemeente / Overheid', icon: '\ud83c\udfdb\ufe0f', color: '#1e3a5f', frameworks: ['BIO', 'NIS2', 'AVG', 'DigiD'] },
  s02: { naam: 'Ziekenhuis / Zorg', icon: '\ud83c\udfe5', color: '#065f46', frameworks: ['NEN7510:2', 'AVG', 'BIG'] },
  s03: { naam: 'Financieel / Bank', icon: '\ud83c\udfe6', color: '#6C5CE7', frameworks: ['DORA', 'PSD2', 'AVG'] },
  s04: { naam: 'Energie / Utiliteit', icon: '\u26a1', color: '#78350f', frameworks: ['NIS2', 'CER', 'AVG'] },
  s05: { naam: 'Onderwijs', icon: '\ud83c\udf93', color: '#7f1d1d', frameworks: ['AVG', 'BIO-light'] },
  s06: { naam: 'Software / SaaS', icon: '\ud83d\udcbb', color: '#134e4a', frameworks: ['CRA', 'AI Act', 'AVG'] },
  s07: { naam: 'Logistiek', icon: '\ud83d\ude9b', color: '#3b1f5e', frameworks: ['NIS2', 'eFTI', 'CSRD'] },
  s08: { naam: 'Legal & LegalTech', icon: '\u2696\ufe0f', color: '#1a3040', frameworks: ['AI Act', 'NIS2', 'DORA'] },
} as const;

export type SectorCode = keyof typeof SECTOR_MAP;
