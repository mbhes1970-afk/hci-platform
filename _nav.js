// ═══════════════════════════════════════════════════════════════════
// _nav.js — Shared Navigation Component
// Usage: <div id="hci-nav"></div> + <script src="/_nav.js"></script>
// Reads window.SITE for all text and URLs.
// ═══════════════════════════════════════════════════════════════════
(function() {
  var S = window.SITE;
  if (!S) return;

  function lang() { return localStorage.getItem('hci_lang') || 'nl'; }
  function tx(nl, en) { return lang() === 'en' ? en : nl; }

  function render() {
    var l = lang();
    var nav = S.nav;
    var brand = S.brand;

    var linksHtml = nav.links.map(function(link) {
      var label = l === 'en' ? link.label_en : link.label_nl;
      var active = window.location.pathname === link.href || window.location.pathname + window.location.hash === link.href;
      return '<li><a href="' + link.href + '"' + (active ? ' style="color:var(--text-bright)"' : '') + '>' + label + '</a></li>';
    }).join('');

    var ctaLabel = l === 'en' ? nav.cta_en : nav.cta_nl;

    var html = '<nav id="nav">' +
      '<div class="nav-left">' +
        '<a href="/"><img src="' + brand.logo_white + '" alt="' + brand.name + '" style="height:36px;"></a>' +
      '</div>' +
      '<ul class="nav-links">' + linksHtml + '</ul>' +
      '<div class="nav-right">' +
        '<div class="lang-toggle">' +
          '<button class="lang-btn' + (l === 'nl' ? ' active' : '') + '" data-lang="nl">NL</button>' +
          '<button class="lang-btn' + (l === 'en' ? ' active' : '') + '" data-lang="en">EN</button>' +
        '</div>' +
        '<a href="' + nav.cta_href + '" class="nav-cta">' + ctaLabel + '</a>' +
      '</div>' +
      '<button class="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>' +
      '<div class="mobile-menu" style="display:none">' +
        '<ul>' + linksHtml + '</ul>' +
        '<a href="' + nav.cta_href + '" class="btn-primary" style="margin-top:16px;display:block;text-align:center;">' + ctaLabel + '</a>' +
      '</div>' +
    '</nav>';

    var container = document.getElementById('hci-nav');
    if (container) container.innerHTML = html;

    // Bind events
    var langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        localStorage.setItem('hci_lang', btn.getAttribute('data-lang'));
        render();
        if (typeof window.onLangChange === 'function') window.onLangChange();
      });
    });

    var hamburger = document.querySelector('.hamburger');
    var mobileMenu = document.querySelector('.mobile-menu');
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', function() {
        var open = mobileMenu.style.display !== 'none';
        mobileMenu.style.display = open ? 'none' : 'block';
        hamburger.classList.toggle('open', !open);
      });
    }

    // Scroll behavior
    var navEl = document.getElementById('nav');
    if (navEl) {
      window.addEventListener('scroll', function() {
        navEl.classList.toggle('scrolled', window.scrollY > 50);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

  window.setLang = function(l) {
    localStorage.setItem('hci_lang', l);
    render();
    if (typeof window.onLangChange === 'function') window.onLangChange();
  };
})();
