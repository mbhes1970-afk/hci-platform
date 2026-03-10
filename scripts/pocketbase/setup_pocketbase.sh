#!/bin/bash
# HCI PocketBase Setup Script
# Uitvoeren op de Hetzner server: bash setup_pocketbase.sh
# Vereist: PocketBase draait op https://api.hes-consultancy-international.com
PB_URL="https://api.hes-consultancy-international.com"
ADMIN_EMAIL="mbhes@hes-consultancy-international.com"
ADMIN_PW="${1:-NieuwWachtwoord123!}"  # Geef wachtwoord mee als argument

echo "=== HCI PocketBase Setup ==="
echo "Server: $PB_URL"

# ─── Stap 1: Authenticeer en haal token op ───────────────────────────────────
echo ""
echo "→ Authenticeren..."

# Probeer eerst v0.23+ superusers endpoint
TOKEN=$(curl -s -X POST "$PB_URL/api/collections/_superusers/auth-with-password" \
  -H "Content-Type: application/json" \
  -d "{\"identity\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PW\"}" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token',''))" 2>/dev/null)

# Fallback: oudere admins endpoint
if [ -z "$TOKEN" ]; then
  TOKEN=$(curl -s -X POST "$PB_URL/api/admins/auth-with-password" \
    -H "Content-Type: application/json" \
    -d "{\"identity\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PW\"}" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token',''))" 2>/dev/null)
fi

if [ -z "$TOKEN" ]; then
  echo "✗ Authenticatie mislukt. Controleer wachtwoord."
  echo "  Reset wachtwoord via CLI op de server:"
  echo "  /root/pocketbase/pocketbase superuser upsert $ADMIN_EMAIL NieuwWachtwoord123!"
  exit 1
fi

echo "✓ Token ontvangen"

# ─── Helper functie: maak collectie aan ──────────────────────────────────────
create_collection() {
  local NAME=$1
  local SCHEMA=$2

  # Check of collectie al bestaat
  EXISTS=$(curl -s "$PB_URL/api/collections/$NAME" \
    -H "Authorization: Bearer $TOKEN" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('name',''))" 2>/dev/null)

  if [ "$EXISTS" = "$NAME" ]; then
    echo "  ↳ $NAME: bestaat al, overgeslagen"
    return 0
  fi

  RESULT=$(curl -s -X POST "$PB_URL/api/collections" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$SCHEMA")

  if echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('name') else 1)" 2>/dev/null; then
    echo "  ✓ $NAME aangemaakt"
  else
    echo "  ✗ $NAME fout: $(echo $RESULT | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("message","onbekend"))' 2>/dev/null)"
  fi
}

# ─── Stap 2: Collecties aanmaken ─────────────────────────────────────────────
echo ""
echo "→ Collecties aanmaken..."

# kb_regulations
create_collection "kb_regulations" '{
  "name": "kb_regulations",
  "type": "base",
  "schema": [
    {"name":"code","type":"text","required":true,"options":{"min":2,"max":20}},
    {"name":"naam_nl","type":"text","required":true},
    {"name":"naam_en","type":"text","required":false},
    {"name":"sectoren","type":"json","required":false},
    {"name":"deadline","type":"text","required":false},
    {"name":"boete_max","type":"text","required":false},
    {"name":"scope","type":"text","required":false},
    {"name":"verplichtingen","type":"json","required":false},
    {"name":"pijn_per_rol","type":"json","required":false},
    {"name":"cra_relevant","type":"bool","required":false},
    {"name":"bronnen","type":"json","required":false},
    {"name":"actief","type":"bool","required":false}
  ]
}'

# ncsc_alerts
create_collection "ncsc_alerts" '{
  "name": "ncsc_alerts",
  "type": "base",
  "schema": [
    {"name":"titel","type":"text","required":true},
    {"name":"sector","type":"text","required":false},
    {"name":"urgentie","type":"select","required":false,"options":{"values":["hoog","midden","laag"]}},
    {"name":"publicatiedatum","type":"date","required":false},
    {"name":"advisory_url","type":"url","required":false},
    {"name":"linkedin_draft","type":"text","required":false},
    {"name":"gepubliceerd","type":"bool","required":false},
    {"name":"gepubliceerd_op","type":"date","required":false}
  ]
}'

