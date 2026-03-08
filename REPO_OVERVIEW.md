# HCI Platform — Volledige Repository Inventarisatie

**Datum:** 2026-03-07
**Scope:** 38 repos — mbhes1970-afk + Nxt-Era-Solutions-part-of-HCI
**Analyst:** Claude (geautomatiseerde code-analyse)

---

## Samenvatting

| Categorie | Aantal |
|-----------|--------|
| Totaal repos | 38 |
| Productie | 14 |
| Demo | 14 |
| Prototype | 3 |
| Archief (leeg) | 3 |
| Te beoordelen | 4 |

| Aanbeveling | Aantal |
|-------------|--------|
| ACTIEF HOUDEN | 18 |
| CONSOLIDEREN | 7 |
| UPGRADEN | 2 |
| BEOORDELEN | 6 |
| ARCHIVEREN | 5 |

---

## 1. HCI Platform Core

| Repo | Doel | Stack | Claude API | DealFlow | PocketBase | Status | Aanbeveling |
|------|------|-------|------------|----------|------------|--------|-------------|
| **hci-platform** | Centraal intelligence platform (25+ pagina's) | HTML/JS + Netlify | Proxy (veilig) | Ja (BroadcastChannel) | Nee | Productie | ACTIEF HOUDEN |
| **HCI-DealFlow** | Deal pipeline management + MEDDIC+ | React + Vite | Proxy (veilig) | Ja | Ja | Productie | ACTIEF HOUDEN |
| **ProspectIQ** | ICP Workshop Tool — 5-stappen workflow | HTML/JS + SheetJS | Proxy (veilig) | Ja (3 strategieën) | Ja | Productie | ACTIEF HOUDEN |
| **HCI-Modules-Pro** | PMC, GTM & Outreach modules | HTML/JS + Netlify | Proxy (veilig) | Nee | Nee | Productie | ACTIEF HOUDEN |
| **PMC-module-HCI** | GTM framework — 4 modules | HTML/JS + Netlify | Proxy (veilig) | Nee | Nee | Demo | ACTIEF HOUDEN |
| **HCI-Assessment** | EU Market Entry Assessment | HTML/JS + Netlify ID | Nee | Nee | Nee | Productie | ACTIEF HOUDEN |
| **HCI-CMO-FMO-Generator** | CMO→FMO rapport generator | HTML/JS | Direct (ONVEILIG) | Ja (BroadcastChannel) | Nee | Productie | UPGRADEN |
| **CMO-FMO-Funnel-APP** | CMO→FMO quickscan generator | HTML/JS | Direct (ONVEILIG) | Nee | Nee | Productie | UPGRADEN |
| **CMO-FMO-Module-CW** | Duplicaat CMO-FMO-Funnel-APP | HTML/JS | Direct (ONVEILIG) | Nee | Nee | Productie | CONSOLIDEREN |
| **hci-dealflow-playbook** | DealFlow marketing/landing page | HTML (CDN Tailwind) | Nee | Content only | Nee | Productie | ACTIEF HOUDEN |

---

## 2. Klant Playbooks & Partner Enablement

| Repo | Doel | Partner | Sector | Status | Aanbeveling |
|------|------|---------|--------|--------|-------------|
| **BlueNap-Commercial-Playbook** | Sales playbook (ICP, ROI, 3 talen) | BlueNAP Americas | Finance | Productie | ACTIEF HOUDEN |
| **Chunk-Works-partner-playbook** | Partner onboarding (e-signature sproof) | Chunk Works | Algemeen | Productie | ACTIEF HOUDEN |
| **Chunk-Works-Certification-Module** | Partner certificering (4 tiers) | Chunk Works | Algemeen | Productie | ACTIEF HOUDEN |
| **S23K-Playbook-HCI** | Partner playbook (18 secties, access code) | S23K | Algemeen | Productie | ACTIEF HOUDEN |
| **vuorox-partner-playbook-hci** | Partner playbook (healthcare scheduling) | Vuorox | Zorg | Productie | ACTIEF HOUDEN |
| **hes-partner-enablement-program** | PortableEHR partner training | PortableEHR | Zorg | Productie | ARCHIVEREN |

---

## 3. Sector AI Tools

| Repo | Doel | AI Backend | Sector | Status | Aanbeveling |
|------|------|-----------|--------|--------|-------------|
| **ADO-HCI-Defence** | Defence operations (intel, mission, training) | Claude (proxy) | Defensie | Productie | ACTIEF HOUDEN |
| **ai-police-platform** | Digitale Politie Werkplaats (13 modules) | Mistral | Overheid | Demo | ACTIEF HOUDEN |
| **AI-Talent-HR** | Recruitment & HR Platform (6 modules) | Geen | HR | Demo | ACTIEF HOUDEN |
| **lexai-pro-demo** | LexAI Pro juridisch (contract analyse) | Mistral + Dify | Juridisch | Demo | ACTIEF HOUDEN |
| **ai-justice-platform** | Juridisch platform (case intake → verdict) | Mistral | Juridisch | Demo | BEOORDELEN |
| **juridischhulp-ai** | Juridisch hulp chatbot (6 rechtsgebieden) | Geen backend | Juridisch | Productie | BEOORDELEN |
| **nxtera-ai-chatbot** | Website chatbot nxterasolutions.eu | Claude (proxy) | Algemeen | Productie | CONSOLIDEREN |
| **AI-Welcom-Nxt-Era-Solutions** | Asielreceptie assistent (10 talen) | Geen | Overheid | Demo | ACTIEF HOUDEN |

---

## 4. Demo's & Prototypes

| Repo | Doel | Sector | Status | Aanbeveling |
|------|------|--------|--------|-------------|
| **ai-citizen-demo** | Gemeentelijke diensten assistent | Overheid | Demo | BEOORDELEN |
| **AI-Justice-Police** | Politie/justitie burger assistent | Juridisch | Demo | CONSOLIDEREN |
| **ai-mental-health** | GGZ hulp assistent | Zorg | Demo | CONSOLIDEREN |
| **AI-zorgwijzer** | Zorgwijzer (symptomen, huisarts, verzekering) | Zorg | Demo | CONSOLIDEREN |
| **AI-Property-Demo** | Vastgoed assistent | Finance | Demo | CONSOLIDEREN |
| **AI-Reclassering** | Reclassering/probation assistent | Juridisch | Demo | CONSOLIDEREN |
| **CRA-Compliance-demo** | CyberProtection compliance dashboard | Overheid | Demo | BEOORDELEN |
| **Talen-HR-AI** | Vereenvoudigde AI-Talent-HR | HR | Demo | CONSOLIDEREN |
| **AI-Defence-Operations** | Defence prototype (OPORD, intel) | Defensie | Prototype | BEOORDELEN |
| **Nxt-Era-Solutions** | AI Clinic & AI Practice prototypes | Zorg | Prototype | BEOORDELEN |
| **LexAI-Nxt-Era-Solutions** | LexAI Pro prototype | Juridisch | Prototype | BEOORDELEN |

---

## 5. Archiveren (leeg / verouderd)

| Repo | Reden |
|------|-------|
| **AI-Property** | Leeg repository — geen broncode |
| **AI-Bot-Website** | Leeg repository — geen broncode |
| **Central-Judicial-Collection-Agency** | Leeg repository — geen broncode |
| **hes-partner-enablement-program** | PortableEHR mogelijk deprecated |

---

## Duplicate / Overlapping Detectie

### Bevestigde duplicaten
| Groep | Repos | Actie |
|-------|-------|-------|
| CMO/FMO Generator | `CMO-FMO-Funnel-APP` = `CMO-FMO-Module-CW` | Samenvoegen → 1 repo + proxy |
| HR AI | `AI-Talent-HR` ≈ `Talen-HR-AI` | Talen-HR is oudere versie → archiveren |
| LexAI | `LexAI-Nxt-Era-Solutions` ≈ `lexai-pro-demo` | Consolideren → 1 repo |

### Mogelijke consolidaties
| Groep | Repos | Overweging |
|-------|-------|-----------|
| Juridisch | `ai-justice-platform` + `AI-Justice-Police` + `AI-Reclassering` | Zelfde template, andere content |
| Zorg | `ai-mental-health` + `AI-zorgwijzer` | Beide healthcare, geen AI backend |
| Defence | `ADO-HCI-Defence` vs `AI-Defence-Operations` | ADO is production, andere is prototype → archiveer prototype |

---

## Claude Proxy Status

### Veilig (via proxy)
| Repo | Proxy bestand |
|------|--------------|
| hci-platform | `netlify/functions/claude-proxy.js` |
| HCI-DealFlow | `/.netlify/functions/claude-proxy` (verwijst naar proxy) |
| ProspectIQ | `netlify/functions/claude-proxy.js` |
| ADO-HCI-Defence | `netlify/functions/ado-proxy.js` |
| HCI-Modules-Pro | `netlify/functions/chat.js` |
| PMC-module-HCI | `netlify/functions/chat.js` |
| nxtera-ai-chatbot | `netlify/functions/chat.js` |

### ONVEILIG (directe API call in browser)
| Repo | Bestand | Risico |
|------|---------|--------|
| **CMO-FMO-Funnel-APP** | `index.html:1363` | Direct fetch naar api.anthropic.com |
| **CMO-FMO-Module-CW** | `index.html:1363` | Duplicaat — zelfde kwetsbaarheid |
| **HCI-CMO-FMO-Generator** | `index.html:1195, 3153` | Direct fetch naar api.anthropic.com |

### Geen Claude API
28 repos gebruiken geen Claude API (sommige gebruiken Mistral, de meeste geen AI backend).

### Hardcoded API Keys
Geen hardcoded API keys gevonden in enige repository. Alle repos gebruiken environment variables.

---

## PocketBase Integratie Status

| Repo | PocketBase | Status |
|------|-----------|--------|
| **HCI-DealFlow** | Ja — `src/services/pb.js` + auth service | Gekoppeld aan api.hes-consultancy-international.com |
| **ProspectIQ** | Ja — WP5 REST API export strategie | PB_URL configureerbaar, nog niet live |
| Overige 36 repos | Nee | Geen PocketBase integratie |

---

## Aanbevolen Acties per Categorie

### 1. Direct koppelen aan PocketBase
1. **ProspectIQ** — `VITE_PB_URL` instellen op `api.hes-consultancy-international.com`
2. **HCI-Assessment** — Assessment resultaten opslaan in PocketBase
3. **Chunk-Works-Certification-Module** — Certificeringsvoortgang persisteren (nu localStorage)

### 2. Claude proxy toevoegen (URGENT)
1. **CMO-FMO-Funnel-APP** — Directe API call → proxy (kopieer van hci-platform)
2. **HCI-CMO-FMO-Generator** — Directe API call → proxy
3. **CMO-FMO-Module-CW** — Eerst consolideren met Funnel-APP, dan proxy

### 3. Archiveren voor overzicht
1. **AI-Property** — Leeg, geen code
2. **AI-Bot-Website** — Leeg, geen code
3. **Central-Judicial-Collection-Agency** — Leeg, geen code
4. **Talen-HR-AI** — Duplicaat van AI-Talent-HR
5. **hes-partner-enablement-program** — PortableEHR mogelijk niet meer relevant

---

## Tech Stack Verdeling

| Stack | Aantal | Repos |
|-------|--------|-------|
| React 18 (CRA) | 11 | ai-justice-platform, AI-Justice-Police, ai-mental-health, AI-Property-Demo, AI-Reclassering, AI-Welcom, AI-zorgwijzer, juridischhulp-ai, ai-citizen-demo, AI-Talent-HR, Talen-HR-AI |
| React 18 (Vite) | 3 | ADO-HCI-Defence, HCI-DealFlow, CRA-Compliance-demo |
| React + Python (FastAPI) | 2 | lexai-pro-demo, LexAI-Nxt-Era-Solutions |
| React + Mistral | 2 | ai-police-platform, ai-justice-platform |
| HTML/JS + Netlify Functions | 4 | hci-platform, HCI-Modules-Pro, PMC-module-HCI, nxtera-ai-chatbot |
| HTML/JS (single-file) | 10 | BlueNap, Chunk-Works-*, CMO-FMO-*, HCI-Assessment, HCI-CMO-FMO-Generator, S23K, vuorox |
| Static HTML prototype | 3 | Nxt-Era-Solutions, AI-Defence-Operations, hes-partner-enablement |
| Leeg | 3 | AI-Property, AI-Bot-Website, Central-Judicial-Collection-Agency |

---

*Gegenereerd op 2026-03-07 door Claude. Gebruik `repo-inventory.json` voor machine-readable data.*
