/**
 * ============================================================
 * HCI I18N — Internationalisering Configuratie
 * hci-i18n.js
 *
 * HES Consultancy International
 * hes-consultancy-international.com
 *
 * TALEN:
 *   NL — Nederlands (volledig)
 *   EN — English (volledig)
 *   DE — Deutsch (structuur klaar, content TODO)
 *   FR — Français (structuur klaar, content TODO)
 *
 * GEBRUIK:
 *   <script src="hci-i18n.js"></script>
 *   HCIi18n.init(); // detecteert ?lang= param of browser taal
 *   HCIi18n.t('nav.cta') // geeft string in actieve taal
 *   HCIi18n.setLang('en') // wisselt taal
 *
 * NIEUWE TAAL TOEVOEGEN:
 *   1. Kopieer het NL blok
 *   2. Voeg toe als HCI_LANG.xx = { ... }
 *   3. Vertaal alle strings
 *   4. Voeg 'xx' toe aan HCI_SUPPORTED_LANGS
 *   Klaar. Geen andere code aanpassen.
 *
 * URL PARAM PRIORITEIT:
 *   ?lang=en  → altijd Engels, ongeacht browser
 *   ?lang=de  → altijd Duits
 *   Geen param → browser taal detectie → fallback NL
 * ============================================================
 */