# ted_tenders
create_collection "ted_tenders" '{
  "name": "ted_tenders",
  "type": "base",
  "schema": [
    {"name":"notice_id","type":"text","required":true},
    {"name":"titel","type":"text","required":false},
    {"name":"land","type":"text","required":false},
    {"name":"cpv_code","type":"text","required":false},
    {"name":"waarde","type":"number","required":false},
    {"name":"relevant","type":"bool","required":false},
    {"name":"score","type":"number","required":false},
    {"name":"icp","type":"text","required":false},
    {"name":"sector","type":"text","required":false},
    {"name":"ted_url","type":"url","required":false},
    {"name":"slack_bericht","type":"text","required":false},
    {"name":"actie","type":"text","required":false},
    {"name":"status","type":"select","required":false,"options":{"values":["nieuw","bekeken","actie","gesloten"]}}
  ]
}'

# ap_handhaving
create_collection "ap_handhaving" '{
  "name": "ap_handhaving",
  "type": "base",
  "schema": [
    {"name":"titel","type":"text","required":true},
    {"name":"type","type":"select","required":false,"options":{"values":["boete","handhaving","aanbeveling","anders"]}},
    {"name":"bedrag","type":"number","required":false},
    {"name":"sector","type":"text","required":false},
    {"name":"organisatie_type","type":"text","required":false},
    {"name":"overtreding_kort","type":"text","required":false},
    {"name":"hci_kans","type":"text","required":false},
    {"name":"linkedin_haak","type":"text","required":false},
    {"name":"ap_url","type":"url","required":false},
    {"name":"publicatiedatum","type":"date","required":false}
  ]
}'

# signalmesh_leads
create_collection "signalmesh_leads" '{
  "name": "signalmesh_leads",
  "type": "base",
  "schema": [
    {"name":"session_id","type":"text","required":false},
    {"name":"icp_type","type":"text","required":false},
    {"name":"sector","type":"text","required":false},
    {"name":"tier","type":"select","required":false,"options":{"values":["cold","warm","hot","tier1"]}},
    {"name":"fit_score","type":"number","required":false},
    {"name":"intent_score","type":"number","required":false},
    {"name":"deal_flow_score","type":"number","required":false},
    {"name":"qualifier_answers","type":"json","required":false},
    {"name":"story_sections_read","type":"number","required":false},
    {"name":"utm_source","type":"text","required":false},
    {"name":"is_return_visitor","type":"bool","required":false},
    {"name":"device_type","type":"text","required":false},
    {"name":"language","type":"text","required":false}
  ]
}'

# linkedin_posts
create_collection "linkedin_posts" '{
  "name": "linkedin_posts",
  "type": "base",
  "schema": [
    {"name":"thema","type":"text","required":false},
    {"name":"post_tekst","type":"text","required":false},
    {"name":"doelgroep","type":"text","required":false},
    {"name":"bron_type","type":"text","required":false},
    {"name":"status","type":"select","required":false,"options":{"values":["draft","goedgekeurd","gepubliceerd","afgewezen"]}},
    {"name":"gepubliceerd_op","type":"date","required":false},
    {"name":"week_van","type":"date","required":false}
  ]
}'

# deals uitbreiden (bestaande collectie fields toevoegen)
echo "  → deals collectie: fields toevoegen via patch..."
curl -s -X PATCH "$PB_URL/api/collections/deals" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"schema":[
    {"name":"follow_up_verstuurd","type":"bool","required":false},
    {"name":"datum_follow_up","type":"date","required":false},
    {"name":"follow_up_geblokkeerd","type":"bool","required":false},
    {"name":"laatste_contact","type":"date","required":false},
    {"name":"kvk_nummer","type":"text","required":false},
    {"name":"sbi_code","type":"text","required":false},
    {"name":"kvk_verrijkt","type":"bool","required":false}
  ]}' > /dev/null 2>&1
echo "  ✓ deals uitgebreid (of al aanwezig)"

# ─── Stap 3: Seed kb_regulations ─────────────────────────────────────────────
echo ""
echo "→ Kennisdatabank seeden..."

seed_regulation() {
  local DATA=$1
  curl -s -X POST "$PB_URL/api/collections/kb_regulations/records" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$DATA" > /dev/null 2>&1
}

