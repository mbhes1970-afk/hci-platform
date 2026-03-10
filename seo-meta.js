/**
 * seo-meta.js — Per-page meta tag injection
 * Load in <head> after site.config.js
 *
 * Reads window.SITE and current pathname to inject:
 * - <title>, <meta description>, og:title, og:description, og:image, og:url
 * - canonical URL
 * - hreflang (nl/en)
 */
(function() {
  'use strict';

  var S = window.SITE;
  if (!S) return;

  var domain = 'https://' + S.brand.domain;
  var path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';

  // ── Page-specific meta definitions ──
  var pages = {
    '/': {
      title_nl: 'HES Consultancy International — European GTM Partner',
      title_en: 'HES Consultancy International — European GTM Partner',
      desc_nl: 'Van product-market fit naar eerste Europese klant. Strategie, compliance en uitvoering in één aanpak.',
      desc_en: 'From product-market fit to first European customer. Strategy, compliance and execution in one approach.',
      image: '/assets/og-homepage.svg',
    },
    '/icp1-eu-entry': {
      title_nl: 'EU Market Entry — HES Consultancy International',
      title_en: 'EU Market Entry — HES Consultancy International',
      desc_nl: 'HCI begeleidt tech-bedrijven van product-market fit naar eerste Europese klanten.',
      desc_en: 'HCI guides tech companies from product-market fit to first European customers.',
      image: '/assets/og-icp1.svg',
    },
    '/icp2-growth': {
      title_nl: 'Partner & Pipeline Growth — HES Consultancy International',
      title_en: 'Partner & Pipeline Growth — HES Consultancy International',
      desc_nl: 'Word HCI partner en verdien aan compliance & AI projecten.',
      desc_en: 'Become an HCI partner and earn on compliance & AI projects.',
      image: '/assets/og-icp2.svg',
    },
    '/icp3-compliance': {
      title_nl: 'EU Compliance Hub — HES Consultancy International',
      title_en: 'EU Compliance Hub — HES Consultancy International',
      desc_nl: 'EU-regelgeving als concurrentievoordeel. Van nulmeting tot implementatie.',
      desc_en: 'EU regulation as a competitive advantage. From baseline to implementation.',
      image: '/assets/og-icp3.svg',
    },
    '/hci-quickscan': {
      title_nl: 'Gratis Quickscan — HES Consultancy International',
      title_en: 'Free Quickscan — HES Consultancy International',
      desc_nl: 'Doe de gratis CMO→FMO quickscan. In 7 minuten inzicht in uw compliance status.',
      desc_en: 'Take the free CMO→FMO quickscan. Compliance insight in 7 minutes.',
      image: '/assets/og-homepage.svg',
    },
    '/calculator': {
      title_nl: 'ROI Calculator — HES Consultancy International',
      title_en: 'ROI Calculator — HES Consultancy International',
      desc_nl: 'Bereken uw EU market entry of compliance ROI.',
      desc_en: 'Calculate your EU market entry or compliance ROI.',
      image: '/assets/og-homepage.svg',
    },
    '/insights': {
      title_nl: 'Insights — HES Consultancy International',
      title_en: 'Insights — HES Consultancy International',
      desc_nl: 'Artikelen, frameworks en best practices voor EU compliance en market entry.',
      desc_en: 'Articles, frameworks and best practices for EU compliance and market entry.',
      image: '/assets/og-homepage.svg',
    },
  };

  var page = pages[path] || pages['/'];
  var lang = (window.getLang && window.getLang()) || 'nl';
  var title = lang === 'en' ? page.title_en : page.title_nl;
  var desc = lang === 'en' ? page.desc_en : page.desc_nl;
  var imageUrl = domain + (page.image || '/assets/og-homepage.svg');
  var canonicalUrl = domain + path;

  // Set document title
  document.title = title;

  // Helper to set or create meta tag
  function setMeta(attr, attrVal, content) {
    var el = document.querySelector('meta[' + attr + '="' + attrVal + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  setMeta('name', 'description', desc);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', desc);
  setMeta('property', 'og:image', imageUrl);
  setMeta('property', 'og:url', canonicalUrl);
  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:locale', lang === 'en' ? 'en_US' : 'nl_NL');
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', desc);

  // Canonical
  var canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;
})();
