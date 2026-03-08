# SignalMesh v2 — Deploy Instructies

## Architectuur

```
signalmesh.config.js              ← Configuratie (sectoren, ICP's, scoring, Quickscan vragen)
signalmesh-engine.js              ← Scoring + IP intel + dwell + scroll + consent
signalmesh-quickscan.js           ← Quickscan modal (5 vragen → score → CTA)
signalmesh-ai-agent.js            ← Claude AI agent voor gepersonaliseerd advies
signalmesh-cmo-bridge.js          ← Brug naar DealFlow (PocketBase deals)
optout.html                       ← Privacy opt-out pagina (GDPR Art. 21)
netlify/edge-functions/
  ip-intelligence.js              ← IPInfo B2B org detectie (Edge Function)
netlify/functions/
  signalmesh-alert.js             ← Slack alerts voor warm+ bezoekers
  claude-proxy.js                 ← AI proxy (reeds aanwezig)
```

## Stap 1 — Netlify env vars instellen

Ga naar: **Netlify → Site settings → Environment variables**

Voeg toe:
- `ANTHROPIC_API_KEY` = [reeds aanwezig]
- `SLACK_WEBHOOK_URL` = [Mike vult in na Slack webhook aanmaken]
- `IPINFO_TOKEN` = [Gratis op https://ipinfo.io/signup — 50K calls/mnd]

### Slack Webhook aanmaken:
1. Ga naar https://api.slack.com/apps
2. Maak een nieuwe app of gebruik bestaande
3. Activeer "Incoming Webhooks"
4. Maak een webhook voor het gewenste kanaal
5. Kopieer de URL naar Netlify env var

## Stap 2 — Scripts toevoegen aan HCI website

Voeg toe aan de `<head>` van de HCI JouwWeb website:

```html
<script src="https://hci-platform.netlify.app/signalmesh.config.js"></script>
<script src="https://hci-platform.netlify.app/signalmesh-engine.js"></script>
```

Voeg toe **voor** `</body>`:

```html
<!-- Quickscan Modal Container -->
<div id="sm-quickscan"></div>

<!-- Widget -->
<div id="sm-widget" style="position:fixed;bottom:24px;right:24px;background:#1e293b;border:1px solid #334155;border-radius:14px;padding:16px 20px;max-width:320px;box-shadow:0 12px 40px rgba(0,0,0,0.4);transform:translateY(120%);transition:transform 0.4s ease;z-index:9000;color:#e2e8f0;font-family:system-ui,sans-serif;">
  <button onclick="this.parentElement.classList.remove('sm-visible')" style="position:absolute;top:8px;right:12px;background:none;border:none;color:#64748b;font-size:16px;cursor:pointer;">&times;</button>
  <h4 style="font-size:14px;margin:0 0 6px;">Compliance check nodig?</h4>
  <p style="font-size:12px;color:#94a3b8;margin:0 0 10px;">Doe de gratis Quickscan en ontdek waar uw organisatie staat.</p>
  <button onclick="document.getElementById('sm-quickscan').classList.add('sm-open')" style="padding:8px 16px;background:#6C5CE7;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">Start Quickscan</button>
</div>

<!-- SignalMesh Scripts -->
<script src="https://hci-platform.netlify.app/signalmesh-quickscan.js"></script>
<script src="https://hci-platform.netlify.app/signalmesh-ai-agent.js"></script>
<script src="https://hci-platform.netlify.app/signalmesh-cmo-bridge.js"></script>
```

## Stap 3 — Data-attributen toevoegen aan JouwWeb

De volgende `data-sm` attributen moeten op de juiste elementen staan:

| Attribuut | Doel | Waar plaatsen |
|-----------|------|---------------|
| `data-sm="hero"` | Hero sectie | De hero `<section>` of `<div>` |
| `data-sm="hero-kicker"` | Kicker tekst boven h1 | Klein `<span>` of `<p>` element |
| `data-sm="hero-h1"` | Hoofdtitel | `<h1>` of `<h2>` element |
| `data-sm="hero-sub"` | Sub-tekst | `<p>` element onder de titel |
| `data-sm="regulation-pills"` | Compliance pills | Lege `<div>` container |
| `data-sm="pain-chips"` | Pijnpunten grid | Lege `<div>` container |
| `data-sm="cta-primary"` | Primaire CTA knop | `<button>` of `<a>` element |
| `data-sm="cta-secondary"` | Secundaire CTA | `<button>` of `<a>` element |

## Stap 4 — PocketBase collecties aanmaken

Op de server (api.hes-consultancy-international.com):

### Collectie: `quickscans`
| Veld | Type | Beschrijving |
|------|------|-------------|
| icp | text | ICP ID (icp1/icp2/icp3) |
| sector | text | Sector ID (s01-s06) |
| tier | text | SignalMesh tier |
| sm_score | number | SignalMesh totaal score |
| qs_score | number | Quickscan percentage |
| qs_tier | text | Quickscan urgentie (low/medium/high) |
| answers | json | Antwoorden JSON |
| vid | text | Visitor ID |
| utm_source | text | UTM source |
| contact_name | text | Naam (optioneel) |
| contact_email | email | E-mail (optioneel) |
| contact_org | text | Organisatie (optioneel) |
| lang | text | Taal (nl/en) |
| page | text | Pagina URL |

### Collectie: `deals`
| Veld | Type | Beschrijving |
|------|------|-------------|
| company | text | Bedrijfsnaam of VID |
| stage | text | Pipeline stage |
| source | text | Bron (SignalMesh v2) |
| icp | text | ICP ID |
| sector | text | Sector ID |
| tier | text | Tier |
| score | number | Totaal score |
| utm_source | text | UTM source |
| utm_campaign | text | UTM campaign |
| vid | text | Visitor ID |
| lang | text | Taal |
| page | text | Pagina URL |
| qs_score | number | Quickscan score (optioneel) |
| qs_tier | text | Quickscan tier (optioneel) |
| contact_name | text | Naam (optioneel) |
| contact_email | email | E-mail (optioneel) |
| contact_org | text | Organisatie (optioneel) |

## Stap 5 — Testen

Open DevTools → Console:

```javascript
window.__sm.getState()            // Huidige state zien
window.__sm.forceShow()           // Widget tonen
window.__sm.selectICP('icp3')     // ICP handmatig zetten
window.__sm.selectSector('s01')   // Sector handmatig zetten
window.__sm.debug()               // Console table
```

### Test URLs (op de Netlify deploy):
```
/signalmesh-test.html?icp=icp1
/signalmesh-test.html?icp=icp3&sector=s01
/signalmesh-test.html?icp=icp3&sector=s02&utm_source=email&vid=TEST-CIO-GEMEENTE
/signalmesh-test.html?icp=icp2&utm_source=partner&vid=CHUNK-WORKS-001
/signalmesh-test.html?icp=icp3&sector=s04&utm_source=linkedin&vid=CFO-RABOBANK&utm_campaign=dora-finance
```

## Stap 6 — DNS

Reeds ingesteld:
- `api.hes-consultancy-international.com` → `46.225.61.78`

Nog in te stellen:
- `n8n.hes-consultancy-international.com` → `46.225.61.78`

## Beheerhandleiding — Snel overzicht

### Sector toevoegen
1. Open `signalmesh.config.js`
2. Kopieer een `s0X` blok in `sectors`
3. Pas id, color, label, regulations, painChips, hero aan
4. Deploy → klaar

### ICP toevoegen
1. Open `signalmesh.config.js`
2. Kopieer een `icpX` blok in `icps`
3. Pas alle velden aan
4. Deploy → klaar

### Scoring aanpassen
1. Open `signalmesh.config.js` → `scoring` sectie
2. Pas punten per bron aan
3. Pas tier ranges aan
4. Deploy → klaar

**Gouden regel:** Raak NOOIT `signalmesh-engine.js` aan. Alles staat in `signalmesh.config.js`.
