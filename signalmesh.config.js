/**
 * SignalMesh v2 — Configuratie
 * ─────────────────────────────────────────────────────────────
 * Dit is het ENIGE bestand dat de beheerder aanpast.
 * Raak NOOIT signalmesh-engine.js aan.
 *
 * Sectoren toevoegen: kopieer een s0X-blok, pas id/color/content aan.
 * ICP toevoegen: kopieer een icpX-blok.
 * ─────────────────────────────────────────────────────────────
 */
window.SignalMeshConfig = {

  // ── GLOBAL ──────────────────────────────────────────
  global: {
    debug: false,
    widgetDelayMs: 8000,
    vidDelayMs: 2000,
    sessionKey: 'hci_qs_session',
    pbUrl: 'https://api.hes-consultancy-international.com',
    slackWebhook: '',
    phone: '+31612345678',
    phoneDisplay: '+31 6 12 34 56 78',
    email: 'mbhes@hes-consultancy-international.com',
    calendlyUrl: 'https://calendly.com/mbhes1970/30min',
  },

  // ── ICP's ─────────────────────────────────────────
  icps: {
    icp1: {
      id: 'icp1',
      color: '#3730a3',
      heroMode: 'inject',
      label: { nl: 'Tech / ISV / Startup', en: 'Tech / ISV / Startup' },
      kicker: { nl: 'EU Market Entry & Go-to-Market', en: 'EU Market Entry & Go-to-Market' },
      hero: {
        h1: {
          nl: 'Uw software product klaar voor <em>de Europese markt.</em>',
          en: 'Your software product ready for <em>the European market.</em>',
        },
        sub: {
          nl: 'HCI begeleidt tech-bedrijven van product-market fit naar eerste Europese klanten. Strategie, GTM en uitvoering in één aanpak.',
          en: 'HCI guides tech companies from product-market fit to first European customers. Strategy, GTM and execution in one approach.',
        },
      },
      chips: [
        { nl: 'EU Market Entry strategie', en: 'EU Market Entry strategy' },
        { nl: 'Partner & reseller netwerk', en: 'Partner & reseller network' },
        { nl: 'NIS2 / GDPR compliance ready', en: 'NIS2 / GDPR compliance ready' },
        { nl: 'Van strategie naar eerste klant', en: 'From strategy to first customer' },
      ],
      cta: {
        tiers: {
          cold:  { label: { nl: 'Ontdek onze aanpak', en: 'Discover our approach' }, action: 'link', target: '/services' },
          warm:  { label: { nl: 'Plan een kennismaking', en: 'Schedule intro call' }, action: 'calendly', target: '{{calendlyUrl}}' },
          hot:   { label: { nl: 'Plan direct een gesprek', en: 'Schedule a call now' }, action: 'calendly', target: '{{calendlyUrl}}' },
          tier1: { label: { nl: 'Bel direct: {{phoneDisplay}}', en: 'Call: {{phoneDisplay}}' }, action: 'phone', target: '{{phone}}' },
        },
        secondary: { nl: 'Of doe de gratis Quickscan →', en: 'Or take the free Quickscan →', target: '#sm-quickscan' },
      },
    },

    icp2: {
      id: 'icp2',
      color: '#78350f',
      heroMode: 'inject',
      label: { nl: 'Partner / Reseller', en: 'Partner / Reseller' },
      kicker: { nl: 'Partner Enablement Program', en: 'Partner Enablement Program' },
      hero: {
        h1: {
          nl: 'Word HCI partner en verdien aan <em>compliance & AI projecten.</em>',
          en: 'Become an HCI partner and earn on <em>compliance & AI projects.</em>',
        },
        sub: {
          nl: 'HCI biedt structureel partnerschap: white-label diensten, deal registratie en gezamenlijke enterprise verkoop.',
          en: 'HCI offers structural partnership: white-label services, deal registration and joint enterprise sales.',
        },
      },
      chips: [
        { nl: 'White-label diensten', en: 'White-label services' },
        { nl: 'Deal registratie & bescherming', en: 'Deal registration & protection' },
        { nl: 'Gezamenlijke enterprise sales', en: 'Joint enterprise sales' },
        { nl: 'Partner playbook & enablement', en: 'Partner playbook & enablement' },
      ],
      cta: {
        tiers: {
          cold:  { label: { nl: 'Bekijk partner programma', en: 'View partner program' }, action: 'link', target: '/partners' },
          warm:  { label: { nl: 'Plan een partner gesprek', en: 'Schedule partner call' }, action: 'calendly', target: '{{calendlyUrl}}' },
          hot:   { label: { nl: 'Word partner — plan gesprek', en: 'Become partner — schedule call' }, action: 'calendly', target: '{{calendlyUrl}}' },
          tier1: { label: { nl: 'Bel: {{phoneDisplay}}', en: 'Call: {{phoneDisplay}}' }, action: 'phone', target: '{{phone}}' },
        },
        secondary: { nl: 'Download partner brochure →', en: 'Download partner brochure →', target: '/partner-brochure' },
      },
    },

    icp3: {
      id: 'icp3',
      color: '#1e3a5f',
      heroMode: 'inject',
      label: { nl: 'Compliance Eindklant', en: 'Compliance End Customer' },
      kicker: { nl: 'NIS2 · BIO · AVG · AI Act', en: 'NIS2 · BIO · GDPR · AI Act' },
      hero: {
        h1: {
          nl: 'Uw organisatie compliant onder <em>NIS2, BIO en de AI Act.</em>',
          en: 'Your organisation compliant under <em>NIS2, BIO and the AI Act.</em>',
        },
        sub: {
          nl: 'HCI helpt organisaties navigeren door complexe Europese regelgeving. Van nulmeting tot implementatie.',
          en: 'HCI helps organisations navigate complex European regulations. From baseline assessment to implementation.',
        },
      },
      chips: [
        { nl: 'NIS2 gap analyse & implementatie', en: 'NIS2 gap analysis & implementation' },
        { nl: 'BIO / ISO 27001 begeleiding', en: 'BIO / ISO 27001 guidance' },
        { nl: 'AI Act readiness scan', en: 'AI Act readiness scan' },
        { nl: 'DPIA & AVG compliance', en: 'DPIA & GDPR compliance' },
      ],
      cta: {
        tiers: {
          cold:  { label: { nl: 'Doe de gratis Quickscan', en: 'Take the free Quickscan' }, action: 'quickscan', target: '#sm-quickscan' },
          warm:  { label: { nl: 'Plan een compliance check', en: 'Schedule compliance check' }, action: 'calendly', target: '{{calendlyUrl}}' },
          hot:   { label: { nl: 'Plan direct een gesprek', en: 'Schedule call now' }, action: 'calendly', target: '{{calendlyUrl}}' },
          tier1: { label: { nl: 'Bel direct: {{phoneDisplay}}', en: 'Call: {{phoneDisplay}}' }, action: 'phone', target: '{{phone}}' },
        },
        secondary: { nl: 'Of kies uw sector →', en: 'Or choose your sector →', target: '#sm-sector-picker' },
      },
    },
  },

  // ── SECTORS (ICP3) ─────────────────────────────────
  sectors: {
    s01: {
      id: 's01', icpLink: 'icp3',
      color: '#1e3a5f', accentLight: '#60a5fa',
      label: { nl: 'Overheid', en: 'Government' },
      sublabel: { nl: 'Gemeenten · Provincies · Rijksoverheid', en: 'Municipalities · Provinces · National gov' },
      icon: '🏛️',
      regulations: [
        { id: 'bio', label: 'BIO', color: '#1e3a5f', textColor: '#60a5fa' },
        { id: 'nis2', label: 'NIS2', color: '#1e3a5f', textColor: '#60a5fa' },
        { id: 'avg', label: 'AVG', color: '#1e3a5f', textColor: '#60a5fa' },
        { id: 'aiact', label: 'AI Act', color: '#1e3a5f', textColor: '#60a5fa' },
      ],
      painChips: [
        { nl: 'BIO-verplichtingen nog niet geïmplementeerd', en: 'BIO obligations not yet implemented' },
        { nl: 'NIS2 meldplicht onduidelijk', en: 'NIS2 reporting obligation unclear' },
        { nl: 'AI Act risico-classificatie onbekend', en: 'AI Act risk classification unknown' },
        { nl: 'Geen DPIA-proces ingericht', en: 'No DPIA process in place' },
      ],
      hero: {
        h1: { nl: 'Uw gemeente of overheidsorganisatie <em>BIO- en NIS2-compliant.</em>', en: 'Your government organisation <em>BIO and NIS2 compliant.</em>' },
        sub: { nl: 'Gemeenten en overheidsinstanties staan onder toenemende druk van BIO, NIS2 en de AI Act. HCI biedt concrete implementatiebegeleiding.', en: 'Government organisations face increasing pressure from BIO, NIS2 and the AI Act. HCI provides concrete implementation guidance.' },
      },
    },
    s02: {
      id: 's02', icpLink: 'icp3',
      color: '#065f46', accentLight: '#4ade80',
      label: { nl: 'Zorg', en: 'Healthcare' },
      sublabel: { nl: 'Ziekenhuizen · GGZ · VVT · Huisartsen', en: 'Hospitals · Mental Health · Elderly Care' },
      icon: '🏥',
      regulations: [
        { id: 'nis2', label: 'NIS2', color: '#065f46', textColor: '#4ade80' },
        { id: 'avg', label: 'AVG', color: '#065f46', textColor: '#4ade80' },
        { id: 'mdr', label: 'MDR', color: '#065f46', textColor: '#4ade80' },
        { id: 'aiact', label: 'AI Act', color: '#065f46', textColor: '#4ade80' },
      ],
      painChips: [
        { nl: 'Patiëntdata kwetsbaar bij ransomware', en: 'Patient data vulnerable to ransomware' },
        { nl: 'NIS2 geldt voor zorginstellingen', en: 'NIS2 applies to healthcare institutions' },
        { nl: 'Medische AI-tools niet gecertificeerd', en: 'Medical AI tools not certified' },
        { nl: 'Datalekken niet binnen 72 uur gemeld', en: 'Data breaches not reported within 72h' },
      ],
      hero: {
        h1: { nl: 'Zorginstellingen onder <em>NIS2, AVG en de AI Act.</em> Klaar voor een audit?', en: 'Healthcare institutions under <em>NIS2, GDPR and the AI Act.</em> Audit-ready?' },
        sub: { nl: 'Zorginstellingen zijn een groeiend doelwit. NIS2 verplicht meldingen binnen 24 uur. HCI begeleidt van nulmeting naar implementatie.', en: 'Healthcare institutions are a growing target. NIS2 mandates reporting within 24h. HCI guides from baseline to implementation.' },
      },
    },
    s03: {
      id: 's03', icpLink: 'icp3',
      color: '#3730a3', accentLight: '#a78bfa',
      label: { nl: 'Software & IT', en: 'Software & IT' },
      sublabel: { nl: 'SaaS · Managed Services · Hosting', en: 'SaaS · Managed Services · Hosting' },
      icon: '💻',
      regulations: [
        { id: 'nis2', label: 'NIS2', color: '#3730a3', textColor: '#a78bfa' },
        { id: 'avg', label: 'AVG', color: '#3730a3', textColor: '#a78bfa' },
        { id: 'aiact', label: 'AI Act', color: '#3730a3', textColor: '#a78bfa' },
        { id: 'iso27001', label: 'ISO 27001', color: '#3730a3', textColor: '#a78bfa' },
      ],
      painChips: [
        { nl: 'Klanten eisen NIS2-compliance van leveranciers', en: 'Customers demand NIS2 compliance from suppliers' },
        { nl: 'AI-features vallen onder AI Act hoog-risico', en: 'AI features fall under AI Act high risk' },
        { nl: 'ISO 27001 certificering ontbreekt', en: 'ISO 27001 certification missing' },
        { nl: 'DPIA bij verwerking klantdata verplicht', en: 'DPIA required for customer data processing' },
      ],
      hero: {
        h1: { nl: 'Uw software bedrijf <em>NIS2, AI Act en ISO 27001</em> compliant.', en: 'Your software company <em>NIS2, AI Act and ISO 27001</em> compliant.' },
        sub: { nl: 'Enterprise klanten eisen toenemend compliance van hun SaaS-leveranciers. HCI helpt u voor te blijven.', en: 'Enterprise customers increasingly demand compliance from their SaaS vendors. HCI helps you stay ahead.' },
      },
    },
    s04: {
      id: 's04', icpLink: 'icp3',
      color: '#78350f', accentLight: '#fbbf24',
      label: { nl: 'Finance', en: 'Finance' },
      sublabel: { nl: 'Banken · Verzekeraars · FinTech · Pensioenen', en: 'Banks · Insurers · FinTech · Pensions' },
      icon: '🏦',
      regulations: [
        { id: 'dora', label: 'DORA', color: '#78350f', textColor: '#fbbf24' },
        { id: 'nis2', label: 'NIS2', color: '#78350f', textColor: '#fbbf24' },
        { id: 'avg', label: 'AVG', color: '#78350f', textColor: '#fbbf24' },
        { id: 'aiact', label: 'AI Act', color: '#78350f', textColor: '#fbbf24' },
      ],
      painChips: [
        { nl: 'DORA operationele weerbaarheid verplicht per 2025', en: 'DORA operational resilience mandatory from 2025' },
        { nl: 'ICT-risico en third-party risico onduidelijk', en: 'ICT risk and third-party risk unclear' },
        { nl: 'AI credit scoring valt onder hoog-risico AI Act', en: 'AI credit scoring falls under high-risk AI Act' },
        { nl: 'Incident response niet getest', en: 'Incident response not tested' },
      ],
      hero: {
        h1: { nl: 'Financiële instellingen compliant onder <em>DORA, NIS2 en AI Act.</em>', en: 'Financial institutions compliant under <em>DORA, NIS2 and AI Act.</em>' },
        sub: { nl: 'DORA is per januari 2025 van kracht. Financiële instellingen moeten aantoonbaar digitaal weerbaar zijn. HCI begeleidt de volledige implementatie.', en: 'DORA came into force January 2025. Financial institutions must demonstrably be digitally resilient. HCI guides full implementation.' },
      },
    },
    s05: {
      id: 's05', icpLink: 'icp3',
      color: '#134e4a', accentLight: '#2dd4bf',
      label: { nl: 'Telecom & Media', en: 'Telecom & Media' },
      sublabel: { nl: 'Telecom · Broadcasting · OTT · Media', en: 'Telecom · Broadcasting · OTT · Media' },
      icon: '📡',
      regulations: [
        { id: 'nis2', label: 'NIS2', color: '#134e4a', textColor: '#2dd4bf' },
        { id: 'avg', label: 'AVG', color: '#134e4a', textColor: '#2dd4bf' },
        { id: 'aiact', label: 'AI Act', color: '#134e4a', textColor: '#2dd4bf' },
      ],
      painChips: [
        { nl: 'Kritieke infrastructuur valt onder NIS2 essentieel', en: 'Critical infrastructure falls under NIS2 essential' },
        { nl: 'Contentalgoritmes onder AI Act scrutiny', en: 'Content algorithms under AI Act scrutiny' },
        { nl: 'Abonneedata vereist strikte AVG-naleving', en: 'Subscriber data requires strict GDPR compliance' },
        { nl: 'Supplychain cyberrisico telecom-leveranciers', en: 'Supply chain cyber risk telecom vendors' },
      ],
      hero: {
        h1: { nl: 'Telecom en media <em>NIS2-compliant</em> en klaar voor de AI Act.', en: 'Telecom and media <em>NIS2 compliant</em> and ready for the AI Act.' },
        sub: { nl: 'Telecomaanbieders zijn essentiële entiteiten onder NIS2 met de zwaarste verplichtingen. HCI biedt gerichte implementatiebegeleiding.', en: 'Telecom providers are essential entities under NIS2 with the heaviest obligations. HCI provides targeted implementation guidance.' },
      },
    },
    s06: {
      id: 's06', icpLink: 'icp3',
      color: '#7f1d1d', accentLight: '#f87171',
      label: { nl: 'Energie & Utilities', en: 'Energy & Utilities' },
      sublabel: { nl: 'Energie · Water · Afval · Infrastructuur', en: 'Energy · Water · Waste · Infrastructure' },
      icon: '⚡',
      regulations: [
        { id: 'nis2', label: 'NIS2', color: '#7f1d1d', textColor: '#f87171' },
        { id: 'avg', label: 'AVG', color: '#7f1d1d', textColor: '#f87171' },
        { id: 'aiact', label: 'AI Act', color: '#7f1d1d', textColor: '#f87171' },
      ],
      painChips: [
        { nl: 'Kritieke infrastructuur — hoogste NIS2 klasse', en: 'Critical infrastructure — highest NIS2 class' },
        { nl: 'OT/IT convergentie creëert nieuwe aanvalsoppervlakken', en: 'OT/IT convergence creates new attack surfaces' },
        { nl: 'Leveranciersrisico in energieketen', en: 'Supplier risk in energy chain' },
        { nl: 'Real-time monitoring vereist door toezichthouder', en: 'Real-time monitoring required by regulator' },
      ],
      hero: {
        h1: { nl: 'Energie en utilities — <em>essentieel onder NIS2</em> en DORA-ready.', en: 'Energy and utilities — <em>essential under NIS2</em> and DORA-ready.' },
        sub: { nl: 'Energiebedrijven en utilities vallen onder de zwaarste NIS2-categorie. Cyberaanvallen op kritieke infrastructuur nemen toe. HCI implementeert de vereiste maatregelen.', en: 'Energy companies and utilities fall under the heaviest NIS2 category. Cyberattacks on critical infrastructure are increasing. HCI implements the required measures.' },
      },
    },
    // ── NIEUWE SECTOR TOEVOEGEN ──────────────────────
    // Kopieer een s0X-blok hierboven en pas aan:
    // 1. id: 's07'
    // 2. color + accentLight
    // 3. label, sublabel, icon
    // 4. regulations array
    // 5. painChips array (4 items, nl + en)
    // 6. hero.h1 + hero.sub (nl + en)
  },

  // ── SCORING ────────────────────────────────────────
  scoring: {
    icp:        { icp1: 20, icp2: 20, icp3: 20 },
    sector:     { any: 15 },
    utm_source: { email: 20, linkedin: 15, partner: 25, direct: 5, organic: 5 },
    vid:        { present: 20 },
    device:     { mobile: 5, desktop: 0 },
    visit:      { returning: 10 },
    tiers: {
      cold:  { min: 0,  max: 19 },
      warm:  { min: 20, max: 44 },
      hot:   { min: 45, max: 69 },
      tier1: { min: 70, max: 999 },
    },
  },

  // ── WIZARD ────────────────────────────────────────
  wizard: {
    cards: {
      icp1: {
        icon: '🚀',
        title: { nl: 'Tech bedrijf of software startup', en: 'Tech company or software startup' },
        desc: { nl: 'Ik wil mijn product lanceren op de Europese markt.', en: 'I want to launch my product on the European market.' },
      },
      icp2: {
        icon: '🤝',
        title: { nl: 'Partner of reseller', en: 'Partner or reseller' },
        desc: { nl: 'Ik wil samenwerken met HCI als partner of reseller.', en: 'I want to partner with HCI as a partner or reseller.' },
      },
      icp3: {
        icon: '🏛️',
        title: { nl: 'Organisatie met compliance vraagstuk', en: 'Organisation with compliance challenge' },
        desc: { nl: 'Ik zoek hulp bij NIS2, BIO, AVG of de AI Act.', en: 'I need help with NIS2, BIO, GDPR or the AI Act.' },
      },
    },
  },

  // ── QUICKSCAN VRAGEN ──────────────────────────────
  quickscan: {
    questions: [
      {
        id: 'q1',
        text: { nl: 'Hoeveel medewerkers heeft uw organisatie?', en: 'How many employees does your organisation have?' },
        options: [
          { value: 'a', label: { nl: '< 50', en: '< 50' }, score: 5 },
          { value: 'b', label: { nl: '50 – 250', en: '50 – 250' }, score: 15 },
          { value: 'c', label: { nl: '250 – 1000', en: '250 – 1000' }, score: 25 },
          { value: 'd', label: { nl: '> 1000', en: '> 1000' }, score: 35 },
        ],
      },
      {
        id: 'q2',
        text: { nl: 'Welke regelgeving is het meest urgent voor uw organisatie?', en: 'Which regulation is most urgent for your organisation?' },
        options: [
          { value: 'a', label: { nl: 'NIS2', en: 'NIS2' }, score: 20 },
          { value: 'b', label: { nl: 'BIO / ISO 27001', en: 'BIO / ISO 27001' }, score: 20 },
          { value: 'c', label: { nl: 'AI Act', en: 'AI Act' }, score: 15 },
          { value: 'd', label: { nl: 'DORA', en: 'DORA' }, score: 25 },
        ],
      },
      {
        id: 'q3',
        text: { nl: 'Heeft u een actuele risicoanalyse (nulmeting)?', en: 'Do you have a current risk analysis (baseline)?' },
        options: [
          { value: 'a', label: { nl: 'Nee, nog niet gestart', en: 'No, not started yet' }, score: 0 },
          { value: 'b', label: { nl: 'Gedeeltelijk', en: 'Partially done' }, score: 10 },
          { value: 'c', label: { nl: 'Ja, maar verouderd', en: 'Yes, but outdated' }, score: 15 },
          { value: 'd', label: { nl: 'Ja, recent en actueel', en: 'Yes, recent and up to date' }, score: 25 },
        ],
      },
      {
        id: 'q4',
        text: { nl: 'Wanneer verwacht u een audit of toezichtscontrole?', en: 'When do you expect an audit or regulatory inspection?' },
        options: [
          { value: 'a', label: { nl: 'Niet bekend / n.v.t.', en: 'Unknown / N/A' }, score: 5 },
          { value: 'b', label: { nl: 'Over 12+ maanden', en: 'In 12+ months' }, score: 10 },
          { value: 'c', label: { nl: 'Binnen 6–12 maanden', en: 'Within 6–12 months' }, score: 20 },
          { value: 'd', label: { nl: 'Binnen 3–6 maanden', en: 'Within 3–6 months' }, score: 35 },
        ],
      },
      {
        id: 'q5',
        text: { nl: 'Wat is uw grootste obstakel op dit moment?', en: 'What is your biggest obstacle right now?' },
        options: [
          { value: 'a', label: { nl: 'Onvoldoende kennis intern', en: 'Insufficient internal knowledge' }, score: 10 },
          { value: 'b', label: { nl: 'Capaciteitsgebrek', en: 'Lack of capacity' }, score: 15 },
          { value: 'c', label: { nl: 'Budget onzeker', en: 'Budget uncertain' }, score: 5 },
          { value: 'd', label: { nl: 'Weet niet waar te beginnen', en: 'Don\'t know where to start' }, score: 20 },
        ],
      },
    ],
  },
};