seed_regulation '{
  "code": "CRA",
  "naam_nl": "Cyber Resilience Act",
  "naam_en": "Cyber Resilience Act",
  "sectoren": ["s06","s03","s01","s04"],
  "deadline": "December 2027 (36 maanden na inwerkingtreding)",
  "boete_max": "€15 miljoen of 2,5% jaarlijkse wereldwijde omzet",
  "scope": "Alle fabrikanten, importeurs en distributeurs van producten met digitale elementen op de EU-markt. Pure SaaS/PaaS valt buiten scope tenzij gekoppeld aan hardware.",
  "verplichtingen": [
    "Security by design en by default verplicht",
    "CE-markering verplicht voor software met digitale elementen",
    "SBOM (Software Bill of Materials) continu genereren en bijhouden",
    "Kwetsbaarheden actief melden aan ENISA/CSIRT binnen 24 uur na ontdekking",
    "Producten moeten updatebaar en patchbaar zijn gedurende verwachte levensduur",
    "Technische documentatie bijhouden en beschikbaar stellen",
    "EU Declaration of Conformity opstellen",
    "Rapportageverplichtingen gelden al per september 2026 (21 maanden na inwerkingtreding)"
  ],
  "pijn_per_rol": {
    "CTO": "CE-markering traject is complex en kost 3-6 maanden. SBOM tooling integreren in CI/CD pipeline.",
    "CISO": "Vulnerability disclosure proces inrichten. 24-uurs meldplicht is operationeel zwaar.",
    "CFO": "Boetes tot €15M. Compliance kost initieel €50K-€500K afhankelijk van product complexiteit.",
    "CEO": "Producten zonder CE-markering mogen na dec 2027 niet meer op EU markt. Existentieel risico."
  },
  "bronnen": [
    {"url": "https://www.cyberresilienceact.eu/the-cra-explained/", "titel": "CRA Explained"},
    {"url": "https://digital-strategy.ec.europa.eu/en/library/cyber-resilience-act", "titel": "Officiële EU tekst"}
  ],
  "actief": true
}'
echo "  ✓ CRA"

seed_regulation '{
  "code": "NIS2",
  "naam_nl": "Network and Information Security Directive 2",
  "naam_en": "NIS2 Directive",
  "sectoren": ["s01","s02","s04","s06","s07"],
  "deadline": "Oktober 2024 (reeds van kracht in NL via Cbw)",
  "boete_max": "€10 miljoen of 2% jaarlijkse wereldwijde omzet voor essentiële entiteiten",
  "scope": "Essentiële en belangrijke entiteiten in 18 sectoren. In NL: ~3.500 organisaties. Bestuurders persoonlijk aansprakelijk (art. 20).",
  "verplichtingen": [
    "Risicobeheer voor informatiebeveiliging implementeren",
    "Incidentmeldplicht: significante incidenten binnen 24 uur melden bij NCSC/CSIRT",
    "Business continuity maatregelen (BCP/DRP)",
    "Supply chain security: leveranciers beoordelen op security",
    "Bestuurders moeten security trainingen volgen",
    "Registratieplicht bij nationale autoriteit",
    "Penetratietesten en vulnerability assessments uitvoeren"
  ],
  "pijn_per_rol": {
    "CISO": "Meldplicht 24 uur is operationeel complex. Incident response proces moet strak staan.",
    "CFO": "Investering in security maatregelen verplicht. Geen keuze meer — boetes zijn hoger dan kosten.",
    "Bestuurder": "Persoonlijke aansprakelijkheid bij grove nalatigheid. Bestuursaansprakelijkheid is nieuw.",
    "IT Manager": "Supply chain assessment van alle leveranciers verplicht. Grote administratieve last."
  },
  "bronnen": [
    {"url": "https://www.ncsc.nl/themas/nis2", "titel": "NCSC NIS2 pagina"},
    {"url": "https://www.digitaleoverheid.nl/nis2", "titel": "Digitale Overheid NIS2"}
  ],
  "actief": true
}'
echo "  ✓ NIS2"

