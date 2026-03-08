// ═══════════════════════════════════════════════════════════════════
// _animations.js — HCI Platform Scroll Animaties
// Native Intersection Observer + CSS transitions. No dependencies.
// ═══════════════════════════════════════════════════════════════════
(function() {
  // Inject animation CSS once
  if (!document.getElementById('hci-anim-css')) {
    var style = document.createElement('style');
    style.id = 'hci-anim-css';
    style.textContent =
      '[data-animate], .hci-fade {' +
        'opacity:0; transform:translateY(24px);' +
        'transition:opacity 0.6s ease, transform 0.6s ease;' +
      '}' +
      '[data-animate="slide-left"] { transform:translateX(-40px); }' +
      '[data-animate="slide-right"] { transform:translateX(40px); }' +
      '[data-animate].hci-visible, .hci-fade.hci-visible {' +
        'opacity:1; transform:translate(0,0);' +
      '}' +
      '@media (prefers-reduced-motion:reduce) {' +
        '[data-animate], .hci-fade { transition:none !important; opacity:1 !important; transform:none !important; }' +
      '}';
    document.head.appendChild(style);
  }

  // Respect prefers-reduced-motion
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── COUNTER ANIMATION ──
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    if (isNaN(target)) return;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1800;
    var isInteger = target === Math.floor(target);
    var start = performance.now();

    if (reducedMotion) {
      el.textContent = prefix + (isInteger ? target : target.toFixed(1)) + suffix;
      return;
    }

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function tick(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var value = target * easeOutCubic(progress);

      if (isInteger) {
        el.textContent = prefix + Math.round(value) + suffix;
      } else {
        el.textContent = prefix + value.toFixed(1) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = prefix + (isInteger ? target : target.toFixed(1)) + suffix;
      }
    }

    requestAnimationFrame(tick);
  }

  // ── STAGGER SETUP ──
  function setupStagger(parent) {
    var children = parent.children;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (!child.hasAttribute('data-animate') && !child.classList.contains('hci-fade')) {
        child.setAttribute('data-animate', 'fade');
      }
      var delay = Math.min(i * 100, 600);
      child.style.transitionDelay = delay + 'ms';
    }
  }

  // ── INIT ──
  function init() {
    // Setup stagger parents
    var staggers = document.querySelectorAll('.hci-stagger');
    for (var s = 0; s < staggers.length; s++) {
      setupStagger(staggers[s]);
    }

    // Apply custom delays
    var delayed = document.querySelectorAll('[data-delay]');
    for (var d = 0; d < delayed.length; d++) {
      delayed[d].style.transitionDelay = delayed[d].getAttribute('data-delay') + 'ms';
    }

    // Collect all animatable elements
    var elements = document.querySelectorAll('[data-animate], .hci-fade');
    var counters = document.querySelectorAll('[data-counter="true"]');

    if (reducedMotion) {
      // Show everything immediately
      for (var r = 0; r < elements.length; r++) {
        elements[r].classList.add('hci-visible');
      }
      for (var rc = 0; rc < counters.length; rc++) {
        animateCounter(counters[rc]);
      }
      return;
    }

    if (!('IntersectionObserver' in window)) {
      for (var f = 0; f < elements.length; f++) {
        elements[f].classList.add('hci-visible');
      }
      for (var fc = 0; fc < counters.length; fc++) {
        animateCounter(counters[fc]);
      }
      return;
    }

    // Fade/slide observer
    var fadeObserver = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          var el = entries[i].target;
          el.style.willChange = 'transform, opacity';
          el.classList.add('hci-visible');
          fadeObserver.unobserve(el);
          // Remove will-change after transition completes
          (function(target) {
            setTimeout(function() {
              target.style.willChange = '';
            }, 1200);
          })(el);
        }
      }
    }, { rootMargin: '0px 0px -80px 0px', threshold: 0.15 });

    for (var e = 0; e < elements.length; e++) {
      fadeObserver.observe(elements[e]);
    }

    // Counter observer
    if (counters.length > 0) {
      var counterObserver = new IntersectionObserver(function(entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            animateCounter(entries[i].target);
            counterObserver.unobserve(entries[i].target);
          }
        }
      }, { rootMargin: '0px 0px -40px 0px', threshold: 0.15 });

      for (var c = 0; c < counters.length; c++) {
        counterObserver.observe(counters[c]);
      }
    }
  }

  // Run init after DOM is ready and page scripts have rendered
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(init, 50);
    });
  } else {
    setTimeout(init, 50);
  }

  // Re-init after language changes (content is re-rendered)
  var origOnLang = window.onLangChange;
  window.addEventListener('hci-rerender', function() {
    setTimeout(init, 100);
  });

  // Expose for manual re-init after dynamic renders
  window.hciAnimInit = init;
})();
