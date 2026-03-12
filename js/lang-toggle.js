/**
 * lang-toggle.js — Shared NL/EN Language Toggle
 * ─────────────────────────────────────────────────
 * Include on any page: <script src="/js/lang-toggle.js"></script>
 *
 * Pattern:
 *   <span data-nl="Nederlandse tekst" data-en="English text">Nederlandse tekst</span>
 *
 * For short labels the visible text matches data-nl.
 * The script sets innerHTML from the active language attribute.
 *
 * Toggle HTML (place anywhere):
 *   <div class="lang-toggle" id="lang-toggle">
 *     <span data-lang="nl">NL</span>
 *     <span style="opacity:.3">|</span>
 *     <span data-lang="en">EN</span>
 *   </div>
 *
 * Priority: ?lang=nl/en URL param → localStorage → default (nl)
 * localStorage key: hci-lang  (default: nl)
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'hci-lang';
  var LEGACY_KEY = 'hci_lang';
  var DEFAULT_LANG = 'nl';

  function getLangFromURL() {
    try {
      var params = new URLSearchParams(window.location.search);
      var p = params.get('lang');
      if (p && (p === 'nl' || p === 'en')) return p;
    } catch (e) { /* URLSearchParams not supported, skip */ }
    return null;
  }

  function getLang() {
    return getLangFromURL()
      || localStorage.getItem(STORAGE_KEY)
      || localStorage.getItem(LEGACY_KEY)
      || DEFAULT_LANG;
  }

  function apply(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    localStorage.setItem(LEGACY_KEY, lang); // sync legacy key for _nav.js / insights pages
    document.documentElement.lang = lang;

    // Update all elements with data-nl / data-en attributes
    document.querySelectorAll('[data-nl][data-en]').forEach(function (el) {
      var val = el.getAttribute('data-' + lang);
      if (val !== null) {
        if (val.indexOf('<') > -1) {
          el.innerHTML = val;
        } else {
          el.textContent = val;
        }
      }
    });

    // Update toggle button active states
    document.querySelectorAll('.lang-toggle span[data-lang]').forEach(function (s) {
      s.classList.toggle('active', s.getAttribute('data-lang') === lang);
    });
  }

  function bindToggle() {
    document.querySelectorAll('.lang-toggle').forEach(function (toggle) {
      toggle.addEventListener('click', function (e) {
        var t = e.target.closest('[data-lang]');
        if (t) apply(t.getAttribute('data-lang'));
      });
    });
  }

  function init() {
    bindToggle();
    apply(getLang());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  window.hciLang = {
    get: getLang,
    set: function (l) { apply(l); },
  };
})();
