/**
 * ============================================================
 * HCI SHARED NAVIGATION — hci-nav.js v1.0
 *
 * HES Consultancy International
 *
 * USAGE:
 *   <script src="hci-nav.js"></script>
 *
 *   Optional config before loading:
 *   <script>window.HCI_NAV_CONFIG = { module: 'pmc', showJourney: true };</script>
 *
 * EVENTS:
 *   hci:lang-change → { lang }
 *   hci:nav-ready   → { module, lang }
 * ============================================================
 */
(function(window, document) {
  'use strict';

  var defaults = { module: null, showJourney: true, showAuth: true, showLang: true,
    logoSrc: 'White_logo_-_no_background.png', homeUrl: '/' };
  var cfg = Object.assign({}, defaults, window.HCI_NAV_CONFIG || {});

  var MODULES = {
    hub:      { label:'Platform',              labelEn:'Platform',              phase:null, color:'var(--hci-gold)',      path:'/modules' },
    pmc:      { label:'PMC Creatie',            labelEn:'PMC Creation',          phase:1,    color:'var(--phase-pmc)',     path:'/pmc' },
    gtm:      { label:'GTM Voorbereiding',      labelEn:'GTM Preparation',       phase:2,    color:'var(--phase-gtm)',     path:'/gtm' },
    outreach: { label:'Outreach & Engagement',  labelEn:'Outreach & Engagement', phase:3,    color:'var(--phase-outreach)',path:'/outreach' },
    sales:    { label:'Sales Execution',        labelEn:'Sales Execution',       phase:4,    color:'var(--phase-sales)',   path:'/sales' },
    quickscan:{ label:'Quickscan',              labelEn:'Quickscan',             phase:null, color:'var(--hci-gold)',      path:'/quickscan' },
    icp:      { label:'ICP Workshop',           labelEn:'ICP Workshop',          phase:null, color:'var(--hci-gold)',      path:'/icp-wizard' },
    analyse:  { label:'AI Analyse',             labelEn:'AI Analysis',           phase:null, color:'var(--hci-gold)',      path:'/ai-analyse' },
    accounts: { label:'Account Hub',            labelEn:'Account Hub',           phase:null, color:'var(--hci-gold)',      path:'/account-hub' }
  };

  var PHASES = [
    { key:'pmc',      label:'PMC',      labelEn:'PMC',      color:'var(--phase-pmc)',     sub:'6 deliverables' },
    { key:'gtm',      label:'GTM',      labelEn:'GTM',      color:'var(--phase-gtm)',     sub:'5 deliverables' },
    { key:'outreach', label:'Outreach',  labelEn:'Outreach', color:'var(--phase-outreach)',sub:'4 channels' },
    { key:'sales',    label:'Sales',     labelEn:'Sales',    color:'var(--phase-sales)',   sub:'Close & expand' }
  ];

  var lang = localStorage.getItem('hci_lang') || 'nl';

  function setLang(l) {
    lang = l; localStorage.setItem('hci_lang', lang);
    document.querySelectorAll('.hci-lang-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.lang === lang); });
    var badge = document.getElementById('hci-nav-badge');
    if (badge && cfg.module && MODULES[cfg.module]) badge.textContent = lang === 'en' ? MODULES[cfg.module].labelEn : MODULES[cfg.module].label;
    PHASES.forEach(function(p) { var el = document.getElementById('hci-j-label-' + p.key); if (el) el.textContent = lang === 'en' ? p.labelEn : p.label; });
    document.dispatchEvent(new CustomEvent('hci:lang-change', { detail: { lang: lang } }));
  }

  function detectModule() {
    if (cfg.module) return cfg.module;
    var f = (window.location.pathname + window.location.href).toLowerCase();
    if (f.includes('pmc')) return 'pmc';
    if (f.includes('gtm') || (f.includes('sales') && !f.includes('sales-exec') && !f.includes('execute'))) return 'gtm';
    if (f.includes('outreach')) return 'outreach';
    if (f.includes('sales-exec') || f.includes('execute')) return 'sales';
    if (f.includes('quickscan') || f.includes('s01')) return 'quickscan';
    if (f.includes('icp') || f.includes('wp3')) return 'icp';
    if (f.includes('analyse') || f.includes('wp4')) return 'analyse';
    if (f.includes('account') || f.includes('wp5')) return 'accounts';
    return 'hub';
  }

  function buildNav() {
    var m = detectModule(); cfg.module = m;
    var mod = MODULES[m] || MODULES.hub;
    var h = '';

    /* ── NAV BAR ── */
    h += '<nav class="hci-nav" id="hci-nav">';
    h += '<div class="hci-nav-left">';
    h += '<a href="' + cfg.homeUrl + '" class="hci-nav-logo"><img src="' + cfg.logoSrc + '" alt="HES Consultancy International" style="height:36px;"></a>';
    if (m !== 'hub') h += '<div class="hci-nav-badge" id="hci-nav-badge" style="--badge-color:' + mod.color + '">' + (lang === 'en' ? mod.labelEn : mod.label) + '</div>';
    h += '</div><div class="hci-nav-right">';
    if (cfg.showLang) {
      h += '<div class="hci-lang-toggle">';
      h += '<button class="hci-lang-btn' + (lang==='nl'?' active':'') + '" data-lang="nl" onclick="HCINav.setLang(\'nl\')">NL</button>';
      h += '<button class="hci-lang-btn' + (lang==='en'?' active':'') + '" data-lang="en" onclick="HCINav.setLang(\'en\')">EN</button>';
      h += '</div>';
    }
    if (cfg.showAuth) h += '<div class="hci-nav-user" id="hci-nav-user"></div>';
    h += '<button class="hci-hamburger" id="hci-hamburger" onclick="HCINav.toggleMobile()" aria-label="Menu"><span></span><span></span><span></span></button>';
    h += '</div></nav>';

    /* ── JOURNEY RAIL ── */
    if (cfg.showJourney && mod.phase) {
      h += '<div class="hci-journey" id="hci-journey">';
      PHASES.forEach(function(p, i) {
        var idx = i + 1, cur = mod.phase || 0;
        var state = idx < cur ? 'done' : idx === cur ? 'current' : 'future';
        if (i > 0) h += '<div class="journey-connector"></div>';
        h += '<div class="journey-phase ' + state + '">';
        h += '<div class="journey-dot" style="--dot-color:' + p.color + ';border-color:' + p.color + '"></div>';
        h += '<div><div class="journey-label" id="hci-j-label-' + p.key + '" style="--dot-color:' + p.color + '">' + (lang==='en'?p.labelEn:p.label) + '</div>';
        h += '<div class="journey-sub">' + p.sub + '</div></div></div>';
      });
      h += '</div>';
    }
    return h;
  }

  function buildStyles() {
    return '<style id="hci-nav-styles">' +
    '.hci-nav{display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:60px;background:rgba(8,9,12,.95);border-bottom:1px solid var(--border,rgba(255,255,255,.06));position:sticky;top:0;z-index:100;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}' +
    '.hci-nav-left{display:flex;align-items:center;gap:16px}.hci-nav-logo{display:flex;align-items:center}' +
    '.hci-nav-badge{font-family:var(--font-mono,"Geist Mono",monospace);font-size:10px;padding:5px 12px;border-radius:4px;background:color-mix(in srgb,var(--badge-color) 12%,transparent);color:var(--badge-color);border:1px solid color-mix(in srgb,var(--badge-color) 25%,transparent);letter-spacing:.5px}' +
    '.hci-nav-right{display:flex;align-items:center;gap:14px}' +
    '.hci-lang-toggle{display:flex;gap:2px;background:rgba(255,255,255,.04);border-radius:4px;padding:2px}' +
    '.hci-lang-btn{padding:4px 10px;border:none;border-radius:3px;background:none;color:var(--text-dim,#5e5d6a);font-family:var(--font-mono,"Geist Mono",monospace);font-size:10px;font-weight:500;letter-spacing:.5px;cursor:pointer;transition:all .2s}' +
    '.hci-lang-btn.active{background:rgba(255,255,255,.08);color:var(--white,#fff)}.hci-lang-btn:hover:not(.active){color:var(--text,#a8a6b4)}' +
    '.hci-nav-user{font-size:12px;color:var(--text-dim,#5e5d6a)}' +
    '.hci-hamburger{display:none;flex-direction:column;gap:4px;background:none;border:none;padding:8px;cursor:pointer}' +
    '.hci-hamburger span{display:block;width:18px;height:2px;background:var(--text,#a8a6b4);border-radius:1px;transition:all .3s}' +
    '.hci-journey{display:flex;align-items:center;justify-content:center;gap:0;padding:16px 40px;background:var(--bg-card,#13151c);border-bottom:1px solid var(--border,rgba(255,255,255,.06))}' +
    '@media(max-width:900px){.hci-nav{padding:0 20px}.hci-journey{padding:12px 20px;flex-wrap:wrap;gap:4px}}' +
    '@media(max-width:600px){.hci-hamburger{display:flex}.hci-lang-toggle{display:none}.hci-nav-badge{font-size:9px;padding:4px 8px}' +
    '.hci-journey{flex-direction:column;align-items:flex-start;gap:8px}.journey-connector{width:1px!important;height:12px;margin-left:5px;background:linear-gradient(180deg,var(--text-dim) 50%,transparent 50%)!important;background-size:1px 4px!important}}' +
    '</style>';
  }

  function initAuth() {
    if (!cfg.showAuth) return;
    var el = document.getElementById('hci-nav-user');
    if (!el || !window.netlifyIdentity) return;
    var user = window.netlifyIdentity.currentUser();
    if (user) {
      el.innerHTML = '<span style="color:var(--text-bright,#f0eef5)">' + (user.user_metadata?.full_name || user.email) + '</span> <button onclick="netlifyIdentity.logout()" style="background:none;border:none;color:var(--text-dim);font-size:11px;cursor:pointer;margin-left:8px">Logout</button>';
    } else {
      el.innerHTML = '<button onclick="netlifyIdentity.open()" class="btn btn-ghost btn-sm" style="padding:6px 14px;font-size:11px;border:1px solid var(--hci-gold-border,rgba(200,165,90,.25));color:var(--hci-gold,#c8a55a);border-radius:4px;background:none;cursor:pointer">Login</button>';
    }
    window.netlifyIdentity.on('login', function() { location.reload(); });
    window.netlifyIdentity.on('logout', function() { location.reload(); });
  }

  var mobileOpen = false;
  function toggleMobile() {
    mobileOpen = !mobileOpen;
    var j = document.getElementById('hci-journey');
    if (j) j.style.display = mobileOpen ? 'flex' : '';
  }

  function initFadeUp() {
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(function(el) { obs.observe(el); });
  }

  function init() {
    if (!document.getElementById('hci-nav-styles')) document.head.insertAdjacentHTML('beforeend', buildStyles());
    var target = document.getElementById('hci-nav-container');
    if (!target) { target = document.createElement('div'); target.id = 'hci-nav-container'; document.body.insertBefore(target, document.body.firstChild); }
    target.innerHTML = buildNav();
    setTimeout(initAuth, 100);
    setTimeout(initFadeUp, 200);
    document.dispatchEvent(new CustomEvent('hci:nav-ready', { detail: { module: cfg.module, lang: lang } }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.HCINav = { setLang: setLang, getLang: function() { return lang; }, getModule: function() { return cfg.module; }, toggleMobile: toggleMobile, reinit: init };
})(window, document);
