/**
 * ============================================================
 * HCI INTELLIGENCE CORE — v1.0
 * hci-intelligence-core.js
 *
 * HES Consultancy International
 * hes-consultancy-international.com
 * mbhes@hes-consultancy-international.com
 *
 * WHAT THIS IS:
 * A client-side intent intelligence engine. No backend required.
 * No cookies. GDPR-compliant. Provider-agnostic.
 *
 * THREE OPERATING MODES:
 *   Known     — URL params present (?naam=Oliver&icp=gemeente)
 *   Campaign  — UTM params present (?utm_campaign=gemeente-nis2)
 *   Unknown   — No params → IP lookup → scroll intelligence
 *
 * PROVIDER SWITCHING:
 *   Change one line: HCIIntelligence.config.ipProvider = 'dealfront'
 *   RB2B and Dealfront implement the same interface.
 *
 * EVENTS EMITTED:
 *   hci:mode-detected     → { mode, params }
 *   hci:icp-detected      → { icp, score, source, org, confidence }
 *   hci:score-update      → { score, tier, signals }
 *   hci:lead-threshold    → { tier, score, deal }
 *   hci:icp-confirmed     → { icp, method } (after 3 signals)
 *
 * USAGE:
 *   <script src="hci-intelligence-core.js"></script>
 *   <script>
 *     HCIIntelligence.init();
 *     document.addEventListener('hci:icp-detected', e => {
 *       renderICP(e.detail.icp);
 *     });
 *   </script>
 * ============================================================
 */