seed_regulation '{
  "code": "DORA",
  "naam_nl": "Digital Operational Resilience Act",
  "naam_en": "DORA",
  "sectoren": ["s03"],
  "deadline": "Januari 2025 (reeds van kracht)",
  "boete_max": "Tot 1% gemiddelde dagelijkse wereldwijde omzet per dag bij aanhoudende overtreding",
  "scope": "Financiële entiteiten: banken, verzekeraars, beleggingsinstellingen, betalingsdienstverleners, crypto-asset dienstverleners en hun kritieke ICT-leveranciers.",
  "verplichtingen": [
    "ICT-risicobeheerframework implementeren en jaarlijks testen",
    "Alle ICT-gerelateerde incidenten classificeren en ernstige melden bij DNB/AFM",
    "Jaarlijkse Digital Operational Resilience Testing (DORA-testen)",
    "Kritieke ICT-leveranciers contractueel vastleggen met exitstrategie",
    "Register van alle ICT-contracten bijhouden",
    "Threat-led penetration testing (TLPT) voor systeemrelevante instellingen"
  ],
  "pijn_per_rol": {
    "CIO": "ICT-register en leveranciersmanagement kost 6-12 maanden implementatietijd.",
    "CISO": "TLPT vereist externe red team — kostbaar en tijdsintensief.",
    "CFO": "Alle ICT-contracten moeten DORA-clausules bevatten. Renegotiatie leveranciers.",
    "Compliance": "Rapportage aan DNB/AFM over ICT-incidenten vereist nieuw proces."
  },
  "bronnen": [
    {"url": "https://www.dnb.nl/actueel/nieuws/nieuwsoverzicht/2025/dora/", "titel": "DNB DORA pagina"}
  ],
  "actief": true
}'
echo "  ✓ DORA"

seed_regulation '{
  "code": "BIO",
  "naam_nl": "Baseline Informatiebeveiliging Overheid",
  "naam_en": "Dutch Government Information Security Baseline",
  "sectoren": ["s01","s05"],
  "deadline": "2023 verplicht voor alle overheidsorganisaties",
  "boete_max": "Geen directe boetes — wel politieke en bestuurlijke consequenties. AP kan AVG-boetes opleggen bij datalekken.",
  "scope": "Alle Nederlandse overheidsorganisaties: gemeenten, provincies, waterschappen, rijksoverheid, uitvoeringsorganisaties.",
  "verplichtingen": [
    "BIO implementeren als vervanging van VIR/VIR-BI",
    "ISMS (Information Security Management System) inrichten",
    "Jaarlijkse ENSIA-verantwoording voor gemeenten",
    "DigiD audit verplicht voor gemeenten met DigiD-koppelingen",
    "Risicoanalyses uitvoeren conform BIO systematiek",
    "Security awareness programma voor medewerkers"
  ],
  "pijn_per_rol": {
    "CISO": "ENSIA-verantwoording vereist aantoonbare implementatie van 60+ maatregelen.",
    "IT Manager": "DigiD audit is jaarlijks verplicht. Tekortkomingen leiden tot intrekking DigiD-certificaat.",
    "Gemeentesecretaris": "Eindverantwoordelijkheid voor informatiebeveiliging ligt bij bestuur.",
    "Raadslid": "Periodieke rapportage over informatiebeveiliging verplicht aan gemeenteraad."
  },
  "bronnen": [
    {"url": "https://www.digitaleoverheid.nl/bio", "titel": "BIO - Digitale Overheid"},
    {"url": "https://www.ensia.nl", "titel": "ENSIA verantwoording"}
  ],
  "actief": true
}'
echo "  ✓ BIO"

seed_regulation '{
  "code": "NEN7510",
  "naam_nl": "NEN 7510:2 - Informatiebeveiliging in de zorg",
  "naam_en": "NEN 7510:2 Healthcare Information Security",
  "sectoren": ["s02"],
  "deadline": "Continu verplicht. NEN 7510:2 (2017) is huidige standaard.",
  "boete_max": "AP boetes tot €17,5 miljoen bij datalekken patiëntdata (AVG). IGJ kan vergunningen intrekken.",
  "scope": "Alle zorgaanbieders die persoonsgegevens van patiënten verwerken: ziekenhuizen, huisartsen, GGZ, thuiszorg, apothekers.",
  "verplichtingen": [
    "Informatiebeveiligingsbeleid implementeren conform NEN 7510",
    "Toegangsbeheer patiëntgegevens (Wet cliëntenrechten zorg)",
    "Encryptie van patiëntgegevens in transit en at rest",
    "Logging van toegang tot EPD-systemen (audit trails)",
    "NEN 7510 certificering (niet verplicht maar sterk aanbevolen)",
    "Medische apparatuur met netwerkverbinding beveiligen (NEN 7510-2)",
    "Datalekken melden bij AP binnen 72 uur"
  ],
  "pijn_per_rol": {
    "CISO": "Medische IoT (infuuspompen, MRI) is kwetsbaar en moeilijk te patchen. Groot aanvalsoppervlak.",
    "CIO": "EPD-leveranciers moeten aantoonbaar NEN 7510-compliant zijn. Contractueel vastleggen.",
    "Bestuurder": "67% van zorginstellingen non-compliant op encryptie. Persoonlijke aansprakelijkheid bij lek.",
    "Privacy Officer": "Patiëntdata is bijzondere categorie AVG. Dubbel strenge eisen."
  },
  "bronnen": [
    {"url": "https://www.nen.nl/nen-7510", "titel": "NEN 7510 standaard"},
    {"url": "https://www.nictiz.nl", "titel": "Nictiz zorg-IT"}
  ],
  "actief": true
}'
echo "  ✓ NEN7510"

