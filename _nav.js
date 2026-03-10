// ═══════════════════════════════════════════════════════════════════
// _nav.js — Shared Navigation Component
// Usage: <div id="hci-nav"></div> + <script src="/_nav.js"></script>
// Reads window.SITE for all text and URLs.
// ═══════════════════════════════════════════════════════════════════
(function() {
  var S = window.SITE;
  if (!S) return;

  // ── Inject nav CSS once ──
  if (!document.getElementById('hci-nav-css')) {
    var style = document.createElement('style');
    style.id = 'hci-nav-css';
    style.textContent =
      'nav { position:fixed; top:0; left:0; right:0; z-index:100; padding:16px 40px; display:flex; align-items:center; justify-content:space-between; background:rgba(8,9,12,.85); backdrop-filter:blur(16px); border-bottom:1px solid var(--border); transition:all .3s; }' +
      'nav.scrolled { padding:12px 40px; }' +
      '.nav-left { display:flex; align-items:center; gap:16px; }' +
      '.nav-links { display:flex; align-items:center; gap:28px; list-style:none; }' +
      '.nav-links a { font-size:13px; font-weight:400; color:var(--text-dim); text-decoration:none; transition:color .2s; letter-spacing:.2px; }' +
      '.nav-links a:hover { color:var(--text-bright); }' +
      '.nav-right { display:flex; align-items:center; gap:12px; }' +
      '.lang-toggle { display:flex; gap:2px; background:rgba(0,0,0,.3); padding:3px; border-radius:6px; border:1px solid var(--border); }' +
      '.lang-btn { padding:4px 10px; border:none; border-radius:4px; font-size:11px; font-weight:600; cursor:pointer; font-family:"Outfit",sans-serif; background:transparent; color:var(--text-dim); transition:all .2s; }' +
      '.lang-btn.active { background:var(--gold); color:var(--bg-deep); }' +
      '.lang-btn:hover:not(.active) { color:var(--text); }' +
      '.nav-cta { padding:8px 20px; border-radius:6px; font-size:12px; font-weight:600; text-decoration:none; background:var(--gold); color:var(--bg-deep); transition:all .2s; letter-spacing:.3px; }' +
      '.nav-cta:hover { background:var(--gold-light); }' +
      '.hamburger { display:none; background:none; border:none; cursor:pointer; padding:4px; }' +
      '.hamburger span { display:block; width:22px; height:2px; background:var(--text); margin:5px 0; transition:all .3s; }' +
      '.mobile-menu { position:absolute; top:100%; left:0; right:0; background:rgba(8,9,12,.95); backdrop-filter:blur(16px); padding:20px 40px; border-bottom:1px solid var(--border); }' +
      '.mobile-menu ul { list-style:none; }' +
      '.mobile-menu ul li { padding:8px 0; }' +
      '.mobile-menu ul a { font-size:15px; color:var(--text); text-decoration:none; }' +
      '.nav-logo { height:52px; max-width:180px; object-fit:contain; display:block; }' +
      '@media (max-width:900px) { nav { padding:14px 20px; } .nav-links { display:none; } .hamburger { display:block; } .nav-cta { display:none; } }' +
      '@media (max-width:768px) { .nav-logo { height:40px; } }';
    document.head.appendChild(style);
  }

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
        '<a href="/"><img src="' + brand.logo_white + '" alt="' + brand.name + '" class="nav-logo"></a>' +
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

  // ── Plausible Analytics ──
  var plausibleDomain = S.brand.domain;
  if (plausibleDomain && !document.querySelector('script[data-domain="' + plausibleDomain + '"]')) {
    var ps = document.createElement('script');
    ps.defer = true;
    ps.setAttribute('data-domain', plausibleDomain);
    ps.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(ps);
  }

  /**
   * hciTrack — Custom event tracking via Plausible
   * Usage: hciTrack('CTA Click', { page: '/icp1', tier: 'warm' })
   */
  window.hciTrack = function(eventName, props) {
    if (window.plausible) {
      window.plausible(eventName, { props: props || {} });
    }
  };

  // Auto-track CTA clicks
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a.btn-primary, a.btn-ghost, a.nav-cta');
    if (link) {
      window.hciTrack('CTA Click', {
        text: link.textContent.trim().substring(0, 50),
        href: link.getAttribute('href'),
        page: window.location.pathname,
      });
    }
  });

  // ── Load animations script once ──
  if (!document.getElementById('hci-anim-script')) {
    var animScript = document.createElement('script');
    animScript.id = 'hci-anim-script';
    animScript.src = '/_animations.js';
    document.body.appendChild(animScript);
  }
})();
