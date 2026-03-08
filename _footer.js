// ═══════════════════════════════════════════════════════════════════
// _footer.js — Shared Footer Component
// Usage: <div id="hci-footer"></div> + <script src="/_footer.js"></script>
// Reads window.SITE for all text and URLs.
// ═══════════════════════════════════════════════════════════════════
(function() {
  var S = window.SITE;
  if (!S) return;

  function render() {
    var l = localStorage.getItem('hci_lang') || 'nl';
    var brand = S.brand;
    var icps = S.icps;
    var footer = S.footer;

    var icpLinks = Object.keys(icps).map(function(key) {
      var icp = icps[key];
      var label = l === 'en' ? icp.label_en : icp.label_nl;
      return '<a href="' + icp.route + '">' + icp.icon + ' ' + label + '</a>';
    }).join('');

    var legalLinks = footer.links.map(function(link) {
      var label = l === 'en' ? link.label_en : link.label_nl;
      return '<a href="' + link.href + '">' + label + '</a>';
    }).join('');

    var html = '<footer>' +
      '<div class="container">' +
        '<div class="footer-inner">' +
          '<div class="footer-left">' +
            '<a href="/"><img src="' + brand.logo_white + '" alt="' + brand.name + '" style="height:28px;margin-bottom:8px;"></a>' +
            '<div class="footer-tagline">' + brand.tagline + '</div>' +
            '<div class="footer-brand" style="margin-top:4px;">' + brand.email + '</div>' +
          '</div>' +
          '<div class="footer-center">' +
            '<div class="footer-icp-links">' + icpLinks + '</div>' +
          '</div>' +
          '<div class="footer-right">' +
            '<div class="footer-links">' + legalLinks + '</div>' +
            '<div class="footer-copyright">' + footer.copyright + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</footer>';

    var container = document.getElementById('hci-footer');
    if (container) container.innerHTML = html;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

  // Re-render on language change
  var origOnLangChange = window.onLangChange;
  window.onLangChange = function() {
    if (typeof origOnLangChange === 'function') origOnLangChange();
    render();
  };
})();