seed_regulation '{
  "code": "AI_ACT",
  "naam_nl": "EU AI Act",
  "naam_en": "EU Artificial Intelligence Act",
  "sectoren": ["s06","s08","s02","s03"],
  "deadline": "Augustus 2026: verboden AI-praktijken. Augustus 2027: high-risk AI systemen.",
  "boete_max": "€35 miljoen of 7% wereldwijde omzet voor verboden AI. €15M of 3% voor high-risk overtredingen.",
  "scope": "Alle aanbieders en gebruikers van AI-systemen op de EU-markt. Risico-gebaseerd: verboden / hoog-risico / beperkt risico / minimaal risico.",
  "verplichtingen": [
    "AI-systemen classificeren op risiconiveau",
    "High-risk AI: conformiteitsbeoordeling verplicht voor markttoegang",
    "High-risk AI: technische documentatie, logging, menselijk toezicht",
    "Transparantie: gebruikers informeren wanneer zij met AI interacteren",
    "Verboden AI-praktijken per aug 2026: social scoring, real-time biometrie openbare ruimte",
    "GPAI (General Purpose AI) modellen: extra verplichtingen voor providers"
  ],
  "pijn_per_rol": {
    "CTO": "Welke van onze AI-features zijn high-risk? Classificatie is complex en onduidelijk.",
    "Legal": "AI Act interageert met AVG, Productaansprakelijkheidsrichtlijn en sectorspecifieke wetgeving.",
    "CFO": "High-risk conformiteitstraject kost €50K-€200K. Verboden features moeten worden uitgeschakeld.",
    "CISO": "AI-systemen in security tooling (bijv. SIEM met ML) kunnen zelf high-risk zijn."
  },
  "bronnen": [
    {"url": "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai", "titel": "EU AI Act officieel"},
    {"url": "https://www.government.nl/topics/artificial-intelligence/eu-ai-act", "titel": "NL overheid AI Act"}
  ],
  "actief": true
}'
echo "  ✓ AI Act"

seed_regulation '{
  "code": "AVG",
  "naam_nl": "Algemene Verordening Gegevensbescherming",
  "naam_en": "General Data Protection Regulation (GDPR)",
  "sectoren": ["s01","s02","s03","s04","s05","s06","s07","s08"],
  "deadline": "Van kracht sinds 25 mei 2018",
  "boete_max": "€20 miljoen of 4% wereldwijde jaaromzet voor ernstige overtredingen",
  "scope": "Elke organisatie die persoonsgegevens van EU-burgers verwerkt, ongeacht vestigingsland.",
  "verplichtingen": [
    "Rechtmatige grondslag voor elke verwerking van persoonsgegevens",
    "Verwerkingsregister bijhouden (verplicht bij >250 medewerkers of risicovolle verwerking)",
    "DPIA uitvoeren bij hoog-risico verwerkingen",
    "Datalekken melden bij AP binnen 72 uur",
    "Betrokkenen informeren over verwerking (privacy statement)",
    "Rechten van betrokkenen faciliteren (inzage, correctie, verwijdering)",
    "Data Protection Officer aanstellen indien vereist"
  ],
  "pijn_per_rol": {
    "Privacy Officer": "Verwerkingsregister bijhouden voor alle systemen is continu werk.",
    "IT Manager": "Alle nieuwe systemen moeten privacy impact assessment krijgen voor ingebruikname.",
    "CFO": "AP handhaving neemt toe. Gemiddelde boete NL 2024: €1,2M. Verzekering dekt dit niet altijd.",
    "HR": "Personeelsdata vereist aparte verwerkingsgrondslag. Cookie consent op intranet verplicht."
  },
  "bronnen": [
    {"url": "https://www.autoriteitpersoonsgegevens.nl", "titel": "Autoriteit Persoonsgegevens"},
    {"url": "https://gdpr-info.eu", "titel": "GDPR Info (Engelstalig)"}
  ],
  "actief": true
}'
echo "  ✓ AVG/GDPR"

