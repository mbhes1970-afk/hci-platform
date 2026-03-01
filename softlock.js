/**
 * HCI Soft Lock — Netlify Identity Gate
 * ========================================
 * Checks if user is logged in via Netlify Identity.
 * If not, redirects to /modules (the login/landing page).
 *
 * Usage: Add <script src="/softlock.js"></script> at end of protected pages.
 *
 * Pages that should include this:
 *   /pmc, /gtm, /outreach, /sales-execute,
 *   /icp-wizard, /ai-analyse, /account-hub, /quickscan
 *
 * Pages that should NOT include this:
 *   /modules (landing page with login widget)
 */

(function() {
  'use strict';

  // Skip if Netlify Identity widget not loaded
  if (typeof window.netlifyIdentity === 'undefined') {
    console.warn('[HCI Softlock] Netlify Identity widget not found. Skipping auth check.');
    return;
  }

  var REDIRECT_URL = '/modules';
  var CHECK_DELAY = 1500; // ms to wait for identity to initialize

  function checkAuth() {
    var user = window.netlifyIdentity.currentUser();
    if (!user) {
      console.info('[HCI Softlock] No authenticated user. Redirecting to', REDIRECT_URL);
      window.location.href = REDIRECT_URL;
    }
  }

  // Wait for identity widget to initialize, then check
  window.netlifyIdentity.on('init', function(user) {
    if (!user) {
      // Give a brief moment for token refresh
      setTimeout(checkAuth, 300);
    }
  });

  // Fallback: if init event doesn't fire within CHECK_DELAY, check manually
  setTimeout(function() {
    var user = window.netlifyIdentity.currentUser();
    if (!user) {
      checkAuth();
    }
  }, CHECK_DELAY);

  // Handle logout from any page
  window.netlifyIdentity.on('logout', function() {
    window.location.href = REDIRECT_URL;
  });

})();