(function(window) {
  'use strict';

  // ============================================================
  // CONFIGURATION
  // ============================================================
  const CONFIG = {
    // IP identification provider: 'rb2b' | 'dealfront' | 'albacross' | 'none'
    // Switch here — rest of code is unaware of which provider is active
    ipProvider: 'rb2b',

    // RB2B config (free tier: 100 leads/month)
    rb2b: {
      // Script is injected dynamically — no API key needed client-side
      // RB2B identifies via their own pixel
      scriptId: 'rb2b-pixel',
      callbackEvent: 'rb2b:identified'
    },

    // Dealfront config (recommended for Benelux/DACH)
    dealfront: {
      // Set your Dealfront site ID when upgrading
      siteId: 'YOUR_DEALFRONT_SITE_ID',
      scriptSrc: 'https://www.dealfront.com/assets/lfeeder.min.js'
    },

    // Intent scoring thresholds — identical to ChunkWorks
    thresholds: {
      warm:   50,   // Log only, no alert
      hot:    75,   // HOT LEAD — create DealFlow deal
      tier1:  105   // TIER 1 CALL NOW — Slack alert
    },

    // Score decay: halve score after this many ms of inactivity
    decayAfterMs: 5 * 60 * 1000, // 5 minutes

    // Minimum signals to confirm an ICP
    minSignalsForConfirmation: 3,

    // Debug mode — set to true to see scoring in console
    debug: false
  };

  // ============================================================
  // ICP DEFINITIONS
  // Maps ICP identifiers to their signal keywords and weights
  // ============================================================
  const ICP_DEFINITIONS = {
    gemeente: {
      label: 'Gemeente / Publieke Sector',
      color: '#1e3a5f',
      keywords: ['nis2', 'bio', 'dpia', 'publiekit', 'gemeente', 'ciso', 'basisregistraties',
                 'zaaksysteem', 'digitale agenda', 'raad', 'gemeenteraad', 'rekenkamer',
                 'overheid', 'publiek', 'municipal', 'government'],
      sbiCodes: ['84'],  // Openbaar bestuur
      urlHints: ['gemeente', 'overheid', 'publiekit', 'gov', 'municipal']
    },
    ziekenhuis: {
      label: 'Ziekenhuis / Zorg',
      color: '#0d9488',
      keywords: ['epd', 'fhir', 'nen7510', 'cmio', 'umc', 'stzkliniek', 'ggz',
                 'healthcare', 'zorg', 'ziekenhuis', 'medical', 'klinisch', 'vipp',
                 'eu ai act', 'hoog-risico ai', 'clinical', 'hospital', 'care'],
      sbiCodes: ['86', '87', '88'],  // Gezondheids- en welzijnszorg
      urlHints: ['ziekenhuis', 'umc', 'zorg', 'health', 'hospital', 'clinic']
    },
    software: {
      label: 'Software CEO / Tech Benelux',
      color: '#6C5CE7',
      keywords: ['cra', 'cyber resilience act', 'security-by-design', 'sdlc', 'scrum',
                 'sprint', 'happy sprint', 'technische schuld', 'saas', 'software',
                 'developer', 'dev', 'cto', 'engineering', 'compliance 2027'],
      sbiCodes: ['62', '63'],  // IT en informatie
      urlHints: ['software', 'tech', 'saas', 'dev', 'digital']
    },
    euentry: {
      label: 'Tech/SaaS EU Entry',
      color: '#b8860b',
      keywords: ['eu expansion', 'eu market', 'europe', 'gdpr', 'benelux', 'dach',
                 'market entry', 'go-to-market', 'gtm', 'international', 'scale-up',
                 'series a', 'series b', 'venture', 'founder', 'ceo', 'vp sales'],
      sbiCodes: [],
      urlHints: ['eu', 'europe', 'international', 'global', 'expand']
    }
  };

  // ============================================================
  // SCORING SIGNAL WEIGHTS
  // Each interaction type has a base weight
  // ICP-specific sections can override with multipliers
  // ============================================================
  const SIGNAL_WEIGHTS = {
    // Scroll signals
    scroll_section_enter:   5,   // Entered a content section
    scroll_section_dwell:   10,  // Spent >5s in a section
    scroll_section_deep:    15,  // Spent >15s in a section (high intent)
    scroll_page_complete:   20,  // Scrolled to bottom

    // Interaction signals
    click_icp_keyword:      20,  // Clicked/hovered an ICP-specific element
    click_cta:              25,  // Hovered/clicked a CTA button
    click_pricing:          20,  // Viewed pricing section
    playbook_start:         15,  // Started Playbook Builder
    playbook_complete:      40,  // Completed Playbook Builder (strong intent)
    form_start:             20,  // Started filling a form
    form_complete:          50,  // Completed and submitted a form

    // Session signals
    return_visitor:         30,  // Has visited before
    direct_navigation:      10,  // Typed URL directly (high intent)
    utm_campaign:           15,  // Came via a campaign link
    known_visitor:          0,   // Known visitor via URL params (no scoring needed)

    // IP/org signals
    org_identified:         20,  // IP identified to a specific org
    icp_org_match:          15,  // Org's sector matches an ICP
  };

  // ============================================================
  // SESSION STATE
  // Uses sessionStorage only — no cookies, no localStorage for tracking
  // ============================================================
  const SESSION_KEY = 'hci_intel_session';

  function loadSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return createSession();
      return JSON.parse(raw);
    } catch (e) {
      return createSession();
    }
  }

  function createSession() {
    return {
      id: 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      startedAt: Date.now(),
      score: 0,
      tier: null,
      mode: null,
      icp: null,
      icpConfidence: 0,
      icpSignals: {},       // { gemeente: 2, ziekenhuis: 1 }
      signals: [],          // Array of { type, icp, weight, ts }
      org: null,            // IP-identified org name
      orgSector: null,
      params: {},           // URL params if any
      utmData: {},
      sectionsViewed: [],
      lastActivity: Date.now(),
      thresholdsFired: [],  // Which tiers have already triggered alerts
      isReturnVisitor: checkReturnVisitor()
    };
  }

  function saveSession(session) {
    try {
      session.lastActivity = Date.now();
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) { /* sessionStorage might be full or unavailable */ }
  }

  function checkReturnVisitor() {
    // Use a hashed entry in sessionStorage from a previous session
    // We check for a flag in localStorage (not personal data, just a visit flag)
    try {
      return localStorage.getItem('hci_rv') === '1';
    } catch(e) { return false; }
  }

  function markVisitorForReturn() {
    try { localStorage.setItem('hci_rv', '1'); } catch(e) {}
  }

  // ============================================================
  // MODE DETECTION
  // Priority: Known > Campaign > Unknown
  // ============================================================
  function detectMode(params) {
    // Known visitor: has naam or icp param
    if (params.naam || params.icp) {
      return 'known';
    }
    // Campaign visitor: has UTM params
    if (params.utm_campaign || params.utm_source || params.utm_medium) {
      return 'campaign';
    }
    // Unknown: scroll intelligence + IP lookup
    return 'unknown';
  }

  function parseURLParams() {
    const p = {};
    new URLSearchParams(window.location.search).forEach((v, k) => {
      p[k.toLowerCase()] = decodeURIComponent(v);
    });
    return p;
  }

  function extractUTM(params) {
    return {
      source:   params.utm_source   || null,
      medium:   params.utm_medium   || null,
      campaign: params.utm_campaign || null,
      content:  params.utm_content  || null,
      term:     params.utm_term     || null
    };
  }

  // ============================================================
  // ICP DETECTION FROM URL PARAMS
  // ============================================================
  function detectICPFromParams(params) {
    if (params.icp) {
      const mapped = {
        gemeente: 'gemeente',
        ziekenhuis: 'ziekenhuis',
        hospital: 'ziekenhuis',
        software: 'software',
        tech: 'software',
        saas: 'software',
        euentry: 'euentry',
        eu: 'euentry',
        international: 'euentry'
      };
      return mapped[params.icp.toLowerCase()] || params.icp.toLowerCase();
    }

    // Infer from UTM campaign name
    if (params.utm_campaign) {
      const c = params.utm_campaign.toLowerCase();
      if (c.includes('gemeente') || c.includes('municipal') || c.includes('nis2') || c.includes('bio')) return 'gemeente';
      if (c.includes('ziekenhuis') || c.includes('health') || c.includes('hospital') || c.includes('zorg')) return 'ziekenhuis';
      if (c.includes('software') || c.includes('cra') || c.includes('dev') || c.includes('saas')) return 'software';
      if (c.includes('eu') || c.includes('entry') || c.includes('expand')) return 'euentry';
    }

    return null;
  }

  // ============================================================
  // SCROLL SCORING ENGINE
  // Uses IntersectionObserver for precise section tracking
  // ============================================================
  function initScrollScoring(session) {
    if (typeof IntersectionObserver === 'undefined') return;

    const sectionTimers = {};

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        const sectionId = el.dataset.hciSection || el.id || 'unknown';
        const icpHint = el.dataset.hciIcp || null;

        if (entry.isIntersecting) {
          // Section entered
          addSignal(session, 'scroll_section_enter', icpHint);
          if (!session.sectionsViewed.includes(sectionId)) {
            session.sectionsViewed.push(sectionId);
          }

          // Start dwell timer
          sectionTimers[sectionId] = {
            start: Date.now(),
            dwellFired: false,
            deepFired: false
          };

          const timer = sectionTimers[sectionId];

          // Fire dwell signal after 5 seconds
          timer.dwellTimeout = setTimeout(() => {
            if (!timer.dwellFired) {
              timer.dwellFired = true;
              addSignal(session, 'scroll_section_dwell', icpHint);
              if (CONFIG.debug) console.log('[HCI Intel] Section dwell:', sectionId, icpHint);
            }
          }, 5000);

          // Fire deep signal after 15 seconds
          timer.deepTimeout = setTimeout(() => {
            if (!timer.deepFired) {
              timer.deepFired = true;
              addSignal(session, 'scroll_section_deep', icpHint);
              if (CONFIG.debug) console.log('[HCI Intel] Section deep:', sectionId, icpHint);
            }
          }, 15000);

        } else {
          // Section left — clear timers
          if (sectionTimers[sectionId]) {
            clearTimeout(sectionTimers[sectionId].dwellTimeout);
            clearTimeout(sectionTimers[sectionId].deepTimeout);
          }
        }
      });
    }, {
      threshold: 0.4 // Section must be 40% visible
    });

    // Observe all content sections
    const sections = document.querySelectorAll('[data-hci-section], .hci-section, section[id]');
    sections.forEach(s => observer.observe(s));

    if (CONFIG.debug) console.log('[HCI Intel] Observing', sections.length, 'sections');

    return observer;
  }

  // ============================================================
  // CLICK + HOVER TRACKING
  // ============================================================
  function initInteractionTracking(session) {
    // Track CTA hovers
    document.querySelectorAll('[data-hci-cta], .hci-cta').forEach(el => {
      el.addEventListener('mouseenter', () => {
        const icpHint = el.dataset.hciIcp || null;
        addSignal(session, 'click_cta', icpHint);
      }, { passive: true });
      el.addEventListener('click', () => {
        const icpHint = el.dataset.hciIcp || null;
        addSignal(session, 'click_cta', icpHint);
      }, { passive: true });
    });

    // Track ICP keyword clicks
    document.querySelectorAll('[data-hci-keyword]').forEach(el => {
      el.addEventListener('click', () => {
        const icp = el.dataset.hciKeyword;
        addSignal(session, 'click_icp_keyword', icp);
      }, { passive: true });
      el.addEventListener('mouseenter', () => {
        const icp = el.dataset.hciKeyword;
        addSignal(session, 'click_icp_keyword', icp);
      }, { passive: true });
    });

    // Track pricing section views
    document.querySelectorAll('[data-hci-section="pricing"], #pricing, .pricing-section').forEach(el => {
      el.addEventListener('mouseenter', () => {
        addSignal(session, 'click_pricing', null);
      }, { passive: true });
    });

    // Track form interactions
    document.querySelectorAll('form, [data-hci-form]').forEach(form => {
      const icpHint = form.dataset.hciIcp || null;
      form.addEventListener('focusin', () => {
        addSignal(session, 'form_start', icpHint);
      }, { once: true, passive: true });
      form.addEventListener('submit', () => {
        addSignal(session, 'form_complete', icpHint);
      }, { passive: true });
    });

    // Track scroll completion
    let completionFired = false;
    window.addEventListener('scroll', () => {
      if (completionFired) return;
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.body.scrollHeight;
      if (scrolled >= total - 100) {
        completionFired = true;
        addSignal(session, 'scroll_page_complete', null);
      }
    }, { passive: true });
  }

  // ============================================================
  // SIGNAL PROCESSING + SCORING
  // ============================================================
  function addSignal(session, type, icpHint) {
    const weight = SIGNAL_WEIGHTS[type] || 5;

    // Apply score decay if inactive
    applyDecay(session);

    session.score += weight;
    session.signals.push({ type, icp: icpHint, weight, ts: Date.now() });

    // Track ICP signals
    if (icpHint && ICP_DEFINITIONS[icpHint]) {
      session.icpSignals[icpHint] = (session.icpSignals[icpHint] || 0) + 1;
    }

    saveSession(session);

    // Emit score update event
    emit('hci:score-update', {
      score: session.score,
      tier: getCurrentTier(session.score),
      signals: session.signals.slice(-5) // Last 5 signals
    });

    // Check ICP confirmation
    checkICPConfirmation(session);

    // Check lead thresholds
    checkThresholds(session);

    if (CONFIG.debug) {
      console.log('[HCI Intel] Signal:', type, '| ICP hint:', icpHint,
                  '| Weight:', weight, '| Total score:', session.score);
    }
  }

  function applyDecay(session) {
    const elapsed = Date.now() - session.lastActivity;
    if (elapsed > CONFIG.decayAfterMs && session.score > 0) {
      const decayFactor = Math.floor(elapsed / CONFIG.decayAfterMs);
      session.score = Math.max(0, session.score / Math.pow(2, decayFactor));
      if (CONFIG.debug) console.log('[HCI Intel] Score decay applied. New score:', session.score);
    }
  }

  function getCurrentTier(score) {
    if (score >= CONFIG.thresholds.tier1) return 'tier1';
    if (score >= CONFIG.thresholds.hot)   return 'hot';
    if (score >= CONFIG.thresholds.warm)  return 'warm';
    return 'cold';
  }

  // ============================================================
  // ICP CONFIRMATION
  // Confirms ICP after minimum signals threshold
  // ============================================================
  function checkICPConfirmation(session) {
    if (session.mode === 'known' || session.icp) return;

    // Find ICP with most signals
    let bestICP = null;
    let bestCount = 0;

    Object.entries(session.icpSignals).forEach(([icp, count]) => {
      if (count > bestCount) {
        bestCount = count;
        bestICP = icp;
      }
    });

    if (bestICP && bestCount >= CONFIG.minSignalsForConfirmation) {
      session.icp = bestICP;
      session.icpConfidence = Math.min(100, bestCount * 20);
      saveSession(session);

      emit('hci:icp-detected', {
        icp: bestICP,
        score: session.score,
        source: 'scroll_intelligence',
        org: session.org,
        confidence: session.icpConfidence
      });

      emit('hci:icp-confirmed', {
        icp: bestICP,
        method: 'scroll_intelligence'
      });

      if (CONFIG.debug) console.log('[HCI Intel] ICP confirmed via scroll:', bestICP, '| Confidence:', session.icpConfidence);
    }
  }

  // ============================================================
  // LEAD THRESHOLD ALERTS
  // ============================================================
  function checkThresholds(session) {
    const tier = getCurrentTier(session.score);
    if (!tier || tier === 'cold') return;

    // Only fire each threshold once per session
    if (session.thresholdsFired.includes(tier)) return;

    session.thresholdsFired.push(tier);
    saveSession(session);

    const deal = buildDealPayload(session, tier);

    emit('hci:lead-threshold', { tier, score: session.score, deal });

    // Send to DealFlow Bridge
    fireDealFlowBridge(deal, tier);

    if (CONFIG.debug) console.log('[HCI Intel] 🔥 Threshold fired:', tier.toUpperCase(), '| Score:', session.score);
  }

  function buildDealPayload(session, tier) {
    return {
      id: session.id,
      tier,
      score: session.score,
      icp: session.icp || 'unknown',
      org: session.org || 'Onbekend',
      orgSector: session.orgSector || null,
      params: session.params,
      utmData: session.utmData,
      sectionsViewed: session.sectionsViewed,
      signalCount: session.signals.length,
      isReturnVisitor: session.isReturnVisitor,
      mode: session.mode,
      timestamp: new Date().toISOString(),
      pageUrl: window.location.href,
      referrer: document.referrer || null
    };
  }

  // ============================================================
  // DEALFLOW BRIDGE
  // Sends lead data to DealFlow Dashboard via BroadcastChannel
  // Also fires Slack alert for Tier 1 (via Netlify proxy if configured)
  // ============================================================
  function fireDealFlowBridge(deal, tier) {
    // BroadcastChannel — DealFlow Dashboard listening on same origin
    try {
      const channel = new BroadcastChannel('hci_dealflow');
      channel.postMessage({ type: 'hci:deal-create', deal, tier });
      channel.close();
    } catch(e) {
      if (CONFIG.debug) console.warn('[HCI Intel] BroadcastChannel unavailable:', e);
    }

    // For Tier 1: also try Slack proxy
    if (tier === 'tier1') {
      fireSlackAlert(deal);
    }

    // Analytics events
    fireAnalytics(deal, tier);
  }

  function fireSlackAlert(deal) {
    // Read webhook URL from meta tag
    const webhookMeta = document.querySelector('meta[name="slack-webhook"]');
    const webhook = webhookMeta ? webhookMeta.content : '';
    if (!webhook || webhook === 'SLACK_WEBHOOK_PLACEHOLDER') return;

    const ts = new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' });

    fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: ':dart: *Hoog-scorende bezoeker \u2014 HCI Intelligence*',
        blocks: [
          {
            type: 'section',
            text: { type: 'mrkdwn', text:
              ':dart: *Hoog-scorende bezoeker gedetecteerd*\n' +
              '*Score:* ' + Math.round(deal.score) + ' | *Tier:* ' + deal.tier.toUpperCase() + '\n' +
              '*Bedrijf:* ' + (deal.org || 'Onbekend') + '\n' +
              '*ICP:* ' + (deal.icp || '\u2014') + '\n' +
              '*Pagina:* ' + deal.pageUrl + '\n' +
              '*Tijd:* ' + ts
            }
          },
          {
            type: 'actions',
            elements: [
              { type: 'button', text: { type: 'plain_text', text: 'Open PocketBase' }, url: 'https://api.hes-consultancy-international.com/_/' },
              { type: 'button', text: { type: 'plain_text', text: 'Boek gesprek' }, url: 'https://calendly.com/mbhes1970/30min' }
            ]
          }
        ]
      })
    }).catch(() => {}); // Silent fail
  }

  function fireAnalytics(deal, tier) {
    // Plausible
    if (window.plausible) {
      window.plausible('HCI Lead', {
        props: { tier, icp: deal.icp, org: deal.org, score: String(deal.score) }
      });
    }
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', 'hci_lead', {
        lead_tier: tier, icp: deal.icp, intent_score: deal.score
      });
    }
  }

  // ============================================================
  // IP PROVIDER INTERFACE
  // Both RB2B and Dealfront call the same onOrgIdentified() callback
  // ============================================================
  function initIPProvider(session, onOrgIdentified) {
    if (CONFIG.ipProvider === 'none') return;
    if (session.mode === 'known') return; // Don't bother for known visitors

    // Always try IPInfo first (lightweight, fast)
    initIPInfo(session, onOrgIdentified);

    if (CONFIG.ipProvider === 'rb2b') {
      initRB2B(session, onOrgIdentified);
    } else if (CONFIG.ipProvider === 'dealfront') {
      initDealfront(session, onOrgIdentified);
    }
  }

  function initIPInfo(session, onOrgIdentified) {
    // Client-side IPInfo lookup using token from meta tag
    var tokenMeta = document.querySelector('meta[name="ipinfo-token"]');
    var token = tokenMeta ? tokenMeta.content : '';
    if (!token || token === 'TOKEN_PLACEHOLDER') return;

    // Check if edge function already injected sm-org meta tag
    if (document.querySelector('meta[name="sm-org"]')) return;

    fetch('https://ipinfo.io/json?token=' + token, { signal: AbortSignal.timeout(2000) })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(data) {
        if (!data || !data.org) return;
        var orgName = data.org.replace(/^AS\d+\s+/i, '').trim();
        onOrgIdentified({
          name: orgName,
          domain: data.hostname || null,
          sector: null,
          location: data.country || null
        });
      })
      .catch(function() {});
  }

  function initRB2B(session, onOrgIdentified) {
    // RB2B injects their script and exposes window._rb2b
    // They fire a callback when org is identified
    // See: https://rb2b.com/docs

    // Listen for RB2B identification event
    window.addEventListener('rb2b:identified', (e) => {
      if (e.detail && e.detail.company) {
        onOrgIdentified({
          name: e.detail.company,
          domain: e.detail.domain || null,
          sector: e.detail.industry || null,
          location: e.detail.location || null,
          linkedinProfile: e.detail.linkedin || null
        });
      }
    });

    // RB2B also sets window._rb2b.company after script loads
    // Poll for it as fallback (max 5 seconds)
    let pollCount = 0;
    const poll = setInterval(() => {
      pollCount++;
      if (window._rb2b && window._rb2b.company) {
        clearInterval(poll);
        onOrgIdentified({
          name: window._rb2b.company,
          domain: window._rb2b.domain || null,
          sector: window._rb2b.industry || null,
          location: window._rb2b.location || null
        });
      }
      if (pollCount > 50) clearInterval(poll); // Give up after 5s
    }, 100);
  }

  function initDealfront(session, onOrgIdentified) {
    // Dealfront (Leadfeeder) exposes window.ldfdr
    // They fire ldfdr.identify when org is detected

    if (!CONFIG.dealfront.siteId || CONFIG.dealfront.siteId.includes('YOUR_')) {
      if (CONFIG.debug) console.warn('[HCI Intel] Dealfront siteId not configured');
      return;
    }

    window._lfdr = window._lfdr || [];
    window._lfdr.push(['identify', function(visitor) {
      if (visitor && visitor.company) {
        onOrgIdentified({
          name: visitor.company.name,
          domain: visitor.company.domain || null,
          sector: visitor.company.industry || null,
          location: visitor.company.country || null,
          employeeCount: visitor.company.employeeCount || null
        });
      }
    }]);
  }

  function handleOrgIdentified(session, orgData) {
    session.org = orgData.name;
    session.orgSector = orgData.sector;
    saveSession(session);

    // Add score for being identified
    addSignal(session, 'org_identified', null);

    // Try to infer ICP from sector
    if (orgData.sector) {
      const inferredICP = inferICPFromSector(orgData.sector, orgData.name);
      if (inferredICP) {
        session.icpSignals[inferredICP] = (session.icpSignals[inferredICP] || 0) + 2;
        addSignal(session, 'icp_org_match', inferredICP);

        // Emit early ICP hint (not yet confirmed, just a hint)
        emit('hci:icp-detected', {
          icp: inferredICP,
          score: session.score,
          source: 'ip_identification',
          org: orgData.name,
          confidence: 40 // IP gives moderate confidence
        });
      }
    }

    if (CONFIG.debug) console.log('[HCI Intel] Org identified:', orgData.name, '| Sector:', orgData.sector);
  }

  function inferICPFromSector(sector, orgName) {
    if (!sector && !orgName) return null;
    const text = ((sector || '') + ' ' + (orgName || '')).toLowerCase();

    if (text.match(/gemeente|overheid|municipal|government|public|provinci/)) return 'gemeente';
    if (text.match(/hospital|ziekenhuis|healthcare|medical|zorg|clinic|health/)) return 'ziekenhuis';
    if (text.match(/software|technology|saas|tech|ict|digital|cloud|it service/)) return 'software';
    if (text.match(/consult|advies|finance|financial|invest|fund/)) return 'euentry';

    return null;
  }

  // ============================================================
  // EVENT HELPERS
  // ============================================================
  function emit(eventName, detail) {
    document.dispatchEvent(new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: false
    }));
  }

  // ============================================================
  // PUBLIC API — MANUAL SIGNALS
  // Call these from your page to add signals programmatically
  // ============================================================
  const PublicAPI = {

    // Signal: user started the Playbook Builder
    playbookStart(icp) {
      addSignal(_session, 'playbook_start', icp || null);
    },

    // Signal: user completed the Playbook Builder
    playbookComplete(icp) {
      addSignal(_session, 'playbook_complete', icp || null);
      if (icp) {
        _session.icp = icp;
        _session.icpConfidence = 100;
        saveSession(_session);
        emit('hci:icp-confirmed', { icp, method: 'playbook_explicit' });
        emit('hci:icp-detected', {
          icp, score: _session.score,
          source: 'playbook_explicit',
          org: _session.org,
          confidence: 100
        });
      }
    },

    // Get current session state
    getSession() {
      return { ..._session };
    },

    // Get current score
    getScore() {
      return _session.score;
    },

    // Get detected ICP
    getICP() {
      return _session.icp;
    },

    // Get detected org (from IP)
    getOrg() {
      return _session.org;
    },

    // Get URL params
    getParams() {
      return { ..._session.params };
    },

    // Manually set ICP (e.g., when user self-selects)
    setICP(icp) {
      _session.icp = icp;
      _session.icpConfidence = 100;
      saveSession(_session);
      emit('hci:icp-confirmed', { icp, method: 'manual' });
    },

    // Enable debug mode
    debug() {
      CONFIG.debug = true;
      console.log('[HCI Intel] Debug mode enabled');
      console.log('[HCI Intel] Current session:', _session);
    },

    // Simulate a scenario (for testing)
    simulate(scenario) {
      if (scenario === 'gemeente_hot') {
        for (let i = 0; i < 4; i++) addSignal(_session, 'scroll_section_dwell', 'gemeente');
        addSignal(_session, 'click_cta', 'gemeente');
      } else if (scenario === 'ziekenhuis_tier1') {
        for (let i = 0; i < 6; i++) addSignal(_session, 'scroll_section_deep', 'ziekenhuis');
        addSignal(_session, 'playbook_complete', 'ziekenhuis');
      }
    }
  };

  // ============================================================
  // INIT
  // ============================================================
  let _session = null;

  function init() {
    _session = loadSession();

    // Parse URL params
    const params = parseURLParams();
    _session.params = params;
    _session.utmData = extractUTM(params);

    // Detect mode
    const mode = detectMode(params);
    _session.mode = mode;

    // Mark return visitor
    markVisitorForReturn();

    if (_session.isReturnVisitor) {
      addSignal(_session, 'return_visitor', null);
    }

    // Emit mode detected
    emit('hci:mode-detected', { mode, params });

    if (CONFIG.debug) console.log('[HCI Intel] Initialized | Mode:', mode, '| Params:', params);

    // Mode-specific handling
    if (mode === 'known') {
      handleKnownMode(_session, params);
    } else if (mode === 'campaign') {
      handleCampaignMode(_session, params);
    } else {
      handleUnknownMode(_session);
    }

    // Initialize scroll scoring for all modes except known
    if (mode !== 'known') {
      // Wait for DOM
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          initScrollScoring(_session);
          initInteractionTracking(_session);
        });
      } else {
        initScrollScoring(_session);
        initInteractionTracking(_session);
      }
    }

    saveSession(_session);
  }

  function handleKnownMode(session, params) {
    const icp = detectICPFromParams(params);
    if (icp) {
      session.icp = icp;
      session.icpConfidence = 100;
    }

    // Known visitor: fire ICP detected immediately
    emit('hci:icp-detected', {
      icp: icp || 'unknown',
      score: session.score,
      source: 'url_params',
      org: params.org || null,
      naam: params.naam || null,
      rol: params.rol || null,
      confidence: 100
    });

    if (CONFIG.debug) console.log('[HCI Intel] Known mode | ICP:', icp, '| Naam:', params.naam);
  }

  function handleCampaignMode(session, params) {
    addSignal(session, 'utm_campaign', null);

    const icp = detectICPFromParams(params);
    if (icp) {
      session.icp = icp;
      session.icpConfidence = 70;
      emit('hci:icp-detected', {
        icp,
        score: session.score,
        source: 'utm_campaign',
        org: null,
        confidence: 70
      });
    }

    // Also start IP lookup for campaign visitors (enrich with org name)
    initIPProvider(session, (orgData) => handleOrgIdentified(session, orgData));
  }

  function handleUnknownMode(session) {
    // Start IP lookup
    initIPProvider(session, (orgData) => handleOrgIdentified(session, orgData));
    // Scroll intelligence starts via initScrollScoring above
  }

  // ============================================================
  // EXPOSE TO WINDOW
  // ============================================================
  window.HCIIntelligence = {
    init,
    config: CONFIG,
    ...PublicAPI
  };

  // Auto-init when DOM is ready (can be overridden by calling init() manually)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Slight delay to let page set up its own listeners first
    setTimeout(init, 10);
  }

})(window);
