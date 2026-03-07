/**
 * SignalMesh v2 — Engine
 * ─────────────────────────────────────────────────────────────
 * NIET AANPASSEN — Alle configuratie staat in signalmesh.config.js
 * ─────────────────────────────────────────────────────────────
 */
(function() {
  'use strict';

  const cfg = window.SignalMeshConfig;
  if (!cfg) { console.warn('[SignalMesh] Config niet gevonden'); return; }

  // ── STATE ─────────────────────────────────────────
  const state = {
    icp: null, sector: null, vid: null,
    utm_source: null, utm_campaign: null, utm_medium: null,
    fit: 0, intent: 0, total: 0, tier: 'cold',
    visitCount: 1, returning: false,
    lang: 'nl',
  };

  // ── URL PARAMS LEZEN ──────────────────────────────
  function parseParams() {
    const p = new URLSearchParams(window.location.search);
    state.icp        = p.get('icp') || null;
    state.sector     = p.get('sector') || null;
    state.vid        = p.get('vid') || null;
    state.utm_source = p.get('utm_source') || null;
    state.utm_campaign = p.get('utm_campaign') || null;
    state.utm_medium = p.get('utm_medium') || null;

    // Detecteer taal via param of navigator
    const langParam = p.get('lang');
    if (langParam) {
      state.lang = langParam === 'en' ? 'en' : 'nl';
    } else {
      state.lang = (navigator.language || 'nl').startsWith('en') ? 'en' : 'nl';
    }

    // Schoon URL na lezen
    if (p.toString()) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  // ── SESSION ───────────────────────────────────────
  function loadSession() {
    try {
      const raw = sessionStorage.getItem(cfg.global.sessionKey);
      if (raw) {
        const sess = JSON.parse(raw);
        state.visitCount = (sess.visitCount || 0) + 1;
        state.returning = true;
        if (!state.icp && sess.icp) state.icp = sess.icp;
        if (!state.sector && sess.sector) state.sector = sess.sector;
        if (!state.vid && sess.vid) state.vid = sess.vid;
        if (!state.utm_source && sess.utm_source) state.utm_source = sess.utm_source;
      }
    } catch(e) { /* sessionStorage niet beschikbaar */ }
  }

  function saveSession() {
    try {
      sessionStorage.setItem(cfg.global.sessionKey, JSON.stringify({
        icp: state.icp, sector: state.sector, vid: state.vid,
        utm_source: state.utm_source, utm_campaign: state.utm_campaign,
        visitCount: state.visitCount, tier: state.tier,
      }));
    } catch(e) { /* sessionStorage niet beschikbaar */ }
  }

  // ── SCORING ───────────────────────────────────────
  function calcScore() {
    const sc = cfg.scoring;
    var fit = 0, intent = 0;

    if (state.icp && sc.icp[state.icp])
      fit += sc.icp[state.icp];
    if (state.sector)
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

    // Tier bepalen
    for (var tier in sc.tiers) {
      var range = sc.tiers[tier];
      if (state.total >= range.min && state.total <= range.max) {
        state.tier = tier;
        break;
      }
    }
  }

  // ── HERO INJECTIE ─────────────────────────────────
  function injectHero() {
    var icpCfg = state.icp ? cfg.icps[state.icp] : null;
    var sectorCfg = state.sector ? cfg.sectors[state.sector] : null;

    // Kies de beste hero-source: sector > icp > default
    var hero = sectorCfg || icpCfg;
    if (!hero) return;

    var lang = state.lang;
    var color = hero.color;

    // Hero h1
    var h1El = document.querySelector('[data-sm="hero-h1"]');
    if (h1El && hero.hero && hero.hero.h1 && hero.hero.h1[lang]) {
      h1El.innerHTML = hero.hero.h1[lang];
    }

    // Hero sub
    var subEl = document.querySelector('[data-sm="hero-sub"]');
    if (subEl && hero.hero && hero.hero.sub && hero.hero.sub[lang]) {
      subEl.textContent = hero.hero.sub[lang];
    }

    // Kicker
    var kickerEl = document.querySelector('[data-sm="hero-kicker"]');
    if (kickerEl) {
      var kickerSrc = icpCfg || hero;
      if (kickerSrc.kicker && kickerSrc.kicker[lang]) {
        kickerEl.textContent = kickerSrc.kicker[lang];
        kickerEl.style.display = '';
      }
    }

    // Regulation pills (ICP3 sectoren)
    var pillsContainer = document.querySelector('[data-sm="regulation-pills"]');
    if (pillsContainer && sectorCfg && sectorCfg.regulations) {
      pillsContainer.innerHTML = sectorCfg.regulations.map(function(r) {
        return '<span class="sm-pill" style="background:' + r.color + ';color:' + r.textColor +
          ';border:1px solid ' + r.textColor + '40;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">' +
          r.label + '</span>';
      }).join('');
    }

    // Pain chips
    var chipsContainer = document.querySelector('[data-sm="pain-chips"]');
    var chips = sectorCfg ? sectorCfg.painChips : (icpCfg ? icpCfg.chips : null);
    if (chipsContainer && chips) {
      chipsContainer.innerHTML = chips.map(function(c) {
        return '<div class="sm-chip" style="padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;font-size:12px;">' +
          c[lang] + '</div>';
      }).join('');
    }

    // Hero achtergrondkleur
    var heroEl = document.querySelector('[data-sm="hero"]');
    if (heroEl && color) {
      heroEl.style.background = 'linear-gradient(135deg, ' + color + '22 0%, ' + color + '11 100%)';
      heroEl.style.borderColor = color + '44';
    }

    // CTA knop
    var ctaEl = document.querySelector('[data-sm="cta-primary"]');
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

    // Secondary CTA
    var secEl = document.querySelector('[data-sm="cta-secondary"]');
    if (secEl && icpCfg && icpCfg.cta && icpCfg.cta.secondary) {
      secEl.textContent = icpCfg.cta.secondary[lang];
      secEl.onclick = function() {
        var target = icpCfg.cta.secondary.target;
        if (target.startsWith('#')) {
          var el = document.querySelector(target);
          if (el) el.classList.add('sm-open');
        } else {
          window.location.href = target;
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
      case 'link':      window.location.href = target; break;
      case 'calendly':  window.open(target, '_blank'); break;
      case 'phone':     window.location.href = 'tel:' + target; break;
      case 'email':     window.location.href = 'mailto:' + target; break;
      case 'quickscan':
        var qs = document.getElementById('sm-quickscan');
        if (qs) qs.classList.add('sm-open');
        break;
    }
  }

  // ── WIDGET ────────────────────────────────────────
  function initWidget() {
    if (state.tier === 'cold' && !state.vid) return;

    var delay = state.vid ? cfg.global.vidDelayMs : cfg.global.widgetDelayMs;

    setTimeout(function() {
      var widget = document.getElementById('sm-widget');
      if (widget) widget.classList.add('sm-visible');
    }, delay);
  }

  // ── SLACK ALERT ───────────────────────────────────
  function sendSlackAlert() {
    if (state.tier === 'cold') return;

    var payload = {
      text: '*SignalMesh Alert* — ' + state.tier.toUpperCase() + ' bezoeker',
      blocks: [{
        type: 'section',
        text: { type: 'mrkdwn', text:
          '*Tier:* ' + state.tier + ' | *Score:* ' + state.total + ' (fit: ' + state.fit + ', intent: ' + state.intent + ')\n' +
          '*ICP:* ' + (state.icp || '—') + ' | *Sector:* ' + (state.sector || '—') + '\n' +
          '*VID:* ' + (state.vid || '—') + ' | *UTM:* ' + (state.utm_source || '—') + '\n' +
          '*Pagina:* ' + document.location.href
        }
      }]
    };

    fetch('/.netlify/functions/signalmesh-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(function() { /* silent fail */ });
  }

  // ── PUBLIEKE API ──────────────────────────────────
  window.__sm = {
    getState:     function() { return JSON.parse(JSON.stringify(state)); },
    getConfig:    function() { return cfg; },
    selectICP:    function(icp) { state.icp = icp; calcScore(); injectHero(); saveSession(); },
    selectSector: function(s) { state.sector = s; calcScore(); injectHero(); saveSession(); },
    forceShow:    function() { var w = document.getElementById('sm-widget'); if (w) w.classList.add('sm-visible'); },
    resolveTokens: resolveTokens,
    debug:        function() { console.table(state); },
  };

  // ── INIT ──────────────────────────────────────────
  function init() {
    parseParams();
    loadSession();
    calcScore();
    injectHero();
    initWidget();
    sendSlackAlert();
    saveSession();
    if (cfg.global.debug) console.log('[SignalMesh]', state);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
