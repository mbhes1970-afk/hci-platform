/**
 * ============================================================
 * HCI API CLIENT — v1.0
 * hci-api-client.js
 *
 * HES Consultancy International
 * hes-consultancy-international.com
 *
 * WHAT THIS IS:
 * Thin browser-side wrapper for all API calls.
 * Points to the Netlify proxy instead of Anthropic directly.
 * API key never in the browser.
 *
 * USAGE:
 *   <script src="hci-api-client.js"></script>
 *
 *   // Generate CMO→FMO document
 *   const result = await HCIAPI.claude({
 *     system: 'You are an expert...',
 *     messages: [{ role: 'user', content: 'Analyseer...' }]
 *   });
 *
 *   // Send Slack alert (Tier 1 lead)
 *   await HCIAPI.slack({ tier: 'tier1', score: 110, org: 'Gemeente Utrecht', icp: 'gemeente' });
 *
 * ERROR HANDLING:
 *   All methods return { ok: true, data } or { ok: false, error, status }
 *   Never throw — always safe to use without try/catch.
 * ============================================================
 */

(function(window) {
  'use strict';

  // Proxy endpoint — Netlify Function via friendly redirect
  var PROXY_URL  = '/api/claude';
  var SLACK_URL  = '/api/slack';

  // Default model — change here if upgrading
  var DEFAULT_MODEL = 'claude-opus-4-6';

  /**
   * Call Claude via the Netlify proxy.
   *
   * @param {Object} options
   * @param {string} options.system     - System prompt
   * @param {Array}  options.messages   - Messages array [{ role, content }]
   * @param {string} [options.model]    - Model override
   * @param {number} [options.max_tokens] - Token limit (default 4096)
   * @param {number} [options.temperature] - 0-1 (default 0.7)
   * @param {Function} [options.onStream] - Stream callback (future)
   *
   * @returns {Promise<{ok: boolean, data?: Object, text?: string, error?: string}>}
   */
  async function claude(options) {
    try {
      var payload = {
        action:      'claude',
        model:       options.model       || DEFAULT_MODEL,
        max_tokens:  options.max_tokens  || 4096,
        messages:    options.messages    || [],
        temperature: options.temperature !== undefined ? options.temperature : 0.7
      };
      if (options.system) {
        payload.system = options.system;
      }

      var response = await fetch(PROXY_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });

      var data = await response.json();

      if (!response.ok) {
        console.error('[HCI API] Claude error:', response.status, data);
        return {
          ok:     false,
          status: response.status,
          error:  data.details || data.error || 'API fout — probeer opnieuw'
        };
      }

      // Extract text from response
      var text = '';
      if (data.content && Array.isArray(data.content)) {
        text = data.content
          .filter(function(b) { return b.type === 'text'; })
          .map(function(b) { return b.text; })
          .join('');
      }

      return { ok: true, data: data, text: text };

    } catch (err) {
      console.error('[HCI API] Network error:', err.message);
      return {
        ok:    false,
        error: 'Netwerkfout — controleer uw verbinding',
        details: err.message
      };
    }
  }

  /**
   * Send Slack alert via the proxy.
   * Silent fail — if Slack is not configured, nothing breaks.
   *
   * @param {Object} options
   * @param {string} options.tier          - 'tier1' | 'hot' | 'warm'
   * @param {number} options.score         - Intent score
   * @param {string} [options.org]         - Organisation name
   * @param {string} [options.icp]         - ICP key
   * @param {string} [options.url]         - Page URL
   * @param {boolean} [options.returnVisitor]
   * @param {Object} [options.utm]
   */
  async function slack(options) {
    try {
      await fetch(SLACK_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(Object.assign({ action: 'slack' }, options))
      });
    } catch (err) {
      // Silent — Slack alerts are non-critical
    }
  }

  /**
   * Quick health check — verifies the proxy is reachable.
   * Call this on page load if you want to surface API issues early.
   *
   * @returns {Promise<boolean>}
   */
  async function ping() {
    try {
      var r = await fetch(PROXY_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'claude', messages: [] })
      });
      var d = await r.json();
      // A 400 "messages array is required" means proxy is alive and responding
      return r.status === 400 && d.error && d.error.includes('messages');
    } catch (e) {
      return false;
    }
  }

  /**
   * Generate a CMO→FMO document for a given ICP and need.
   * High-level convenience wrapper around claude().
   *
   * @param {Object} options
   * @param {string} options.icp    - ICP key (gemeente/ziekenhuis/software/euentry)
   * @param {string} options.need   - Primary challenge selected by user
   * @param {string} [options.naam] - Visitor name
   * @param {string} [options.org]  - Organisation name
   * @param {string} [options.rol]  - Role
   * @param {string} [options.lang] - Language (nl/en/de/fr)
   *
   * @returns {Promise<{ok: boolean, text?: string, error?: string}>}
   */
  async function generateCMOFMO(options) {
    var icp  = options.icp  || 'gemeente';
    var need = options.need || '';
    var lang = options.lang || 'nl';
    var org  = options.org  || 'Uw organisatie';
    var rol  = options.rol  || 'CISO';

    var systemPrompts = {
      gemeente: {
        nl: 'Je bent een senior strategisch adviseur bij HES Consultancy International met 30 jaar ervaring in digitale transformatie van Nederlandse gemeenten. Je expertise omvat NIS2, BIO v2, DPIA, digitale volwassenheid (PubliekIT framework) en bestuurlijke verantwoording. Je schrijft altijd in professioneel maar toegankelijk Nederlands, gericht op CISO\'s en directeuren bij gemeenten. Je output is concreet, met meetbare doelstellingen en een heldere CMO→FMO structuur.',
        en: 'You are a senior strategic advisor at HES Consultancy International with 30 years of experience in digital transformation for European municipal governments. Your expertise covers NIS2, security governance, digital maturity and board-level reporting. You write in professional English, targeting CISOs and directors at municipalities. Your output is concrete, with measurable objectives and a clear CMO→FMO structure.'
      },
      ziekenhuis: {
        nl: 'Je bent een senior strategisch adviseur bij HES Consultancy International met 30 jaar ervaring in digitale transformatie van Nederlandse zorgorganisaties. Je expertise omvat EU AI Act, NEN 7510:2, FHIR-integratie, EPD-selectie en ROI-verantwoording richting Raad van Bestuur. Je schrijft in professioneel Nederlands gericht op CMIO\'s, CIO\'s en directeuren in de zorg.',
        en: 'You are a senior strategic advisor at HES Consultancy International with 30 years of experience in digital transformation for European healthcare organisations. Your expertise covers EU AI Act, NEN 7510:2, FHIR integration, EHR selection and ROI justification to the Board. You write in professional English targeting CMIOs, CIOs and directors in healthcare.'
      },
      software: {
        nl: 'Je bent een senior strategisch adviseur bij HES Consultancy International met 30 jaar ervaring in digitale transformatie van Nederlandse softwarebedrijven. Je expertise omvat Cyber Resilience Act (CRA 2027), security-by-design, Happy Sprint methodiek, en EU-markt strategie voor Benelux/DACH. Je schrijft in professioneel Nederlands gericht op CEO\'s en CTO\'s van softwarebedrijven.',
        en: 'You are a senior strategic advisor at HES Consultancy International with 30 years of experience in digital transformation for European software companies. Your expertise covers the Cyber Resilience Act (CRA 2027), security-by-design, Happy Sprint methodology, and EU go-to-market strategy for Benelux/DACH. You write in professional English targeting CEOs and CTOs of software companies.'
      },
      euentry: {
        nl: 'Je bent een senior strategisch adviseur bij HES Consultancy International met 30 jaar ervaring in het begeleiden van internationale technologiebedrijven bij hun EU-expansie. Je expertise omvat EU GTM-strategie, GDPR-compliance, Benelux/DACH marktentree, en C-level netwerken in Europa. Je schrijft in professioneel Nederlands gericht op founders, CEO\'s en VP Sales van scale-ups die de EU-markt willen betreden.',
        en: 'You are a senior strategic advisor at HES Consultancy International with 30 years of experience guiding international technology companies in their EU expansion. Your expertise covers EU GTM strategy, GDPR compliance, Benelux/DACH market entry, and C-level networks in Europe. You write in professional English targeting founders, CEOs and VP Sales of scale-ups entering the EU market.'
      }
    };

    var userPrompts = {
      nl: `Genereer een gedetailleerde CMO→FMO analyse voor de volgende situatie:

**Organisatie:** ${org}
**Rol contactpersoon:** ${rol}
**Sector/ICP:** ${icp}
**Primaire uitdaging:** ${need}

Structureer de output als volgt:

## Situatieanalyse (CMO)
Beschrijf de huidige situatie in 3-4 concrete punten. Wees specifiek over wat er nu ontbreekt of niet werkt.

## Gewenste situatie (FMO)
Beschrijf het concreet gewenste eindresultaat in 3-4 meetbare doelstellingen. Geef aan wat "gereed" er uitziet.

## Kritieke gaps
Identificeer de 3 grootste kloven tussen CMO en FMO. Prioriteer op urgentie en impact.

## HCI Roadmap — 4 fasen
**Fase 1 — Analyse (4-6 weken):** Wat wordt gemeten/geanalyseerd
**Fase 2 — Ontwerp (6-8 weken):** Wat wordt ontworpen/gespecificeerd  
**Fase 3 — Implementatie (12-16 weken):** Wat wordt geïmplementeerd
**Fase 4 — Overdracht (4 weken):** Wat wordt overgedragen, wat staat er dan

## Relevante EU-regelgeving
Noem de 2-3 meest relevante regelgevingen voor deze specifieke situatie met concrete implicaties.

## Volgende stap
Één concrete, specifieke actie die ${org} morgen kan zetten. Maak het zo concreet mogelijk.

Schrijf in een directe, professionele stijl. Geen filler tekst. Elke zin moet waarde toevoegen.`,

      en: `Generate a detailed CMO→FMO analysis for the following situation:

**Organisation:** ${org}
**Contact role:** ${rol}
**Sector/ICP:** ${icp}
**Primary challenge:** ${need}

Structure the output as follows:

## Situation Analysis (CMO)
Describe the current state in 3-4 concrete points. Be specific about what is currently missing or not working.

## Desired State (FMO)
Describe the concrete desired end result in 3-4 measurable objectives. Define what "complete" looks like.

## Critical Gaps
Identify the 3 biggest gaps between CMO and FMO. Prioritise by urgency and impact.

## HCI Roadmap — 4 Phases
**Phase 1 — Analysis (4-6 weeks):** What is measured/analysed
**Phase 2 — Design (6-8 weeks):** What is designed/specified
**Phase 3 — Implementation (12-16 weeks):** What is implemented
**Phase 4 — Handover (4 weeks):** What is transferred, what is operational

## Relevant EU Regulation
Name the 2-3 most relevant regulations for this specific situation with concrete implications.

## Next Step
One concrete, specific action that ${org} can take tomorrow. Make it as specific as possible.

Write in a direct, professional style. No filler text. Every sentence must add value.`
    };

    var systemLang = (lang === 'en') ? 'en' : 'nl';
    var system     = (systemPrompts[icp] || systemPrompts.gemeente)[systemLang];
    var userPrompt = (lang === 'en') ? userPrompts.en : userPrompts.nl;

    return await claude({
      system:   system,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.6,
      max_tokens: 3000
    });
  }

  // ============================================================
  // EXPOSE
  // ============================================================
  window.HCIAPI = {
    claude:        claude,
    slack:         slack,
    ping:          ping,
    generateCMOFMO: generateCMOFMO,
    PROXY_URL:     PROXY_URL
  };

})(window);
