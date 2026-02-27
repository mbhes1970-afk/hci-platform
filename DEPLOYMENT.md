# HCI Deployment — Live in 3 stappen

**Geschatte tijd: 15 minuten**

---

## Stap 1 — GitHub repo voorbereiden

1. Ga naar [github.com](https://github.com) → **New repository**
2. Naam: `hci-platform` (of naar keuze)
3. Visibility: **Private**
4. Klik **Create repository**
5. Sleep alle bestanden uit de ZIP naar de GitHub upload interface
   (of gebruik `git push` als je git lokaal hebt)

**Mapstructuur die GitHub moet zien:**
```
/
├── index.html                    ← intelligence homepage
├── hci-i18n.js                   ← 4 talen
├── hci-intelligence-core.js      ← scroll scoring engine
├── hci-api-client.js             ← proxy wrapper
├── hci-output-engine-v2.html     ← CMO→FMO generator
├── cra-quickscan-hci.html        ← bestaande tool
├── hci-cra-eu-entry.html         ← bestaande tool
├── netlify.toml                  ← Netlify configuratie
└── netlify/
    └── functions/
        └── claude-proxy.js       ← API proxy (server-side)
```

---

## Stap 2 — Netlify koppelen

1. Ga naar [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Kies GitHub → selecteer `hci-platform`
3. Build settings:
   - **Build command:** *(leeg laten)*
   - **Publish directory:** `.`
4. Klik **Deploy site**

Netlify deployt automatisch. URL wordt:
`https://[random-naam].netlify.app`

**Custom domain instellen (optioneel):**
- Netlify dashboard → **Domain management** → Add custom domain
- Voeg `hes-consultancy-international.com` toe
- Zet DNS CNAME → `[jouw-site].netlify.app`

---

## Stap 3 — Environment Variables instellen

In Netlify dashboard → **Site settings** → **Environment variables** → **Add variable**

| Variable | Waarde | Verplicht |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | ✅ Ja |
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/...` | ❌ Optioneel |

**ANTHROPIC_API_KEY ophalen:**
→ [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key

**SLACK_WEBHOOK_URL ophalen (voor Tier 1 alerts):**
→ Slack → Apps → Incoming Webhooks → Add webhook to channel

Na het toevoegen van variabelen: **Trigger deploy** → **Deploy site** (één keer opnieuw deployen zodat de functies de variabelen oppikken).

---

## Verificatie

Na deployment controleren:

**✅ Homepage werkt:**
```
https://jouw-site.netlify.app/
```
Verwacht: 5 secties, language switcher rechtsboven, progress dots rechts.

**✅ API proxy werkt:**
```
POST https://jouw-site.netlify.app/api/claude
Content-Type: application/json
{"action":"claude","messages":[{"role":"user","content":"Test"}]}
```
Verwacht: response van Claude (of 400 als messages leeg)

**✅ Output Engine werkt:**
```
https://jouw-site.netlify.app/hci-output-engine-v2.html?icp=gemeente&need=NIS2&org=TestGemeente&lang=nl
```
Verwacht: auto-generatie start na 400ms

---

## Bekende aandachtspunten

**CORS:** Vul je Netlify URL in `netlify/functions/claude-proxy.js` onder `ALLOWED_ORIGINS` als je een custom domain gebruikt.

**DE/FR talen:** Content staat klaar in `hci-i18n.js` maar bevat `TODO` placeholders. Vul in voor launch in DACH/België. Talen vallen intussen automatisch terug op NL.

**RB2B pixel:** Voor IP-identificatie voeg je de RB2B snippet toe aan `index.html` (gratis, 100 leads/month). Zie: [rb2b.com](https://rb2b.com)

**DealFlow Bridge:** De intelligence core stuurt al lead-events via BroadcastChannel. De DealFlow Dashboard (lokaal bestand) pikt deze op als het in hetzelfde browser-tabblad open staat. I4 (volledige DealFlow integratie) komt in de volgende sprint.

---

## Rollback

Als iets mis gaat: Netlify dashboard → **Deploys** → klik op vorige deploy → **Publish deploy**. Instant rollback, geen downtime.

---

*HES Consultancy International · hes-consultancy-international.com*
