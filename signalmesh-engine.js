/**
 * SignalMesh v2 — Engine (met IP Intelligence, Dwell, Scroll, Consent)
 * ─────────────────────────────────────────────────────────────
 * NIET AANPASSEN — Alle configuratie staat in signalmesh.config.js
 * ─────────────────────────────────────────────────────────────
 */
(function() {
  'use strict';

  var cfg = window.SignalMeshConfig;
  if (!cfg) { console.warn('[SignalMesh] Config niet gevonden'); return; }

  var d = document;
  var w = window;

  // ── STATE ─────────────────────────────────────────
  var state = {
    icp: null, sector: null, vid: null,
    utm_source: null, utm_campaign: null, utm_medium: null,
    fit: 0, intent: 0, total: 0, tier: 'cold',
    visitCount: 1, returning: false,
    lang: 'nl',
    // IP Intelligence (Upgrade A)
    ipOrg: null, ipCity: null, ipCountry: null,
    // Consent
    consent: null,
  };

  // Track whether sector was set from IP hint (to avoid double-counting)
  var _sectorFromIP = false;

  function log(msg) {
    if (cfg.global.debug) console.log('[SignalMesh] ' + msg);
  }

  // ── SCORING HELPERS ───────────────────────────────
  function addFit(points) {
    state.fit += points;
    state.total = state.fit + state.intent;
    recalcTier();
  }

  function addIntent(points) {
    state.intent += points;
    state.total = state.fit + state.intent;
    recalcTier();
    initWidget();
    saveSession();
  }

  function recalcTier() {
    var sc = cfg.scoring;
    for (var tier in sc.tiers) {
      var range = sc.tiers[tier];
      if (state.total >= range.min && state.total <= range.max) {
        state.tier = tier;
        break;
      }
    }
  }

  // ── UPGRADE A: IP INTELLIGENCE HINT ───────────────
  function readIPHint() {
    var orgMeta     = d.querySelector('meta[name="sm-org"]');
    var cityMeta    = d.querySelector('meta[name="sm-city"]');
    var countryMeta = d.querySelector('meta[name="sm-country"]');
    var sectorMeta  = d.querySelector('meta[name="sm-sector-hint"]');

    if (orgMeta && orgMeta.content) {
      state.ipOrg = decodeURIComponent(orgMeta.content);
      log('IP Org: ' + state.ipOrg);
      if (state.ipOrg && state.ipOrg.length > 2) addFit(8);
    }

    if (!state.sector && sectorMeta && sectorMeta.content && cfg.sectors[sectorMeta.content]) {
      state.sector = sectorMeta.content;
      _sectorFromIP = true;
      addFit(12);
      log('Sector pre-set from IP: ' + state.sector);
    }

    if (cityMeta && cityMeta.content) state.ipCity = cityMeta.content;
    if (countryMeta && countryMeta.content) state.ipCountry = countryMeta.content;
  }

  // ── URL PARAMS LEZEN ──────────────────────────────
  var _urlParams = null;
  function parseParams() {
    var p = new URLSearchParams(w.location.search);
    _urlParams = p;

    if (p.get('icp'))          state.icp = p.get('icp');
    if (p.get('sector'))     { state.sector = p.get('sector'); _sectorFromIP = false; }
    if (p.get('vid'))          state.vid = p.get('vid');
    if (p.get('utm_source'))   state.utm_source = p.get('utm_source');
    if (p.get('utm_campaign')) state.utm_campaign = p.get('utm_campaign');
    if (p.get('utm_medium'))   state.utm_medium = p.get('utm_medium');

    // Taal via URL param (hoogste prioriteit)
    var langParam = p.get('lang');
    if (langParam) {
      state.lang = langParam === 'en' ? 'en' : 'nl';
    }

    // Schoon URL na lezen
    if (p.toString()) {
      w.history.replaceState({}, d.title, w.location.pathname);
    }
  }

  // ── UPGRADE B: LANGUAGE DETECTION ─────────────────
  function detectLanguage() {
    // URL param already handled — skip if set
    if (_urlParams && _urlParams.get('lang')) return;

    var navLang = (navigator.language || navigator.userLanguage || 'nl').slice(0, 2).toLowerCase();
    if (navLang === 'nl' || navLang === 'en') {
      state.lang = navLang;
      log('Lang from browser: ' + state.lang);
    }
  }

  // ── SESSION ───────────────────────────────────────
  function loadSession() {
    try {
      var raw = sessionStorage.getItem(cfg.global.sessionKey);
      if (raw) {
        var sess = JSON.parse(raw);
        state.visitCount = (sess.visitCount || 0) + 1;
        state.returning = true;
        if (!state.icp && sess.icp) state.icp = sess.icp;
        if (!state.sector && sess.sector) state.sector = sess.sector;
        if (!state.vid && sess.vid) state.vid = sess.vid;
        if (!state.utm_source && sess.utm_source) state.utm_source = sess.utm_source;
      }
    } catch(e) {}
  }

  function saveSession() {
    try {
      sessionStorage.setItem(cfg.global.sessionKey, JSON.stringify({
        icp: state.icp, sector: state.sector, vid: state.vid,
        utm_source: state.utm_source, utm_campaign: state.utm_campaign,
        visitCount: state.visitCount, tier: state.tier,
        ipOrg: state.ipOrg, ipCity: state.ipCity,
      }));
    } catch(e) {}
  }

  // ── CONSENT ───────────────────────────────────────
  function getConsent() {
    try { return localStorage.getItem('sm_consent'); } catch(e) { return null; }
  }

  function setConsent(level) {
    try { localStorage.setItem('sm_consent', level); } catch(e) {}
    state.consent = level;
  }

  // ── UPGRADE D: CONSENT BANNER ─────────────────────
  function renderConsent() {
    if (d.getElementById('sm-consent')) return;
    var existing = getConsent();
    if (existing) { state.consent = existing; return; }

    var b = d.createElement('div');
    b.id = 'sm-consent';
    b.style.cssText = [
      'position:fixed','bottom:0','left:0','right:0','z-index:99999',
      'background:#1a1a2e','border-top:1px solid #6C5CE7',
      'padding:14px 20px','display:flex','align-items:center',
      'justify-content:space-between','gap:12px','flex-wrap:wrap',
      'font-family:system-ui,sans-serif','font-size:13px','color:#ccc',
    ].join(';');

    b.innerHTML = [
      '<span style="flex:1;min-width:200px">',
        '<strong style="color:#fff">HCI gebruikt analytische cookies</strong> ',
        'om uw bezoek te onthouden en relevante content te tonen. ',
        'Wij identificeren alleen het <em>bedrijf</em> achter uw bezoek, nooit de persoon. ',
        '<a href="/privacy" style="color:#6C5CE7;text-decoration:underline" target="_blank">',
          'Privacybeleid',
        '</a> &middot; ',
        '<a href="/optout.html" style="color:#6C5CE7;text-decoration:underline" target="_blank">',
          'Opt-out',
        '</a>',
      '</span>',
      '<div style="display:flex;gap:8px;flex-shrink:0">',
        '<button id="sm-consent-decline" style="',
          'background:transparent;border:1px solid #555;color:#aaa;',
          'padding:7px 14px;border-radius:6px;cursor:pointer;font-size:12px',
        '">Alleen functioneel</button>',
        '<button id="sm-consent-accept" style="',
          'background:#6C5CE7;border:none;color:#fff;',
          'padding:7px 16px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600',
        '">Accepteren</button>',
      '</div>',
    ].join('');

    d.body.appendChild(b);

    d.getElementById('sm-consent-accept').addEventListener('click', function() {
      setConsent('analytics');
      b.remove();
      loadSession();
      log('Consent: analytics accepted');
    });

    d.getElementById('sm-consent-decline').addEventListener('click', function() {
      setConsent('functional');
      b.remove();
      log('Consent: functional only');
    });
  }

  // ── SCORING ───────────────────────────────────────
  function calcScore() {
    var sc = cfg.scoring;
    // Start from IP-hint pre-added values
    var fit = state.fit;
    var intent = state.intent;

    if (state.icp && sc.icp[state.icp])
      fit += sc.icp[state.icp];
    if (state.sector && !_sectorFromIP)
      fit += sc.sector.any;
    if (state.utm_source && sc.utm_source[state.utm_source])
      intent += sc.utm_source[state.utm_source];
    if (state.vid)
      intent += sc.vid.present;
    if (state.returning)
      intent += sc.visit.returning;
    var isMobile = /Mobi|Android/i.test(navigator.userAgent);
    if (isMobile)
      intent += sc.device.mobile;

    state.fit    = fit;
    state.intent = intent;
    state.total  = fit + intent;

    recalcTier();
  }

  // ── HERO INJECTIE ─────────────────────────────────
  function injectHero() {
    var icpCfg = state.icp ? cfg.icps[state.icp] : null;
    var sectorCfg = state.sector ? cfg.sectors[state.sector] : null;

    var hero = sectorCfg || icpCfg;
    if (!hero) return;

    var lang = state.lang;
    var color = hero.color;

    var h1El = d.querySelector('[data-sm="hero-h1"]');
    if (h1El && hero.hero && hero.hero.h1 && hero.hero.h1[lang]) {
      h1El.innerHTML = hero.hero.h1[lang];
    }

    var subEl = d.querySelector('[data-sm="hero-sub"]');
    if (subEl && hero.hero && hero.hero.sub && hero.hero.sub[lang]) {
      subEl.textContent = hero.hero.sub[lang];
    }

    var kickerEl = d.querySelector('[data-sm="hero-kicker"]');
    if (kickerEl) {
      var kickerSrc = icpCfg || hero;
      if (kickerSrc.kicker && kickerSrc.kicker[lang]) {
        kickerEl.textContent = kickerSrc.kicker[lang];
        kickerEl.style.display = '';
      }
    }

    var pillsContainer = d.querySelector('[data-sm="regulation-pills"]');
    if (pillsContainer && sectorCfg && sectorCfg.regulations) {
      pillsContainer.innerHTML = sectorCfg.regulations.map(function(r) {
        return '<span class="sm-pill" style="background:' + r.color + ';color:' + r.textColor +
          ';border:1px solid ' + r.textColor + '40;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">' +
          r.label + '</span>';
      }).join('');
    }

    var chipsContainer = d.querySelector('[data-sm="pain-chips"]');
    var chips = sectorCfg ? sectorCfg.painChips : (icpCfg ? icpCfg.chips : null);
    if (chipsContainer && chips) {
      chipsContainer.innerHTML = chips.map(function(c) {
        return '<div class="sm-chip" style="padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;font-size:12px;">' +
          c[lang] + '</div>';
      }).join('');
    }

    var heroEl = d.querySelector('[data-sm="hero"]');
    if (heroEl && color) {
      heroEl.style.background = 'linear-gradient(135deg, ' + color + '22 0%, ' + color + '11 100%)';
      heroEl.style.borderColor = color + '44';
    }

    var ctaEl = d.querySelector('[data-sm="cta-primary"]');
    if (ctaEl && icpCfg && icpCfg.cta && icpCfg.cta.tiers) {
      var ctaCfg = icpCfg.cta.tiers[state.tier];
      if (ctaCfg) {
        var label = resolveTokens(ctaCfg.label[lang]);
        ctaEl.textContent = label;
        ctaEl.onclick = function() { handleCTA(ctaCfg); };
        ctaEl.style.background = color;
        ctaEl.style.color = '#fff';
      }
    }

    var secEl = d.querySelector('[data-sm="cta-secondary"]');
    if (secEl && icpCfg && icpCfg.cta && icpCfg.cta.secondary) {
      secEl.textContent = icpCfg.cta.secondary[lang];
      secEl.onclick = function() {
        var target = icpCfg.cta.secondary.target;
        if (target.startsWith('#')) {
          var el = d.querySelector(target);
          if (el) el.classList.add('sm-open');
        } else {
          w.location.href = target;
        }
      };
    }
  }

  // ── TOKEN RESOLVER ────────────────────────────────
  function resolveTokens(str) {
    if (!str) return '';
    return str
      .replace(/\{\{phone\}\}/g, cfg.global.phone)
      .replace(/\{\{phoneDisplay\}\}/g, cfg.global.phoneDisplay)
      .replace(/\{\{email\}\}/g, cfg.global.email)
      .replace(/\{\{calendlyUrl\}\}/g, cfg.global.calendlyUrl);
  }

  // ── CTA HANDLER ───────────────────────────────────
  function handleCTA(ctaCfg) {
    var target = resolveTokens(ctaCfg.target);
    switch(ctaCfg.action) {
      case 'link':      w.location.href = target; break;
      case 'calendly':  w.open(target, '_blank'); break;
      case 'phone':     w.location.href = 'tel:' + target; break;
      case 'email':     w.location.href = 'mailto:' + target; break;
      case 'quickscan':
        var qs = d.getElementById('sm-quickscan');
        if (qs) qs.classList.add('sm-open');
        break;
    }
  }

  // ── WIDGET ────────────────────────────────────────
  var _widgetShown = false;
  function initWidget() {
    if (_widgetShown) return;
    if (state.tier === 'cold' && !state.vid) return;

    var delay = state.vid ? cfg.global.vidDelayMs : cfg.global.widgetDelayMs;
    _widgetShown = true;

    setTimeout(function() {
      var widget = d.getElementById('sm-widget');
      if (widget) widget.classList.add('sm-visible');
    }, delay);
  }

  // ── UPGRADE F: SLACK ALERT (enriched with IP intel) ──
  function sendSlackAlert() {
    if (state.tier === 'cold') return;

    var payload = {
      text: '*SignalMesh Alert* \u2014 ' + state.tier.toUpperCase() + ' bezoeker',
      blocks: [
        {
          type: 'section',
          text: { type: 'mrkdwn', text:
            '*Tier:* ' + state.tier + ' | *Score:* ' + state.total + ' (fit: ' + state.fit + ', intent: ' + state.intent + ')\n' +
            '*ICP:* ' + (state.icp || '\u2014') + ' | *Sector:* ' + (state.sector || '\u2014') + '\n' +
            '*VID:* ' + (state.vid || '\u2014') + ' | *UTM:* ' + (state.utm_source || '\u2014') + '\n' +
            '*Pagina:* ' + d.location.href
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: '*Organisatie (IP):*\n' + (state.ipOrg || 'Onbekend') },
            { type: 'mrkdwn', text: '*Stad:*\n' + (state.ipCity || 'Onbekend') },
          ]
        },
      ]
    };

    fetch('/.netlify/functions/signalmesh-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(function() {});
  }

  // ── UPGRADE C: DWELL TIME & SCROLL SCORING ────────
  function initDwellTracking() {
    var dwellStart = Date.now();
    var dwellScored = { m2: false, m5: false };

    var dwellTimer = setInterval(function() {
      if (d.hidden) return;
      var mins = (Date.now() - dwellStart) / 60000;

      if (mins >= 2 && !dwellScored.m2) {
        dwellScored.m2 = true;
        addIntent(5);
        log('Dwell >2 min: +5 intent');
      }
      if (mins >= 5 && !dwellScored.m5) {
        dwellScored.m5 = true;
        addIntent(10);
        log('Dwell >5 min: +10 intent');
        clearInterval(dwellTimer);
      }
    }, 15000);

    w.addEventListener('beforeunload', function() { clearInterval(dwellTimer); });

    var scrollScored = { pct50: false, pct80: false };
    w.addEventListener('scroll', function() {
      var scrollHeight = d.body.scrollHeight - w.innerHeight;
      if (scrollHeight <= 0) return;
      var scrollPct = (w.scrollY / scrollHeight) * 100;

      if (scrollPct >= 50 && !scrollScored.pct50) {
        scrollScored.pct50 = true;
        addIntent(3);
        log('Scroll 50%: +3 intent');
      }
      if (scrollPct >= 80 && !scrollScored.pct80) {
        scrollScored.pct80 = true;
        addIntent(5);
        log('Scroll 80%: +5 intent');
      }
    }, { passive: true });
  }

  // ── PUBLIEKE API ──────────────────────────────────
  w.__sm = {
    getState:      function() { return JSON.parse(JSON.stringify(state)); },
    getConfig:     function() { return cfg; },
    selectICP:     function(icp) { state.icp = icp; calcScore(); injectHero(); saveSession(); },
    selectSector:  function(s) { state.sector = s; _sectorFromIP = false; calcScore(); injectHero(); saveSession(); },
    addIntent:     addIntent,
    addFit:        addFit,
    forceShow:     function() { var el = d.getElementById('sm-widget'); if (el) el.classList.add('sm-visible'); },
    resolveTokens: resolveTokens,
    debug:         function() { console.table(state); },
  };

  // ── INIT ──────────────────────────────────────────
  function init() {
    // UPGRADE E: Respect opt-out
    try {
      if (localStorage.getItem('sm_optout') === '1') {
        log('Opt-out active \u2014 engine disabled');
        return;
      }
    } catch(e) {}

    // UPGRADE A: IP intelligence hint (meta tags from Edge Function)
    readIPHint();

    // Parse URL parameters
    parseParams();

    // UPGRADE B: Language detection
    detectLanguage();

    // Load previous session
    loadSession();

    // Calculate score
    calcScore();

    // Inject hero content
    injectHero();

    // Show widget for warm+ visitors
    initWidget();

    // UPGRADE D: Consent banner
    renderConsent();

    // UPGRADE F: Slack alert enriched with IP intel
    sendSlackAlert();

    // Save session
    saveSession();

    // UPGRADE C: Dwell time & scroll tracking
    initDwellTracking();

    if (cfg.global.debug) console.log('[SignalMesh] State:', state);
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
