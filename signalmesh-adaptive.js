/**
 * signalmesh-adaptive.js — Dynamic CTA Engine
 * Listens to HCIIntelligence tier changes and adapts page CTAs accordingly.
 * Load after: site.config.js, hci-intelligence-core.js, _intelligence.js
 *
 * Usage: Add data-signalmesh-cta attributes to elements you want to adapt.
 * <div data-signalmesh-cta="icp1"
 *      data-cold="Ontdek de EU markt kansen" data-cold-href="/hci-quickscan.html?icp=icp1"
 *      data-warm="Start uw EU Readiness Scan" data-warm-href="/hci-quickscan.html?icp=icp1"
 *      data-hot="Plan uw EU Market Entry sessie" data-hot-href="https://calendly.com/mbhes1970/30min"
 *      data-tier1="Mike neemt vandaag contact op" data-tier1-href="https://calendly.com/mbhes1970/30min">
 * </div>
 */
(function() {
  'use strict';

  var TIERS = ['cold', 'warm', 'hot', 'tier1'];
  var currentTier = sessionStorage.getItem('hci_sm_tier') || 'cold';
  var calendlyLoaded = false;
  var tier1Dismissed = false;
  var tier1DismissedAt = 0;
  var TIER1_RESHOW_MS = 5 * 60 * 1000;

  // ── Default CTA text per tier per ICP ──
  var DEFAULTS = {
    icp1: {
      cold:  { text_nl: 'Ontdek de EU markt kansen \u2192', text_en: 'Discover EU market opportunities \u2192', href: '/hci-quickscan.html?icp=icp1' },
      warm:  { text_nl: 'Start uw EU Readiness Scan \u2192', text_en: 'Start your EU Readiness Scan \u2192', href: '/hci-quickscan.html?icp=icp1' },
      hot:   { text_nl: 'Plan uw EU Market Entry sessie \u2192', text_en: 'Schedule your EU Market Entry session \u2192', href: 'https://calendly.com/mbhes1970/30min' },
      tier1: { text_nl: 'Mike neemt vandaag contact op', text_en: 'Mike will contact you today', href: 'https://calendly.com/mbhes1970/30min' },
    },
    icp2: {
      cold:  { text_nl: 'Bekijk het partner programma \u2192', text_en: 'View the partner program \u2192', href: '/icp2-growth.html' },
      warm:  { text_nl: 'Bereken uw partner potentieel \u2192', text_en: 'Calculate your partner potential \u2192', href: '/calculator.html' },
      hot:   { text_nl: 'Boek een partner onboarding \u2192', text_en: 'Book a partner onboarding \u2192', href: 'https://calendly.com/mbhes1970/30min' },
      tier1: { text_nl: 'Mike neemt vandaag contact op', text_en: 'Mike will contact you today', href: 'https://calendly.com/mbhes1970/30min' },
    },
    icp3: {
      cold:  { text_nl: 'Check uw compliance status \u2192', text_en: 'Check your compliance status \u2192', href: '/hci-quickscan.html' },
      warm:  { text_nl: 'Doe de sector quickscan \u2192', text_en: 'Take the sector quickscan \u2192', href: '/hci-quickscan.html' },
      hot:   { text_nl: 'Bespreek uw compliance roadmap \u2192', text_en: 'Discuss your compliance roadmap \u2192', href: 'https://calendly.com/mbhes1970/30min' },
      tier1: { text_nl: 'Mike neemt vandaag contact op', text_en: 'Mike will contact you today', href: 'https://calendly.com/mbhes1970/30min' },
    },
  };

  function getLang() { return (window.getLang && window.getLang()) || 'nl'; }

  // ── Update all [data-signalmesh-cta] elements ──
  function updateCTAs(tier) {
    if (tier === currentTier) return;
    currentTier = tier;
    sessionStorage.setItem('hci_sm_tier', tier);

    var elements = document.querySelectorAll('[data-signalmesh-cta]');
    elements.forEach(function(el) {
      var icp = el.getAttribute('data-signalmesh-cta');
      var lang = getLang();

      // Try data attributes first, then defaults
      var text = el.getAttribute('data-' + tier) ||
        (DEFAULTS[icp] && DEFAULTS[icp][tier] ? DEFAULTS[icp][tier]['text_' + lang] : null);
      var href = el.getAttribute('data-' + tier + '-href') ||
        (DEFAULTS[icp] && DEFAULTS[icp][tier] ? DEFAULTS[icp][tier].href : null);

      if (!text) return;

      // Fade out, swap, fade in
      el.style.transition = 'opacity .3s ease';
      el.style.opacity = '0';
      setTimeout(function() {
        el.innerHTML = '<a href="' + (href || '#') + '" class="btn-primary">' + text + '</a>';
        el.style.opacity = '1';
      }, 300);
    });

    // Tier1: show floating banner
    if (tier === 'tier1') showTier1Banner();

    // Hot/Tier1: lazy-load Calendly if needed
    if ((tier === 'hot' || tier === 'tier1') && !calendlyLoaded) lazyLoadCalendly();

    trackEvent('Tier Changed', { tier: tier });
  }

  // ── Tier1 floating banner ──
  function showTier1Banner() {
    if (tier1Dismissed && (Date.now() - tier1DismissedAt < TIER1_RESHOW_MS)) return;
    if (document.getElementById('sm-tier1-banner')) return;

    var lang = getLang();
    var S = window.SITE;
    var phone = S && S.brand ? S.brand.phoneDisplay : '';
    var calendly = S && S.brand ? S.brand.calendly : 'https://calendly.com/mbhes1970/30min';

    var banner = document.createElement('div');
    banner.id = 'sm-tier1-banner';
    banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:linear-gradient(135deg,#6C5CE7,#4834d4);padding:16px 24px;display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;box-shadow:0 -4px 20px rgba(0,0,0,.4);animation:smSlideUp .4s ease;';
    banner.innerHTML =
      '<span style="color:#fff;font-weight:600;font-size:.9rem;">' +
        (lang === 'en' ? 'Your profile is complete \u2014 Mike will reach out today.' : 'Uw profiel is compleet \u2014 Mike neemt vandaag contact op.') +
      '</span>' +
      (phone ? '<a href="tel:' + phone.replace(/\s/g,'') + '" style="color:#fff;font-size:.85rem;text-decoration:underline;">' + phone + '</a>' : '') +
      '<a href="' + calendly + '" target="_blank" rel="noopener" style="padding:8px 20px;background:#fff;color:#6C5CE7;border-radius:6px;font-weight:600;font-size:.82rem;text-decoration:none;">Plan direct \u2192</a>' +
      '<button onclick="this.parentElement.remove();window._smDismissTier1&&window._smDismissTier1()" style="background:none;border:none;color:rgba(255,255,255,.7);font-size:1.2rem;cursor:pointer;margin-left:8px;">\u2715</button>';

    // Add slide-up animation
    if (!document.getElementById('sm-tier1-style')) {
      var style = document.createElement('style');
      style.id = 'sm-tier1-style';
      style.textContent = '@keyframes smSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}';
      document.head.appendChild(style);
    }

    document.body.appendChild(banner);
  }

  window._smDismissTier1 = function() {
    tier1Dismissed = true;
    tier1DismissedAt = Date.now();
  };

  // ── Lazy-load Calendly widget ──
  function lazyLoadCalendly() {
    if (calendlyLoaded) return;
    calendlyLoaded = true;
    var link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = 'https://assets.calendly.com/assets/external/widget.css';
    document.head.appendChild(link);
    var script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js'; script.async = true;
    document.head.appendChild(script);
  }

  // ── Plausible event tracking ──
  function trackEvent(name, props) {
    if (window.plausible) window.plausible(name, { props: props });
  }

  // ── Listen for SignalMesh events ──
  function bindEvents() {
    document.addEventListener('hci:score-update', function(e) {
      var detail = e.detail || {};
      var score = detail.score || 0;
      var S = window.SITE;
      var t = (S && S.intelligence && S.intelligence.tier_thresholds) || { cold: 0, warm: 20, hot: 45, tier1: 70 };

      var tier = 'cold';
      if (score >= t.tier1) tier = 'tier1';
      else if (score >= t.hot) tier = 'hot';
      else if (score >= t.warm) tier = 'warm';

      updateCTAs(tier);
    });

    document.addEventListener('hci:lead-threshold', function(e) {
      var detail = e.detail || {};
      if (detail.tier === 'tier1') updateCTAs('tier1');
      else if (detail.tier === 'hot') updateCTAs('hot');
    });
  }

  // ── Initialize: set cold state, then listen ──
  function init() {
    // Restore tier from session or default to cold
    var savedTier = sessionStorage.getItem('hci_sm_tier');
    if (savedTier && TIERS.indexOf(savedTier) !== -1) {
      currentTier = savedTier;
    }

    // Apply current tier to all CTA elements
    var elements = document.querySelectorAll('[data-signalmesh-cta]');
    elements.forEach(function(el) {
      var icp = el.getAttribute('data-signalmesh-cta');
      var lang = getLang();
      var tier = currentTier;
      var text = el.getAttribute('data-' + tier) ||
        (DEFAULTS[icp] && DEFAULTS[icp][tier] ? DEFAULTS[icp][tier]['text_' + lang] : null);
      var href = el.getAttribute('data-' + tier + '-href') ||
        (DEFAULTS[icp] && DEFAULTS[icp][tier] ? DEFAULTS[icp][tier].href : null);
      if (text) {
        el.innerHTML = '<a href="' + (href || '#') + '" class="btn-primary">' + text + '</a>';
      }
    });

    if (currentTier === 'tier1') showTier1Banner();

    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.HCIAdaptive = { updateCTAs: updateCTAs, trackEvent: trackEvent };
})();
