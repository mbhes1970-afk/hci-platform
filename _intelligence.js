// ═══════════════════════════════════════════════════════════════════
// _intelligence.js — SignalMesh Wrapper
// Configures hci-intelligence-core.js from window.SITE.intelligence
// Load order: site.config.js → hci-intelligence-core.js → _intelligence.js
// ═══════════════════════════════════════════════════════════════════
(function() {
  var S = window.SITE;
  if (!S || !S.intelligence) return;
  var cfg = S.intelligence;

  // Set global config vars that intelligence-core reads
  window.HCI_SLACK_PROXY_URL = cfg.slack_webhook_proxy.startsWith('/')
    ? window.location.origin + cfg.slack_webhook_proxy
    : cfg.slack_webhook_proxy;
  window.HCI_PB_URL = cfg.pb_url;
  window.HCI_DEBUG = cfg.debug;

  // Initialize when core is loaded
  function init() {
    if (window.HCIIntelligence) {
      HCIIntelligence.init();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
