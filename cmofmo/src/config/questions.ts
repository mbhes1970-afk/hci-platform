import type { SectorId } from './types';

export interface QuestionOption {
  label: string;
  score: number; // 0 = niet aanwezig, 1 = basis, 2 = gevorderd, 3 = best practice
}

export interface Question {
  dim: number;       // dimensie-index (0-4)
  text: string;      // de vraag
  opts: QuestionOption[];
}

export interface SectorQuestions {
  sectorId: SectorId;
  dimensions: string[];
  questions: Question[];
}

// Helper: maak opties van labels (score 0-3 automatisch)
function q(dim: number, text: string, opts: string[]): Question {
  return {
    dim,
    text,
    opts: opts.map((label, i) => ({ label, score: i })),
  };
}

export const SECTOR_QUESTIONS: Record<SectorId, SectorQuestions> = {

  // ─── S01: OVERHEID ────────────────────────────────────
  s01: {
    sectorId: 's01',
    dimensions: ['Governance & Leiderschap', 'Informatiebeveiliging', 'Digitale Dienstverlening', 'Data & Privacy', 'Innovatie & Veranderkracht'],
    questions: [
      q(0, 'Is er een aangestelde CISO of informatiebeveiligingsfunctionaris?', [
        'Nee, niet aanwezig',
        'Ja, maar parttime / gecombineerde functie',
        'Ja, dedicated CISO met mandaat',
        'Ja, CISO met team en boardrapportage',
      ]),
      q(0, 'Staat cybersecurity structureel op de agenda van het bestuur?', [
        'Nooit besproken',
        'Incidenteel bij issues',
        'Kwartaalrapportage',
        'Maandelijks met KPI\'s en budget',
      ]),
      q(1, 'Hoe ver is uw BIO-compliance?', [
        'Net gestart / onbekend',
        'Inventarisatie gedaan, nog veel gaps',
        'Grotendeels compliant, enkele openstaande punten',
        'Volledig compliant, jaarlijkse audit',
      ]),
      q(1, 'Is multifactorauthenticatie (MFA) breed uitgerold?', [
        'Niet aanwezig',
        'Alleen voor IT-beheerders',
        'Voor alle medewerkers op kantoor',
        'Volledig, inclusief thuiswerk en mobiel',
      ]),
      q(2, 'Worden webapplicaties en portalen regelmatig beveiligingsgetest?', [
        'Niet of zelden',
        'Bij grote wijzigingen',
        'Jaarlijks pentest',
        'Continue scanning + pentest bij elke release',
      ]),
      q(3, 'Is er een dataclassificatieschema in gebruik?', [
        'Niet aanwezig',
        'Op papier maar niet toegepast',
        'Toegepast op kritieke systemen',
        'Organisatiebreed met automatische enforcement',
      ]),
      q(3, 'Hoe gaat u om met SBOM (Software Bill of Materials) bij inkoop?', [
        'Onbekend begrip',
        'Bekend maar niet als eis gesteld',
        'Bij sommige aanbestedingen gevraagd',
        'Standaard inkoopeis voor alle software',
      ]),
      q(4, 'Heeft u een incident response plan dat getest is?', [
        'Geen plan aanwezig',
        'Plan bestaat maar nooit geoefend',
        'Jaarlijks tabletop exercise',
        'Kwartaal drills + 24/72h meldplicht getest',
      ]),
      q(4, 'Hoe kijkt u naar cloud soevereiniteit en vendor lock-in?', [
        'Geen beleid',
        'Enige zorgen maar geen actie',
        'Exit-strategie in ontwikkeling',
        'Multi-cloud strategie met exit-clausules',
      ]),
    ],
  },

  // ─── S02: ZORG ────────────────────────────────────────
  s02: {
    sectorId: 's02',
    dimensions: ['NEN 7510 Compliance', 'NIS2 Readiness', 'EPD Security', 'AI Governance', 'Data Soevereiniteit'],
    questions: [
      q(0, 'Hoe ver is uw NEN 7510 implementatie?', [
        'Net gestart / onbekend',
        'Gap-analyse uitgevoerd',
        'Grotendeels geimplementeerd',
        'Gecertificeerd met jaarlijkse audit',
      ]),
      q(1, 'Is uw organisatie geregistreerd als essentiele entiteit onder NIS2?', [
        'Onbekend / niet mee bezig',
        'Bewust maar nog niet geregistreerd',
        'Geregistreerd, compliance in opbouw',
        'Compliant met aantoonbare maatregelen',
      ]),
      q(1, 'Is er een CISO met mandaat en budget voor informatiebeveiliging?', [
        'Nee',
        'Gecombineerde functie',
        'Dedicated CISO',
        'CISO met team en board-rapportage',
      ]),
      q(2, 'Hoe is de beveiliging van uw EPD-systeem geregeld?', [
        'Standaard vendor-configuratie',
        'Basis hardening toegepast',
        'Regelmatige pentests + monitoring',
        'Zero-trust architectuur met continue monitoring',
      ]),
      q(2, 'Is uw Z-CERT aansluiting actief en getest?', [
        'Niet aangesloten',
        'Aangesloten maar nooit getest',
        'Aangesloten met jaarlijkse test',
        'Actief met real-time threat intelligence',
      ]),
      q(3, 'Gebruikt uw organisatie AI in diagnostiek of triage?', [
        'Nee',
        'In pilot / evaluatie',
        'Ja, beperkt in productie',
        'Ja, breed ingezet met governance',
      ]),
      q(3, 'Is er een risicoclassificatie voor medische AI-systemen conform AI Act?', [
        'Niet mee bezig',
        'Bewust maar geen actie',
        'Inventarisatie gestart',
        'Classificatie compleet met documentatie',
      ]),
      q(4, 'Hoe gaat u om met de bewaarplicht (20 jaar) en encryptie van patientdata?', [
        'Geen specifiek beleid',
        'Standaard encryptie in transit',
        'Encryptie at-rest + in-transit',
        'Post-quantum aware encryptiestrategie',
      ]),
      q(4, 'Heeft u een MDR+CRA overlap-analyse voor connected medical devices?', [
        'Onbekend',
        'Bewust maar geen analyse',
        'Analyse gestart',
        'Compleet met remediatie-plan',
      ]),
    ],
  },

  // ─── S03: DEVELOPERS & ENGINEERS ──────────────────────
  s03: {
    sectorId: 's03',
    dimensions: ['CRA Compliance', 'SDLC Security', 'SBOM Maturity', 'AI Governance', 'EU-markttoegang'],
    questions: [
      q(0, 'Bent u bekend met de CRA-verplichtingen voor uw software producten?', [
        'Niet van gehoord',
        'Globaal bekend, geen actie',
        'Inventarisatie gestart',
        'Productclassificatie compleet',
      ]),
      q(0, 'Heeft u CE-markering voor uw producten in voorbereiding?', [
        'Nee / niet relevant geacht',
        'Bewust maar niet gestart',
        'Conformity assessment in opbouw',
        'CE-markering traject actief',
      ]),
      q(1, 'Hoe is security geintegreerd in uw development lifecycle (SDLC)?', [
        'Ad-hoc / niet structureel',
        'Basis code reviews',
        'SAST/DAST in CI/CD pipeline',
        'Volledig DevSecOps + OWASP SAMM 2+',
      ]),
      q(2, 'Genereert u SBOM\'s voor uw producten?', [
        'Nee',
        'Handmatig / ad-hoc',
        'Geautomatiseerd in CI/CD',
        'SPDX/CycloneDX + continu bijgewerkt',
      ]),
      q(2, 'Hoe beheert u open source dependencies?', [
        'Geen overzicht',
        'Handmatige inventarisatie',
        'Dependency scanning tool',
        'Volledig beheer + license compliance + security scoring',
      ]),
      q(3, 'Gebruikt uw product AI-functionaliteit?', [
        'Nee',
        'In ontwikkeling',
        'Ja, beperkt',
        'Ja, kernfunctionaliteit',
      ]),
      q(3, 'Is er een AI-risicoclassificatie conform EU AI Act?', [
        'Niet mee bezig',
        'Bewust maar geen actie',
        'Classificatie in voorbereiding',
        'Compleet met governance framework',
      ]),
      q(4, 'Verkoopt u aan klanten in andere EU-landen?', [
        'Alleen NL',
        'Een paar EU-landen',
        'Breed in EU',
        'EU-breed + internationale expansie',
      ]),
      q(4, 'Heeft u een vulnerability disclosure procedure?', [
        'Nee',
        'Informeel proces',
        'Gedocumenteerd beleid',
        'CVD conform CRA + 24h meldplicht',
      ]),
    ],
  },

  // ─── S04: ENTERPRISE ──────────────────────────────────
  s04: {
    sectorId: 's04',
    dimensions: ['CRA Compliance & CE-markering', 'Supply Chain Security', 'Cloud Security', 'Incident Response', 'EU-markttoegang'],
    questions: [
      q(0, 'Bent u bekend met CRA-verplichtingen voor producten die u verkoopt of importeert?', [
        'Niet van gehoord',
        'Globaal bekend',
        'Impact-analyse gestart',
        'Compliance programma actief',
      ]),
      q(0, 'Heeft u een multi-framework alignment (ISO 27001 + SOC 2 + CRA)?', [
        'Geen frameworks',
        'Een framework (bijv. ISO)',
        'Twee frameworks',
        'Multi-framework met gap mapping',
      ]),
      q(1, 'Hoe beoordeelt u de cybersecurity van uw leveranciers?', [
        'Niet structureel',
        'Vragenlijst bij onboarding',
        'Jaarlijkse assessment top-leveranciers',
        'Continue monitoring + SBOM-eis',
      ]),
      q(1, 'Stelt u SBOM als eis aan uw software-leveranciers?', [
        'Nee',
        'Bij sommige leveranciers',
        'Bij alle nieuwe contracten',
        'Standaardeis + verificatie',
      ]),
      q(2, 'Hoe is uw cloud security governance ingericht?', [
        'Minimaal / per team verschillend',
        'Basis cloud security beleid',
        'CSA CCM of vergelijkbaar framework',
        'Multi-cloud governance met unified baseline',
      ]),
      q(2, 'Hoeveel cloud providers gebruikt u?', [
        'Geen cloud',
        '1 hyperscaler',
        '2-3 providers',
        'Multi-cloud met exit-strategie',
      ]),
      q(3, 'Kunt u binnen 24 uur een significant incident melden?', [
        'Onzeker / geen proces',
        'Proces bestaat maar niet getest',
        'Jaarlijks geoefend',
        '24/72h compliant + automatische detectie',
      ]),
      q(3, 'Is er een Security Operations Center (SOC)?', [
        'Nee',
        'Extern SOC basis',
        'Extern SOC 24/7',
        'Eigen of hybrid SOC met SIEM/SOAR',
      ]),
      q(4, 'Exporteert of importeert uw organisatie producten met digitale elementen naar/vanuit de EU?', [
        'Nee',
        'Beperkt',
        'Significant deel van omzet',
        'Kernactiviteit',
      ]),
    ],
  },

  // ─── S05: FINANCIEEL ──────────────────────────────────
  s05: {
    sectorId: 's05',
    dimensions: ['DORA ICT Risk Management', 'TLPT & Resilience Testing', 'Third-Party ICT Risk', 'Incident Classificatie', 'AI Governance'],
    questions: [
      q(0, 'Heeft u een DORA-compliant ICT Risk Management Framework?', [
        'Niet gestart',
        'Bestaand framework, DORA gap nog niet in kaart',
        'Gap-analyse uitgevoerd, remediatie gestart',
        'Volledig DORA-compliant framework',
      ]),
      q(0, 'Rapporteert u structureel over ICT-risico aan het bestuur?', [
        'Incidenteel',
        'Kwartaalrapportage',
        'Maandelijks met KPI\'s',
        'Real-time dashboard + maandelijkse board update',
      ]),
      q(1, 'Voert u Threat-Led Penetration Testing (TLPT) uit conform TIBER-NL?', [
        'Nooit uitgevoerd',
        'Reguliere pentest (geen TLPT)',
        'TLPT in voorbereiding',
        'TIBER-NL test uitgevoerd',
      ]),
      q(2, 'Heeft u een register van alle kritieke ICT-dienstverleners (Art.28)?', [
        'Geen register',
        'Gedeeltelijk',
        'Compleet register',
        'Register + concentratierisico analyse + exit-plannen',
      ]),
      q(2, 'Heeft u exit-strategieen voor uw top-3 cloud providers?', [
        'Nee',
        'Conceptueel',
        'Gedocumenteerd',
        'Gedocumenteerd + periodiek getest',
      ]),
      q(3, 'Gebruikt u het DORA incident classificatieschema?', [
        'Onbekend',
        'Eigen classificatie',
        'DORA taxonomie in voorbereiding',
        'DORA-compliant met DNB rapportage',
      ]),
      q(3, 'Kunt u binnen de verplichte termijnen melden bij DNB?', [
        'Onzeker',
        'Handmatig proces',
        'Geautomatiseerd maar niet getest',
        'Volledig getest en operationeel',
      ]),
      q(4, 'Gebruikt u AI voor kredietscoring, AML of fraude-detectie?', [
        'Nee',
        'In pilot',
        'Ja, in productie',
        'Ja, met governance framework',
      ]),
      q(4, 'Is er een AI-risicoclassificatie conform EU AI Act voor uw modellen?', [
        'Niet mee bezig',
        'Bewust maar geen actie',
        'Inventarisatie gestart',
        'Classificatie compleet + model validation',
      ]),
    ],
  },

  // ─── S06: TELECOM & KRITIEKE INFRA ────────────────────
  s06: {
    sectorId: 's06',
    dimensions: ['NIS2 & EECC Compliance', 'OT/ICS Security', '5G Security', 'Incident Response', 'Post-Quantum Readiness'],
    questions: [
      q(0, 'Bent u compliant met zowel NIS2 als EECC beveiligingsvereisten?', [
        'Niet gestart',
        'NIS2 gestart, EECC onbekend',
        'Beide in voorbereiding',
        'Dual-regime compliance operationeel',
      ]),
      q(0, 'Is bestuurdersaansprakelijkheid voor cybersecurity formeel geborgd?', [
        'Niet besproken',
        'Bestuur geinformeerd',
        'Formeel mandaat CISO',
        'Board accountability + jaarlijkse training',
      ]),
      q(1, 'Hoe is uw OT/ICS (SCADA) beveiliging ingericht?', [
        'Geen specifiek OT beleid',
        'Basis IT/OT segmentatie',
        'IEC 62443 in voorbereiding',
        'IEC 62443 gecertificeerd + monitoring',
      ]),
      q(1, 'Zijn uw legacy SCADA-systemen beveiligd tegen IP-gebaseerde aanvallen?', [
        'Niet specifiek',
        'Air-gapped waar mogelijk',
        'Monitoring + access control',
        'Volledig gehardend + anomaly detection',
      ]),
      q(2, 'Heeft u de EU 5G Cybersecurity Toolbox geimplementeerd?', [
        'Onbekend',
        'Bewust maar niet gestart',
        'Gedeeltelijk',
        'Volledig geimplementeerd',
      ]),
      q(2, 'Hoe gaat u om met vendor diversificatie in uw netwerk?', [
        'Single vendor',
        'Overwegend single vendor',
        'Dual vendor strategie',
        'Multi-vendor met exit-opties',
      ]),
      q(3, 'Kunt u significante incidenten melden bij Agentschap Telecom/RDI?', [
        'Onzeker / geen proces',
        'Handmatig proces',
        'Geautomatiseerd, jaarlijks getest',
        '24/72h compliant + automatische escalatie',
      ]),
      q(4, 'Heeft u een crypto-inventarisatie voor post-quantum migratie?', [
        'Niet mee bezig',
        'Bewust maar niet gestart',
        'Inventarisatie gestart',
        'Inventarisatie compleet + migratieplan',
      ]),
      q(4, 'Kent u de ETSI PQC 2030 deadline en wat het voor uw infra betekent?', [
        'Onbekend',
        'Globaal bekend',
        'Impact-analyse gedaan',
        'Migratieplan met tijdlijn',
      ]),
    ],
  },

  // ─── S07: LOGISTIEK & SUPPLY CHAIN ──────────────────
  s07: {
    sectorId: 's07',
    dimensions: ['Cybersecurity & Keten', 'Data & Privacy', 'Digitale Documentstroom'],
    questions: [
      q(0, 'Hoe volwassen is uw cybersecurity beleid voor de volledige supply chain (inclusief toeleveranciers)?', [
        'Geen formeel beleid — beveiliging is ad hoc',
        'Intern beleid aanwezig, maar toeleveranciers niet meegenomen',
        'Keten-brede risicobeoordeling uitgevoerd, deels geïmplementeerd',
        'Volledig NIS2-conform, inclusief audits bij kritieke leveranciers',
      ]),
      q(0, 'Heeft u een incident response plan dat ook ketenpartners en klanten afdekt?', [
        'Nee, geen incident response plan',
        'Intern IRP, maar geen communicatieprotocol naar de keten',
        'IRP aanwezig met ketennotificatie, niet getest',
        'IRP actief, jaarlijks geoefend, meldplicht NIS2 vastgelegd',
      ]),
      q(0, 'Zijn uw warehouse- en transportmanagementsystemen (WMS/TMS) beveiligd tegen ongeautoriseerde toegang?', [
        'Geen specifieke beveiliging voor OT/WMS systemen',
        'Basis toegangscontrole, geen monitoring',
        'Role-based access + logging aanwezig',
        'MFA, SIEM-integratie, continue monitoring op OT/WMS',
      ]),
      q(1, 'Hoe verwerkt u persoonsgegevens van chauffeurs, klanten en ontvangers conform de AVG?', [
        'Geen register van verwerkingsactiviteiten',
        'Deels in kaart, geen verwerkersovereenkomsten',
        'Register aanwezig + verwerkersovereenkomsten met grote partners',
        'Volledig register, privacy-by-design in processen, DPA aangesteld',
      ]),
      q(1, 'Heeft u grensoverschrijdende datatransfers (bijv. tracking data naar niet-EU vervoerders) in kaart?', [
        'Onbekend waar data naartoe gaat',
        'Deels bekend, geen juridische basis voor transfers buiten EU',
        'SCC\'s of adequaatheidsbesluit aanwezig voor bekende transfers',
        'Volledige data map, alle transfers juridisch gedekt, EU-first beleid',
      ]),
      q(1, 'Hoe lang bewaart u vrachtdocumenten, GPS-data en klantgegevens, en is er een retentiebeleid?', [
        'Geen retentiebeleid — alles onbeperkt bewaard',
        'Informele afspraken, niet gedocumenteerd',
        'Retentieschema aanwezig, gedeeltelijk geautomatiseerd',
        'Volledig retentiebeleid, geautomatiseerde verwijdering, audit trail',
      ]),
      q(2, 'In hoeverre verwerkt u vrachtdocumenten (CMR, vrachtbrieven, douane-aangiften) digitaal conform eFTI?', [
        'Volledig papier — geen digitale verwerking',
        'Scan-and-store, geen gestructureerde digitale uitwisseling',
        'EDI of API-uitwisseling met sommige partners',
        'eFTI-ready platform, gestandaardiseerde digitale documentenstroom',
      ]),
      q(2, 'Hoe zoekbaar en doorzoekbaar zijn uw historische vrachtdocumenten voor audits en claims?', [
        'Handmatig zoeken in fysieke archieven',
        'Digitale bestanden, maar geen gestructureerde indexering',
        'Basiszoekfunctie op bestandsnaam/datum',
        'Volledige full-text zoekfunctie, AI-geassisteerde documentintelligentie',
      ]),
      q(2, 'Heeft u zicht op de compliancestatus van gevaarlijke stoffen (ADR) in uw documentenstroom?', [
        'Nee — ADR compliancedocumenten handmatig beheerd',
        'Deels gedocumenteerd, geen automatische validatie',
        'ADR-classificaties bijgehouden, periodieke controle',
        'Geautomatiseerde ADR-validatie geïntegreerd in operationeel systeem',
      ]),
    ],
  },

  // ─── S08: LEGAL & LEGALTECH ─────────────────────────
  s08: {
    sectorId: 's08',
    dimensions: ['AI-risico & Compliance', 'Data & Vertrouwelijkheid', 'Operationele Weerbaarheid'],
    questions: [
      q(0, 'Gebruikt uw organisatie AI-tools voor juridisch advies, contractanalyse of due diligence?', [
        'Nee — geen AI-gebruik in juridische processen',
        'Informeel gebruik (ChatGPT e.d.), geen beleid',
        'Gecontroleerd gebruik met goedgekeurde tools, deels gedocumenteerd',
        'Volledig AI-beleid, AI Act conformiteitscheck uitgevoerd, risicoclassificatie aanwezig',
      ]),
      q(0, 'Heeft u beoordeeld of uw AI-toepassingen vallen onder de "hoog-risico" categorie van de EU AI Act?', [
        'Nee — AI Act nog niet bekeken',
        'Bewust van de wetgeving, geen formele beoordeling',
        'Eerste risicoclassificatie gedaan, niet extern gevalideerd',
        'Volledige conformiteitsbeoordeling, register bijgehouden, legal counsel betrokken',
      ]),
      q(0, 'Zijn uw medewerkers getraind op verantwoord AI-gebruik en de juridische aansprakelijkheidsrisico\'s?', [
        'Geen training',
        'Informele bewustwording, geen formele training',
        'Training voor specifieke teams, niet organisatiebreed',
        'Verplichte AI-training, beleid op aansprakelijkheid, periodieke herhaling',
      ]),
      q(1, 'Hoe beschermt u cliëntvertrouwelijkheid (legal professional privilege) bij gebruik van cloud- en AI-diensten?', [
        'Geen specifieke maatregelen — standaard cloud gebruik',
        'DPA aanwezig, maar geen beperking op AI-training van clientdata',
        'EU-only cloud, contractuele garanties, deels geaggregeerd',
        'Volledige data-isolatie per cliënt, zero-retention AI-gebruik, contractueel vastgelegd',
      ]),
      q(1, 'Heeft u een verwerkersregister en privacybeleid dat specifiek rekening houdt met gevoelige juridische data?', [
        'Nee',
        'Generiek AVG-beleid, geen juridisch-specifieke aanpassing',
        'Register aanwezig, bijzondere categorieën gemarkeerd',
        'Volledig register, DPIA voor gevoelige verwerkingen, aangestelde DPO',
      ]),
      q(1, 'Hoe beheert u toegang tot digitale dossiers — wie kan wat zien, wanneer en via welk device?', [
        'Gedeelde login of minimale toegangscontrole',
        'Individuele accounts, geen role-based beperking',
        'Role-based access op zaak/cliëntniveau, logging aanwezig',
        'Zero-trust model, MFA, device-management, automatische audits',
      ]),
      q(2, 'Heeft u een business continuity plan voor cyberincidenten, waarbij cliëntdossiers toegankelijk blijven?', [
        'Geen BCP',
        'Informele afspraken, niet gedocumenteerd',
        'BCP aanwezig, niet specifiek voor cyberscenario\'s getest',
        'Volledig BCP, jaarlijkse cyberincidensoefening, RTO/RPO vastgesteld',
      ]),
      q(2, 'Valt uw organisatie onder DORA (bijv. legal diensten voor financiële instellingen) en heeft u dit beoordeeld?', [
        'Onbekend — DORA niet bekeken',
        'Bewust van DORA, geen formele beoordeling',
        'DORA-beoordeling gedaan, aanbevelingen nog niet doorgevoerd',
        'DORA-conform, contracten met ICT-leveranciers bijgewerkt, register aanwezig',
      ]),
      q(2, 'Hoe snel kunt u aantonen dat uw juridische adviezen en AI-outputs voldoen aan toepasselijke compliance-eisen?', [
        'Niet mogelijk — geen audit trail',
        'Deels traceerbaar via e-mail/dossier, handmatig',
        'Gestructureerde dossiervoering, beperkte AI-logging',
        'Volledige audit trail, AI-beslissingen gedocumenteerd, direct opvraagbaar',
      ]),
    ],
  },
};

export function getQuestionsForSector(sectorId: SectorId): SectorQuestions {
  return SECTOR_QUESTIONS[sectorId];
}