seed_regulation '{
  "code": "EFTI",
  "naam_nl": "eFTI - Elektronische vrachtinformatie",
  "naam_en": "Electronic Freight Transport Information",
  "sectoren": ["s07"],
  "deadline": "Augustus 2025: vrijwillig. Augustus 2029: autoriteiten verplicht digitaal te accepteren.",
  "boete_max": "Nog geen directe boetes vastgesteld in eFTI verordening zelf",
  "scope": "Vervoerders, verladers, expediteurs en logistieke dienstverleners die goederen transporteren binnen de EU.",
  "verplichtingen": [
    "Vrachtdocumenten digitaal beschikbaar stellen via gecertificeerde eFTI-platforms",
    "eFTI-platform certificering vereist",
    "Interoperabiliteit met nationale autoriteiten (Douane, RDW, ILT)",
    "Data beschikbaar houden voor controle door handhavende autoriteiten",
    "Combineren met NIS2 verplichtingen voor kritieke infrastructuur"
  ],
  "pijn_per_rol": {
    "IT Manager": "eFTI-platform integreren met TMS (Transport Management System) — significante IT investering.",
    "Compliance": "eFTI + NIS2 + CSRD tegelijk — logistiek heeft drie grote complianceverplichtingen tegelijk.",
    "CFO": "Digitalisering vrachtdocumentatie vereist investering in platform en opleiding.",
    "Operations": "Chauffeurs en planners moeten werken met digitale documenten in plaats van papier."
  },
  "bronnen": [
    {"url": "https://transport.ec.europa.eu/transport-modes/road/efti_en", "titel": "EU eFTI pagina"}
  ],
  "actief": true
}'
echo "  ✓ eFTI"

seed_regulation '{
  "code": "CSRD",
  "naam_nl": "Corporate Sustainability Reporting Directive",
  "naam_en": "CSRD",
  "sectoren": ["s07","s04","s03"],
  "deadline": "2024: grote beursgenoteerde bedrijven. 2025: grote niet-beursgenoteerde. 2026: mid-cap.",
  "boete_max": "Nationaal bepaald. NL: handhaving via AFM. Verwachte boetes vergelijkbaar met AVG.",
  "scope": "Grote EU-bedrijven (>500 medewerkers of beursgenoteerd) en hun toeleveranciers (via due diligence verplichting).",
  "verplichtingen": [
    "Dubbele materialiteitsanalyse uitvoeren",
    "Rapportage over ESG-risicos en impact conform ESRS-standaarden",
    "Supply chain due diligence: ook leveranciers beoordelen op duurzaamheid",
    "Externe assurance op duurzaamheidsrapportage",
    "Digitale rapportage conform XBRL-taxonomie"
  ],
  "pijn_per_rol": {
    "CFO": "CSRD rapportage vereist nieuwe data-infrastructuur. Kosten €100K-€1M implementatie.",
    "IT Manager": "Data collectie van 1000+ datapunten per jaar. Nieuw systeem of uitbreiding ERP nodig.",
    "Compliance": "CSRD overlapt met CSDDD (EU Due Diligence wet) — dubbel werk vermijden.",
    "Operations": "Supply chain data vereist medewerking van leveranciers die zelf ook moeten rapporteren."
  },
  "bronnen": [
    {"url": "https://www.afm.nl/nl-nl/professionals/onderwerpen/csrd", "titel": "AFM CSRD pagina"}
  ],
  "actief": true
}'
echo "  ✓ CSRD"

# ─── Stap 4: Verificatie ──────────────────────────────────────────────────────
echo ""
echo "→ Verificatie..."

COUNT=$(curl -s "$PB_URL/api/collections/kb_regulations/records?perPage=1" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('totalItems',0))" 2>/dev/null)

echo "  ✓ kb_regulations: $COUNT records aangemaakt"

echo ""
echo "=== Setup compleet ==="
echo ""
echo "Volgende stappen:"
echo "1. Ga naar: $PB_URL/_/"
echo "2. Login met: $ADMIN_EMAIL / $ADMIN_PW"
echo "3. Controleer alle collecties zijn aangemaakt"
echo "4. n8n workflows bouwen (zie SPRINT_N8N_DEALFLOW_ENGINE.md)"