(function(window) {
  'use strict';

  var HCI_SUPPORTED_LANGS = ['nl', 'en', 'de', 'fr'];
  var HCI_DEFAULT_LANG = 'nl';

  // ============================================================
  // LANGUAGE DEFINITIONS
  // ============================================================
  var HCI_LANG = {};

  // ==========================================================
  // NEDERLANDS — Volledig
  // ==========================================================
  HCI_LANG.nl = {
    meta: {
      lang: 'nl',
      label: 'Nederlands',
      flag: '🇳🇱',
      dir: 'ltr'
    },
    nav: {
      logo: 'HES Consultancy International',
      approach: 'Aanpak',
      method: 'Methodiek',
      cra: 'CRA Readiness',
      quickscan: 'Quick Scan',
      cta: 'Start analyse'
    },
    s01: {
      overline: 'HES Consultancy International — 30 jaar C-level ervaring',
      h1_line1: 'Uw organisatie staat',
      h1_line2: 'voor een digitale keuze.',
      h1_line3: 'De vraag is wie hem maakt.',
      sub: 'Europese regelgeving verandert het speelveld fundamenteel. NIS2, CRA, EU AI Act — elke sector krijgt te maken met nieuwe eisen. HCI brengt de structuur die uw organisatie van huidige situatie naar gewenst resultaat brengt.',
      cta_primary: 'Bouw uw roadmap →',
      cta_ghost: 'Hoe het werkt',
      cred_label: 'Jaar C-level\nervaring EU',
      scroll_hint: 'Scroll'
    },
    s02: {
      eyebrow: '02 — Het Landschap',
      h2_line1: 'De regelgeving is',
      h2_line2: 'geen waarschuwing.',
      h2_line3: 'Het is wet.',
      sub: 'Vier Europese regelgevingen bepalen nu het IT- en cybersecurity-landschap. Elke organisatie heeft een ander raakvlak. Klik op de wet die voor u het meest urgent aanvoelt.',
      reg_nis2_label: 'NIS2 · 2025',
      reg_nis2_title: 'Network & Info Security',
      reg_nis2_sub: 'Aantoonbare beveiligingsmaatregelen voor overheid, zorg en kritieke infrastructuur',
      reg_cra_label: 'CRA · 2027',
      reg_cra_title: 'Cyber Resilience Act',
      reg_cra_sub: 'Security-by-design voor alle software met digitale elementen op de EU-markt',
      reg_ai_label: 'EU AI ACT · 2025',
      reg_ai_title: 'AI Governance',
      reg_ai_sub: 'Hoog-risico AI systemen in zorg en publieke sector vereisen aantoonbaar toezicht',
      reg_dora_label: 'DORA · 2025',
      reg_dora_title: 'Digital Operational Resilience',
      reg_dora_sub: 'IT-risicobeheer en incidentrapportage voor financiële instellingen EU-breed'
    },
    s03: {
      eyebrow: '03 — De Gap',
      gap_cmo_label: 'Huidige situatie — CMO',
      gap_fmo_label: 'Gewenste situatie — FMO',
      icp: {
        default: {
          h2: 'De kloof tussen nu en straks.',
          sub: 'Elke organisatie staat ergens op de weg tussen huidige situatie en gewenst resultaat. HCI brengt die weg in kaart — en loopt hem mee.',
          cmo: ['Compliance als papieren oefening, niet als bedrijfspraktijk','Geen eenduidige taal tussen IT, directie en bestuur','Regelgeving als bedreiging in plaats van onderscheidend vermogen','Beslissingen zonder structureel kader'],
          fmo: ['Aantoonbare compliance als competitief voordeel','Gedeelde taal: van bestuur tot uitvoering','Regelgeving als fundament voor groei en vertrouwen','Gestructureerde roadmap met bewezen methodiek']
        },
        gemeente: {
          h2: 'Uw gemeente heeft een digitaal profiel. Weet u welk?',
          sub: '118 gemeenten gemeten door PubliekIT: gemiddeld 3,23/5. Innovatie & Veranderkracht is de zwakste dimensie bij 72% van gemeenten. NIS2 is wet — niet meer optioneel.',
          cmo: ['NIS2-maatregelen op papier maar niet in de praktijk geborgd','BIO-implementatie achterloopt op wettelijke verplichting','DPIA-achterstand — privacy-risico\'s niet systematisch in beeld','Raadsvragen over digitalisering zonder bestuurlijk antwoord'],
          fmo: ['Aantoonbare NIS2-gereedheid richting toezichthouder','BIO ISMS operationeel — niet alleen gedocumenteerd','Gebalanceerd digitaal volwassenheidsprofiel op 5 domeinen','Bestuurlijk verhaal klaar voor gemeenteraad en rekenkamer']
        },
        ziekenhuis: {
          h2: 'Uw clinici besteden 35% van hun tijd aan systemen.',
          sub: 'Niet aan patiënten. EU AI Act artikel 22 geldt voor hoog-risico AI in de zorg. Uw inkoopbeslissing van vandaag bepaalt uw AI-governance positie in 2027.',
          cmo: ['EPD-fragmentatie — datasilo\'s per afdeling, geen FHIR-integratie','Leveranciers claimen AI-proof zonder aantoonbare substantiatie','ROI-verantwoording richting RvB zonder meetbare uitkomsten','NEN 7510:2 als compliance-oefening, niet als kwaliteitssysteem'],
          fmo: ['Geïntegreerd EPD met FHIR — data beschikbaar waar nodig','EU AI Act-conformiteit aantoonbaar voor toezichthouder','Meetbare admin-reductie — business case richting RvB bewezen','NEN 7510:2 als fundament voor continue verbetering']
        },
        software: {
          h2: 'CRA 2027: geen compliance, geen EU-markt.',
          sub: 'Software met digitale elementen moet aantoonbaar security-by-design hebben. Geen uitzondering. Geen uitstel.',
          cmo: ['CRA als abstracte verplichting — geen concrete vertaling naar SDLC','Scrum delivery loopt vast op kwaliteit en technische schuld','Resources die CRA én delivery-kwaliteit begrijpen zijn schaars','Geen EU-markt strategie — internationalisering ad hoc'],
          fmo: ['CRA-gecertificeerd productportfolio — EU-markt bereikbaar','Happy Sprint als standaard werkwijze — kwaliteit systematisch','Delivery teams opgeleid in security-by-design principes','GTM-structuur voor Benelux/DACH markt gereed']
        },
        euentry: {
          h2: 'Uw product is klaar voor Europa. Uw GTM niet.',
          sub: 'Geen EU-aanwezigheid = onzichtbaar voor Europese inkopers, zelfs bij een superieur product.',
          cmo: ['Geen EU-entiteit — inkopers kunnen niet afnemen zonder risico','GDPR-gap — data-residency en verwerkersovereenkomsten ontbreken','Geen lokaal netwerk — C-level vertrouwen in EU is earned, niet gekocht','Verkeerde ICP-targeting — US-aanpak werkt niet in EU-markt'],
          fmo: ['EU juridische entiteit met GDPR-compliant stack','Eerste enterprise klant Benelux/DACH — bewijs van concept','Lokale partner-structuur — 30 jaar HCI netwerk als springplank','EU GTM-fase 1–4 uitgevoerd, pipeline actief']
        }
      }
    },
    s04: {
      eyebrow: '04 — De Methode',
      h2_line1: 'CMO→FMO.',
      h2_line2: '30 jaar bewezen.',
      h2_line3: 'Nu gestructureerd.',
      sub: 'Van Current Mode of Operation naar Future Mode of Operation. Niet als consultancy-jargon, maar als operationele methodiek. HCI begeleidt de volledige weg — van strategisch inzicht tot eerste klant.',
      step1_title: 'CMO-analyse — huidige situatie',
      step1_sub: 'Objectieve meting van uw digitale positie. Gaps geïdentificeerd. Urgentie helder. Geen rapport dat in la verdwijnt.',
      step2_title: 'FMO-ontwerp — gewenste situatie',
      step2_sub: 'Concreet, haalbaar, en afgestemd op uw sector en bestuurslaag. Niet abstract — meetbaar.',
      step3_title: 'GTM-executie — naar de markt',
      step3_sub: 'Outreach, engagement en sales-executie op basis van uw FMO. HCI loopt mee tot de eerste deal gesloten is.',
      step4_title: 'Overdracht — u staat er zelf',
      step4_sub: 'Na het traject heeft u een team, een proces en een pipeline. Geen afhankelijkheid van consultants. Dat is het doel.',
      stat1_label: 'Jaar C-level ervaring in Benelux & DACH',
      stat2_label: 'Sectoren — Gemeente · Zorg · Software · EU Entry',
      stat3_label: 'Per gepersonaliseerd CMO→FMO document',
      stat4_label: 'EU-regelgevingen actief bewaakt — NIS2, CRA, AI Act',
      partners_label: 'Partners'
    },
    s05: {
      eyebrow: '05 — Uw Roadmap',
      h2: 'Bouw uw CMO→FMO roadmap.',
      sub: 'Twee vragen. Directe output. Een gepersonaliseerde analyse voor uw organisatie — gegenereerd op basis van 30 jaar sectorkennis en actuele EU-regelgeving.',
      step1_label: 'Stap 1 van 2 — Uw sector',
      step1_q: 'In welke sector opereert uw organisatie?',
      step2_label: 'Stap 2 van 2 — Uw urgentie',
      back: '← Terug',
      generate: 'Genereer roadmap →',
      result_heading_pre: 'Uw',
      result_heading_post: 'roadmap is gereed.',
      form_naam: 'Naam',
      form_naam_ph: 'Uw naam',
      form_org: 'Organisatie',
      form_org_ph: 'Uw organisatie',
      form_email: 'E-mail',
      form_email_ph: 'uw@organisatie.nl',
      form_rol: 'Functie',
      form_rol_ph: 'bijv. CISO, CIO, Directeur',
      open_engine: 'Open CMO→FMO Generator →',
      direct_contact: 'Direct contact',
      icp_choices: {
        gemeente: { icon: '🏛️', title: 'Overheid & Gemeente', sub: 'NIS2 · BIO · Digitale Agenda · PubliekIT' },
        ziekenhuis: { icon: '🏥', title: 'Zorg & Healthcare', sub: 'EPD · EU AI Act · NEN 7510 · FHIR' },
        software: { icon: '💻', title: 'Software & Tech', sub: 'CRA 2027 · Security-by-design · Happy Sprint' },
        euentry: { icon: '🌍', title: 'EU Expansie', sub: 'GTM EU · GDPR · Benelux/DACH · Market Entry' }
      },
      icp_labels: {
        gemeente: 'Gemeente',
        ziekenhuis: 'Ziekenhuis',
        software: 'Software',
        euentry: 'EU Entry'
      },
      icp_questions: {
        gemeente: 'Wat is uw meest urgente uitdaging binnen de gemeente?',
        ziekenhuis: 'Welke zorguitdaging vraagt nu uw aandacht?',
        software: 'Wat blokkeert uw software-organisatie het meest?',
        euentry: 'Wat is de grootste barrière voor uw EU-expansie?'
      },
      icp_needs: {
        gemeente: ['NIS2-gereedheid aantoonbaar maken voor toezichthouder','BIO ISMS implementeren in de dagelijkse praktijk','Digitale volwassenheid meten en bestuurlijk rapporteren','DPIA-achterstand wegwerken en privacy-governance inrichten','Raadsvragen over digitalisering beantwoorden met structuur'],
        ziekenhuis: ['EU AI Act-conformiteit voor hoog-risico AI in de zorg','EPD-integratie en FHIR-implementatie structureren','ROI-verantwoording van IT-investeringen richting RvB','NEN 7510:2 als operationeel kwaliteitssysteem inrichten','Administratiedruk bij clinici meetbaar verlagen'],
        software: ['CRA 2027 vertalen naar concrete SDLC-aanpassingen','Security-by-design implementeren in sprint planning','Delivery-kwaliteit verbeteren via Happy Sprint methodiek','EU-markt benaderen met CRA-compliant productportfolio','Resources vinden die CRA én delivery-kwaliteit begrijpen'],
        euentry: ['Eerste EU-entiteit oprichten en GDPR-compliant worden','Eerste enterprise klant in Benelux/DACH binnenhalen','EU-specifieke ICP-targeting en GTM-strategie opzetten','Lokale netwerken activeren via HCI partner-structuur','NIS2/CRA-compliance als verkoopargument inzetten']
      },
      icp_result_subs: {
        gemeente: 'Op basis van de gemeente-sector en uw urgentie heeft HCI een NIS2/BIO gerichte CMO→FMO analyse samengesteld.',
        ziekenhuis: 'Op basis van uw zorgorganisatie is een EPD/AI Act gerichte analyse klaar.',
        software: 'Op basis van uw software-organisatie is een CRA-2027 gerichte roadmap samengesteld.',
        euentry: 'Op basis van uw EU-expansie doelstelling is een GTM-roadmap voor Benelux/DACH klaar.'
      }
    },
    welcome: {
      greeting: 'Welkom,',
      separator: '·',
      meta_suffix: '· Gepersonaliseerde analyse gereed',
      cta_icp: 'Bekijk uw roadmap →',
      cta_default: 'Start analyse →'
    },
    footer: {
      tagline: 'From Strategy to First Customer',
      links: { privacy: 'Privacybeleid', terms: 'Gebruiksvoorwaarden', contact: 'Contact' }
    }
  };

  // ==========================================================
  // ENGLISH — Complete
  // ==========================================================
  HCI_LANG.en = {
    meta: {
      lang: 'en',
      label: 'English',
      flag: '🇬🇧',
      dir: 'ltr'
    },
    nav: {
      logo: 'HES Consultancy International',
      approach: 'Approach',
      method: 'Methodology',
      cra: 'CRA Readiness',
      quickscan: 'Quick Scan',
      cta: 'Start analysis'
    },
    s01: {
      overline: 'HES Consultancy International — 30 years C-level experience',
      h1_line1: 'Your organisation faces',
      h1_line2: 'a digital decision.',
      h1_line3: 'The question is who makes it.',
      sub: 'European regulation is fundamentally reshaping the playing field. NIS2, CRA, EU AI Act — every sector faces new requirements. HCI provides the structure to take your organisation from current state to desired outcome.',
      cta_primary: 'Build your roadmap →',
      cta_ghost: 'How it works',
      cred_label: 'Years C-level\nexperience EU',
      scroll_hint: 'Scroll'
    },
    s02: {
      eyebrow: '02 — The Landscape',
      h2_line1: 'The regulation is not',
      h2_line2: 'a warning.',
      h2_line3: "It's law.",
      sub: 'Four European regulations now define the IT and cybersecurity landscape. Each organisation has a different exposure. Click on the regulation most urgent to you.',
      reg_nis2_label: 'NIS2 · 2025',
      reg_nis2_title: 'Network & Info Security',
      reg_nis2_sub: 'Demonstrable security measures for government, healthcare and critical infrastructure',
      reg_cra_label: 'CRA · 2027',
      reg_cra_title: 'Cyber Resilience Act',
      reg_cra_sub: 'Security-by-design for all software with digital elements on the EU market',
      reg_ai_label: 'EU AI ACT · 2025',
      reg_ai_title: 'AI Governance',
      reg_ai_sub: 'High-risk AI systems in healthcare and public sector require demonstrable oversight',
      reg_dora_label: 'DORA · 2025',
      reg_dora_title: 'Digital Operational Resilience',
      reg_dora_sub: 'IT risk management and incident reporting for financial institutions across the EU'
    },
    s03: {
      eyebrow: '03 — The Gap',
      gap_cmo_label: 'Current state — CMO',
      gap_fmo_label: 'Desired state — FMO',
      icp: {
        default: {
          h2: 'The gap between now and where you need to be.',
          sub: 'Every organisation is somewhere on the journey between current reality and desired outcome. HCI maps that journey — and walks it with you.',
          cmo: ['Compliance as a paper exercise, not business practice','No shared language between IT, management and the board','Regulation seen as threat rather than differentiator','Decisions made without a structural framework'],
          fmo: ['Demonstrable compliance as a competitive advantage','Shared language: from board to operations','Regulation as foundation for growth and trust','Structured roadmap with proven methodology']
        },
        gemeente: {
          h2: 'Your municipality has a digital profile. Do you know which?',
          sub: '118 municipalities measured by PubliekIT: average 3.23/5. Innovation & Change Capability is the weakest dimension at 72% of municipalities. NIS2 is law — no longer optional.',
          cmo: ['NIS2 measures documented but not embedded in practice','BIO implementation behind legal obligation','DPIA backlog — privacy risks not systematically mapped','Council questions on digitalisation without governance answers'],
          fmo: ['Demonstrable NIS2 readiness for the supervisory authority','BIO ISMS operational — not just documented','Balanced digital maturity profile across 5 domains','Board-level narrative ready for the municipal council']
        },
        ziekenhuis: {
          h2: 'Your clinicians spend 35% of their time on systems.',
          sub: 'Not on patients. EU AI Act Article 22 applies to high-risk AI in healthcare. Your procurement decision today determines your AI governance position in 2027.',
          cmo: ['EPR fragmentation — data silos per department, no FHIR integration','Vendors claim AI-proof without demonstrable evidence','ROI justification to the Board without measurable outcomes','ISO 27001 / NEN 7510 as compliance exercise, not quality system'],
          fmo: ['Integrated EPR with FHIR — data available where needed','EU AI Act conformity demonstrable to supervisory authority','Measurable admin reduction — business case proven to the Board','NEN 7510:2 as foundation for continuous improvement']
        },
        software: {
          h2: 'CRA 2027: no compliance, no EU market.',
          sub: 'Software with digital elements must demonstrably have security-by-design. No exceptions. No delays.',
          cmo: ['CRA as abstract obligation — no concrete translation to SDLC','Scrum delivery stalling on quality and technical debt','Resources who understand both CRA and delivery quality are scarce','No EU market strategy — internationalisation ad hoc'],
          fmo: ['CRA-certified product portfolio — EU market accessible','Happy Sprint as standard practice — quality systematic','Delivery teams trained in security-by-design principles','GTM structure for Benelux/DACH market ready']
        },
        euentry: {
          h2: 'Your product is ready for Europe. Your GTM is not.',
          sub: 'No EU presence = invisible to European buyers, even with a superior product.',
          cmo: ['No EU entity — buyers cannot procure without legal risk','GDPR gap — data residency and processing agreements missing','No local network — C-level trust in EU is earned, not bought','Wrong ICP targeting — US approach does not work in EU market'],
          fmo: ['EU legal entity with GDPR-compliant stack','First enterprise client in Benelux/DACH — proof of concept','Local partner structure — 30 years of HCI network as launchpad','EU GTM phases 1–4 executed, pipeline active']
        }
      }
    },
    s04: {
      eyebrow: '04 — The Method',
      h2_line1: 'CMO→FMO.',
      h2_line2: '30 years proven.',
      h2_line3: 'Now structured.',
      sub: 'From Current Mode of Operation to Future Mode of Operation. Not as consultancy jargon, but as an operational methodology. HCI guides the entire journey — from strategic insight to first customer.',
      step1_title: 'CMO analysis — current state',
      step1_sub: 'Objective measurement of your digital position. Gaps identified. Urgency clear. No report gathering dust.',
      step2_title: 'FMO design — desired state',
      step2_sub: 'Concrete, achievable, and aligned with your sector and governance layer. Not abstract — measurable.',
      step3_title: 'GTM execution — to market',
      step3_sub: 'Outreach, engagement and sales execution based on your FMO. HCI walks with you until the first deal is closed.',
      step4_title: 'Handover — you stand on your own',
      step4_sub: 'After the engagement you have a team, a process and a pipeline. No dependence on consultants. That is the goal.',
      stat1_label: 'Years C-level experience in Benelux & DACH',
      stat2_label: 'Sectors — Municipality · Healthcare · Software · EU Entry',
      stat3_label: 'Per personalised CMO→FMO document',
      stat4_label: 'EU regulations actively monitored — NIS2, CRA, AI Act',
      partners_label: 'Partners'
    },
    s05: {
      eyebrow: '05 — Your Roadmap',
      h2: 'Build your CMO→FMO roadmap.',
      sub: 'Two questions. Instant output. A personalised analysis for your organisation — generated from 30 years of sector knowledge and current EU regulation.',
      step1_label: 'Step 1 of 2 — Your sector',
      step1_q: 'In which sector does your organisation operate?',
      step2_label: 'Step 2 of 2 — Your urgency',
      back: '← Back',
      generate: 'Generate roadmap →',
      result_heading_pre: 'Your',
      result_heading_post: 'roadmap is ready.',
      form_naam: 'Name',
      form_naam_ph: 'Your name',
      form_org: 'Organisation',
      form_org_ph: 'Your organisation',
      form_email: 'Email',
      form_email_ph: 'you@organisation.eu',
      form_rol: 'Role',
      form_rol_ph: 'e.g. CISO, CIO, Director',
      open_engine: 'Open CMO→FMO Generator →',
      direct_contact: 'Direct contact',
      icp_choices: {
        gemeente: { icon: '🏛️', title: 'Government & Municipality', sub: 'NIS2 · BIO · Digital Agenda · PubliekIT' },
        ziekenhuis: { icon: '🏥', title: 'Healthcare & Life Sciences', sub: 'EPR · EU AI Act · NEN 7510 · FHIR' },
        software: { icon: '💻', title: 'Software & Tech', sub: 'CRA 2027 · Security-by-design · Happy Sprint' },
        euentry: { icon: '🌍', title: 'EU Expansion', sub: 'EU GTM · GDPR · Benelux/DACH · Market Entry' }
      },
      icp_labels: {
        gemeente: 'Government',
        ziekenhuis: 'Healthcare',
        software: 'Software',
        euentry: 'EU Entry'
      },
      icp_questions: {
        gemeente: 'What is your most urgent challenge within your municipality?',
        ziekenhuis: 'Which healthcare challenge requires your immediate attention?',
        software: 'What is blocking your software organisation most?',
        euentry: 'What is the biggest barrier to your EU expansion?'
      },
      icp_needs: {
        gemeente: ['Making NIS2 readiness demonstrable to the supervisory authority','Implementing BIO ISMS in day-to-day practice','Measuring digital maturity and reporting to the board','Clearing DPIA backlog and establishing privacy governance','Answering council questions on digitalisation with structure'],
        ziekenhuis: ['EU AI Act conformity for high-risk AI in healthcare','Structuring EPR integration and FHIR implementation','Justifying IT investment ROI to the Board of Directors','Implementing NEN 7510:2 as an operational quality system','Measurably reducing administrative burden on clinicians'],
        software: ['Translating CRA 2027 into concrete SDLC adjustments','Implementing security-by-design in sprint planning','Improving delivery quality via Happy Sprint methodology','Approaching the EU market with a CRA-compliant portfolio','Finding resources who understand both CRA and delivery quality'],
        euentry: ['Establishing a first EU entity and becoming GDPR-compliant','Landing the first enterprise client in Benelux/DACH','Setting up EU-specific ICP targeting and GTM strategy','Activating local networks via HCI partner structure','Using NIS2/CRA compliance as a sales argument']
      },
      icp_result_subs: {
        gemeente: 'Based on the government sector and your urgency, HCI has compiled a NIS2/BIO-focused CMO→FMO analysis.',
        ziekenhuis: 'Based on your healthcare organisation, an EPR/AI Act-focused analysis is ready.',
        software: 'Based on your software organisation, a CRA-2027-focused roadmap has been compiled.',
        euentry: 'Based on your EU expansion objectives, a GTM roadmap for Benelux/DACH is ready.'
      }
    },
    welcome: {
      greeting: 'Welcome,',
      separator: '·',
      meta_suffix: '· Personalised analysis ready',
      cta_icp: 'View your roadmap →',
      cta_default: 'Start analysis →'
    },
    footer: {
      tagline: 'From Strategy to First Customer',
      links: { privacy: 'Privacy Policy', terms: 'Terms of Use', contact: 'Contact' }
    }
  };

  // ==========================================================
  // DEUTSCH — Structuur klaar, content TODO
  // Invullen door native speaker of professioneel vertaler
  // ==========================================================
  HCI_LANG.de = {
    meta: {
      lang: 'de',
      label: 'Deutsch',
      flag: '🇩🇪',
      dir: 'ltr'
    },
    nav: {
      logo: 'HES Consultancy International',
      approach: 'Ansatz',          // TODO: review
      method: 'Methodik',          // TODO: review
      cra: 'CRA Readiness',
      quickscan: 'Quick Scan',
      cta: 'Analyse starten'       // TODO: review
    },
    s01: {
      overline: 'HES Consultancy International — 30 Jahre C-Level-Erfahrung',
      h1_line1: 'Ihre Organisation steht',
      h1_line2: 'vor einer digitalen Entscheidung.',
      h1_line3: 'Die Frage ist, wer sie trifft.',
      sub: 'TODO: Deutsche Übersetzung — Europäische Regulierung verändert das Spielfeld grundlegend...',
      cta_primary: 'Roadmap erstellen →',
      cta_ghost: 'So funktioniert es',
      cred_label: 'Jahre C-Level-\nErfahrung EU',
      scroll_hint: 'Scrollen'
    },
    s02: {
      eyebrow: '02 — Die Regulierungslandschaft',
      h2_line1: 'Die Regulierung ist',
      h2_line2: 'keine Warnung.',
      h2_line3: 'Es ist Gesetz.',
      sub: 'TODO: Deutsche Übersetzung',
      reg_nis2_label: 'NIS2 · 2025',
      reg_nis2_title: 'Netz- und Informationssicherheit',
      reg_nis2_sub: 'Nachweisbare Sicherheitsmaßnahmen für Behörden, Gesundheitswesen und kritische Infrastruktur',
      reg_cra_label: 'CRA · 2027',
      reg_cra_title: 'Cyber Resilience Act',
      reg_cra_sub: 'Security-by-Design für alle Software mit digitalen Elementen auf dem EU-Markt',
      reg_ai_label: 'EU KI-GESETZ · 2025',
      reg_ai_title: 'KI-Governance',
      reg_ai_sub: 'Hochrisiko-KI-Systeme im Gesundheits- und öffentlichen Sektor erfordern nachweisbare Kontrolle',
      reg_dora_label: 'DORA · 2025',
      reg_dora_title: 'Digitale operative Resilienz',
      reg_dora_sub: 'IT-Risikomanagement und Vorfallmeldung für Finanzinstitute in der gesamten EU'
    },
    s03: {
      eyebrow: '03 — Die Lücke',
      gap_cmo_label: 'Aktueller Zustand — CMO',
      gap_fmo_label: 'Gewünschter Zustand — FMO',
      icp: {
        default: {
          h2: 'Die Lücke zwischen jetzt und dem Ziel.',
          sub: 'TODO: Deutsche Übersetzung',
          cmo: ['TODO','TODO','TODO','TODO'],
          fmo: ['TODO','TODO','TODO','TODO']
        },
        gemeente: { h2: 'TODO', sub: 'TODO', cmo: ['TODO','TODO','TODO','TODO'], fmo: ['TODO','TODO','TODO','TODO'] },
        ziekenhuis: { h2: 'TODO', sub: 'TODO', cmo: ['TODO','TODO','TODO','TODO'], fmo: ['TODO','TODO','TODO','TODO'] },
        software: { h2: 'TODO', sub: 'TODO', cmo: ['TODO','TODO','TODO','TODO'], fmo: ['TODO','TODO','TODO','TODO'] },
        euentry: { h2: 'TODO', sub: 'TODO', cmo: ['TODO','TODO','TODO','TODO'], fmo: ['TODO','TODO','TODO','TODO'] }
      }
    },
    s04: {
      eyebrow: '04 — Die Methode',
      h2_line1: 'CMO→FMO.',
      h2_line2: '30 Jahre bewährt.',
      h2_line3: 'Jetzt strukturiert.',
      sub: 'TODO: Deutsche Übersetzung',
      step1_title: 'CMO-Analyse — Ist-Zustand', step1_sub: 'TODO',
      step2_title: 'FMO-Design — Soll-Zustand', step2_sub: 'TODO',
      step3_title: 'GTM-Ausführung — zur Marktreife', step3_sub: 'TODO',
      step4_title: 'Übergabe — Sie stehen allein', step4_sub: 'TODO',
      stat1_label: 'Jahre C-Level-Erfahrung in Benelux & DACH',
      stat2_label: 'Branchen — Behörden · Gesundheit · Software · EU-Eintritt',
      stat3_label: 'Pro personalisiertem CMO→FMO Dokument',
      stat4_label: 'EU-Vorschriften aktiv überwacht — NIS2, CRA, KI-Gesetz',
      partners_label: 'Partner'
    },
    s05: {
      eyebrow: '05 — Ihre Roadmap',
      h2: 'Erstellen Sie Ihre CMO→FMO Roadmap.',
      sub: 'TODO: Deutsche Übersetzung',
      step1_label: 'Schritt 1 von 2 — Ihre Branche',
      step1_q: 'In welcher Branche ist Ihre Organisation tätig?',
      step2_label: 'Schritt 2 von 2 — Ihre Dringlichkeit',
      back: '← Zurück',
      generate: 'Roadmap erstellen →',
      result_heading_pre: 'Ihre',
      result_heading_post: 'Roadmap ist fertig.',
      form_naam: 'Name', form_naam_ph: 'Ihr Name',
      form_org: 'Organisation', form_org_ph: 'Ihre Organisation',
      form_email: 'E-Mail', form_email_ph: 'sie@organisation.de',
      form_rol: 'Funktion', form_rol_ph: 'z.B. CISO, CIO, Direktor',
      open_engine: 'CMO→FMO Generator öffnen →',
      direct_contact: 'Direktkontakt',
      icp_choices: {
        gemeente: { icon: '🏛️', title: 'Behörden & Kommunen', sub: 'NIS2 · BSI-Grundschutz · Digitale Agenda' },
        ziekenhuis: { icon: '🏥', title: 'Gesundheit & Life Sciences', sub: 'KIS · EU KI-Gesetz · ISO 27001 · HL7 FHIR' },
        software: { icon: '💻', title: 'Software & Tech', sub: 'CRA 2027 · Security-by-Design · Agile' },
        euentry: { icon: '🌍', title: 'EU-Markteintritt', sub: 'GTM EU · DSGVO · DACH · Markteintritt' }
      },
      icp_labels: { gemeente: 'Behörden', ziekenhuis: 'Gesundheit', software: 'Software', euentry: 'EU-Eintritt' },
      icp_questions: {
        gemeente: 'Was ist Ihre dringendste Herausforderung in Ihrer Behörde?',
        ziekenhuis: 'Welche Gesundheitsherausforderung erfordert jetzt Ihre Aufmerksamkeit?',
        software: 'Was blockiert Ihre Softwareorganisation am meisten?',
        euentry: 'Was ist die größte Barriere für Ihren EU-Markteintritt?'
      },
      icp_needs: {
        gemeente: ['TODO — NIS2 Nachweisbarkeit','TODO — BSI-Grundschutz','TODO — Digitale Reife','TODO','TODO'],
        ziekenhuis: ['TODO','TODO','TODO','TODO','TODO'],
        software: ['TODO','TODO','TODO','TODO','TODO'],
        euentry: ['TODO','TODO','TODO','TODO','TODO']
      },
      icp_result_subs: {
        gemeente: 'TODO: Deutsche Ergebnisbeschreibung',
        ziekenhuis: 'TODO',
        software: 'TODO',
        euentry: 'TODO'
      }
    },
    welcome: {
      greeting: 'Willkommen,',
      separator: '·',
      meta_suffix: '· Personalisierte Analyse bereit',
      cta_icp: 'Ihre Roadmap ansehen →',
      cta_default: 'Analyse starten →'
    },
    footer: {
      tagline: 'From Strategy to First Customer',
      links: { privacy: 'Datenschutzrichtlinie', terms: 'Nutzungsbedingungen', contact: 'Kontakt' }
    }
  };

  // ==========================================================
  // FRANÇAIS — Structuur klaar, content TODO
  // Pour Belgique (Wallonie + Bruxelles) et France
  // ==========================================================
  HCI_LANG.fr = {
    meta: {
      lang: 'fr',
      label: 'Français',
      flag: '🇧🇪',
      dir: 'ltr'
    },
    nav: {
      logo: 'HES Consultancy International',
      approach: 'Approche',
      method: 'Méthodologie',
      cra: 'CRA Readiness',
      quickscan: 'Quick Scan',
      cta: 'Démarrer l\'analyse'
    },
    s01: {
      overline: 'HES Consultancy International — 30 ans d\'expérience C-level',
      h1_line1: 'Votre organisation est confrontée',
      h1_line2: 'à une décision numérique.',
      h1_line3: 'La question est qui la prend.',
      sub: 'TODO: Traduction française — La réglementation européenne transforme fondamentalement le paysage...',
      cta_primary: 'Construire votre feuille de route →',
      cta_ghost: 'Comment ça marche',
      cred_label: 'Ans d\'expérience\nC-level EU',
      scroll_hint: 'Défiler'
    },
    s02: {
      eyebrow: '02 — Le Paysage',
      h2_line1: 'La réglementation n\'est pas',
      h2_line2: 'un avertissement.',
      h2_line3: 'C\'est la loi.',
      sub: 'TODO: Traduction française',
      reg_nis2_label: 'NIS2 · 2025',
      reg_nis2_title: 'Sécurité des réseaux et de l\'information',
      reg_nis2_sub: 'Mesures de sécurité démontrables pour les administrations, la santé et les infrastructures critiques',
      reg_cra_label: 'CRA · 2027',
      reg_cra_title: 'Cyber Resilience Act',
      reg_cra_sub: 'Sécurité dès la conception pour tous les logiciels avec éléments numériques sur le marché UE',
      reg_ai_label: 'LOI IA UE · 2025',
      reg_ai_title: 'Gouvernance de l\'IA',
      reg_ai_sub: 'Les systèmes d\'IA à haut risque dans la santé et le secteur public nécessitent une supervision démontrable',
      reg_dora_label: 'DORA · 2025',
      reg_dora_title: 'Résilience opérationnelle numérique',
      reg_dora_sub: 'Gestion des risques IT et déclaration d\'incidents pour les institutions financières dans l\'UE'
    },
    s03: {
      eyebrow: '03 — L\'Écart',
      gap_cmo_label: 'État actuel — CMO',
      gap_fmo_label: 'État souhaité — FMO',
      icp: {
        default: {
          h2: 'L\'écart entre maintenant et l\'objectif.',
          sub: 'TODO: Traduction française',
          cmo: ['TODO','TODO','TODO','TODO'],
          fmo: ['TODO','TODO','TODO','TODO']
        },
        gemeente: { h2: 'TODO', sub: 'TODO', cmo: ['TODO','TODO','TODO','TODO'], fmo: ['TODO','TODO','TODO','TODO'] },
        ziekenhuis: { h2: 'TODO', sub: 'TODO', cmo: ['TODO','TODO','TODO','TODO'], fmo: ['TODO','TODO','TODO','TODO'] },
        software: { h2: 'TODO', sub: 'TODO', cmo: ['TODO','TODO','TODO','TODO'], fmo: ['TODO','TODO','TODO','TODO'] },
        euentry: { h2: 'TODO', sub: 'TODO', cmo: ['TODO','TODO','TODO','TODO'], fmo: ['TODO','TODO','TODO','TODO'] }
      }
    },
    s04: {
      eyebrow: '04 — La Méthode',
      h2_line1: 'CMO→FMO.',
      h2_line2: '30 ans d\'expérience.',
      h2_line3: 'Maintenant structuré.',
      sub: 'TODO: Traduction française',
      step1_title: 'Analyse CMO — état actuel', step1_sub: 'TODO',
      step2_title: 'Conception FMO — état souhaité', step2_sub: 'TODO',
      step3_title: 'Exécution GTM — vers le marché', step3_sub: 'TODO',
      step4_title: 'Transfert — vous volez de vos propres ailes', step4_sub: 'TODO',
      stat1_label: 'Ans d\'expérience C-level en Benelux & DACH',
      stat2_label: 'Secteurs — Communes · Santé · Logiciels · Entrée UE',
      stat3_label: 'Par document CMO→FMO personnalisé',
      stat4_label: 'Réglementations UE surveillées — NIS2, CRA, Loi IA',
      partners_label: 'Partenaires'
    },
    s05: {
      eyebrow: '05 — Votre Feuille de Route',
      h2: 'Construisez votre feuille de route CMO→FMO.',
      sub: 'TODO: Traduction française',
      step1_label: 'Étape 1 sur 2 — Votre secteur',
      step1_q: 'Dans quel secteur opère votre organisation ?',
      step2_label: 'Étape 2 sur 2 — Votre urgence',
      back: '← Retour',
      generate: 'Générer la feuille de route →',
      result_heading_pre: 'Votre feuille de route',
      result_heading_post: 'est prête.',
      form_naam: 'Nom', form_naam_ph: 'Votre nom',
      form_org: 'Organisation', form_org_ph: 'Votre organisation',
      form_email: 'E-mail', form_email_ph: 'vous@organisation.be',
      form_rol: 'Fonction', form_rol_ph: 'ex. RSSI, DSI, Directeur',
      open_engine: 'Ouvrir le générateur CMO→FMO →',
      direct_contact: 'Contact direct',
      icp_choices: {
        gemeente: { icon: '🏛️', title: 'Gouvernement & Communes', sub: 'NIS2 · BIO · Agenda numérique · CPSPE' },
        ziekenhuis: { icon: '🏥', title: 'Santé & Life Sciences', sub: 'DSP · Loi IA UE · NEN 7510 · FHIR' },
        software: { icon: '💻', title: 'Logiciels & Tech', sub: 'CRA 2027 · Security-by-design · Agile' },
        euentry: { icon: '🌍', title: 'Expansion UE', sub: 'GTM UE · RGPD · Benelux/DACH · Entrée marché' }
      },
      icp_labels: { gemeente: 'Gouvernement', ziekenhuis: 'Santé', software: 'Logiciels', euentry: 'Entrée UE' },
      icp_questions: {
        gemeente: 'Quel est votre défi le plus urgent au sein de votre commune ?',
        ziekenhuis: 'Quel défi de santé nécessite votre attention immédiate ?',
        software: 'Qu\'est-ce qui bloque le plus votre organisation logicielle ?',
        euentry: 'Quelle est la plus grande barrière à votre expansion en UE ?'
      },
      icp_needs: {
        gemeente: ['TODO — NIS2 démontrable','TODO','TODO','TODO','TODO'],
        ziekenhuis: ['TODO','TODO','TODO','TODO','TODO'],
        software: ['TODO','TODO','TODO','TODO','TODO'],
        euentry: ['TODO','TODO','TODO','TODO','TODO']
      },
      icp_result_subs: {
        gemeente: 'TODO: Description résultat française',
        ziekenhuis: 'TODO', software: 'TODO', euentry: 'TODO'
      }
    },
    welcome: {
      greeting: 'Bienvenue,',
      separator: '·',
      meta_suffix: '· Analyse personnalisée prête',
      cta_icp: 'Voir votre feuille de route →',
      cta_default: 'Démarrer l\'analyse →'
    },
    footer: {
      tagline: 'From Strategy to First Customer',
      links: { privacy: 'Politique de confidentialité', terms: 'Conditions d\'utilisation', contact: 'Contact' }
    }
  };

  // ============================================================
  // ENGINE
  // ============================================================
  var _lang = HCI_DEFAULT_LANG;

  function detectLang() {
    // 1. URL param wins always
    var params = new URLSearchParams(window.location.search);
    var p = params.get('lang');
    if (p && HCI_SUPPORTED_LANGS.includes(p.toLowerCase())) return p.toLowerCase();

    // 2. HTML lang attribute
    var htmlLang = document.documentElement.lang;
    if (htmlLang) {
      var base = htmlLang.toLowerCase().split('-')[0];
      if (HCI_SUPPORTED_LANGS.includes(base)) return base;
    }

    // 3. Browser language
    var nav = (navigator.language || navigator.userLanguage || '').toLowerCase().split('-')[0];
    if (HCI_SUPPORTED_LANGS.includes(nav)) return nav;

    return HCI_DEFAULT_LANG;
  }

  function setLang(lang) {
    if (!HCI_SUPPORTED_LANGS.includes(lang)) lang = HCI_DEFAULT_LANG;
    _lang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = HCI_LANG[lang].meta.dir;
    // Update URL without reload
    var url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url.toString());
    // Fire event so page can re-render
    document.dispatchEvent(new CustomEvent('hci:lang-changed', { detail: { lang: lang } }));
  }

  function t(key) {
    var parts = key.split('.');
    var obj = HCI_LANG[_lang];
    for (var i = 0; i < parts.length; i++) {
      if (obj === undefined || obj === null) break;
      obj = obj[parts[i]];
    }
    // Fallback to NL if key missing in active lang
    if (obj === undefined || obj === 'TODO') {
      var fb = HCI_LANG[HCI_DEFAULT_LANG];
      for (var j = 0; j < parts.length; j++) { if (!fb) break; fb = fb[parts[j]]; }
      return fb || key;
    }
    return obj;
  }

  function getLang() { return _lang; }
  function getLangData() { return HCI_LANG[_lang]; }
  function getAllLangs() { return HCI_SUPPORTED_LANGS.map(function(l){ return { code: l, label: HCI_LANG[l].meta.label, flag: HCI_LANG[l].meta.flag }; }); }

  function init() {
    _lang = detectLang();
    document.documentElement.lang = _lang;
    document.documentElement.dir = HCI_LANG[_lang] ? HCI_LANG[_lang].meta.dir : 'ltr';
  }

  window.HCIi18n = {
    init: init,
    t: t,
    setLang: setLang,
    getLang: getLang,
    getLangData: getLangData,
    getAllLangs: getAllLangs,
    langs: HCI_LANG,
    supported: HCI_SUPPORTED_LANGS
  };

  init();

})(window);
