/**
 * SignalMesh v2 — CMO Bridge (DealFlow)
 * ─────────────────────────────────────────────────────────────
 * Brug van SignalMesh naar DealFlow (PocketBase).
 * Bij tier hot/tier1: schrijf automatisch een deal.
 * Expose: window.__smBridge.syncToDealFlow(extraData)
 * ─────────────────────────────────────────────────────────────
 */
(function() {
  'use strict';

  var cfg = window.SignalMeshConfig;
  if (!cfg) return;

  var synced = false;

  /**
   * Sync current SignalMesh state to DealFlow (PocketBase deals collection)
   * @param {Object} [extraData] - Optional extra data (quickscanScore, contact, etc.)
   */
  function syncToDealFlow(extraData) {
    var smState = window.__sm ? window.__sm.getState() : {};
    var extra = extraData || {};

    // Only auto-sync for hot/tier1, but allow manual calls with any tier
    var tier = smState.tier || 'cold';
    var isAutoEligible = (tier === 'hot' || tier === 'tier1');

    // Prevent duplicate auto-syncs
    if (synced && !extra._force) return;

    var payload = {
      company: smState.vid || (extra.contact && extra.contact.organisation) || 'Anoniem',
      stage: 'signalmesh',
      source: 'SignalMesh v2',
      icp: smState.icp || '',
      sector: smState.sector || '',
      tier: tier,
      score: smState.total || 0,
      utm_source: smState.utm_source || '',
      utm_campaign: smState.utm_campaign || '',
      vid: smState.vid || '',
      lang: smState.lang || 'nl',
      page: window.location.pathname,
    };

    // Add quickscan data if available
    if (extra.quickscanScore !== undefined) {
      payload.qs_score = extra.quickscanScore;
      payload.qs_tier = extra.quickscanTier || '';
    }

    // Add contact data if available
    if (extra.contact) {
      payload.contact_name = extra.contact.name || '';
      payload.contact_email = extra.contact.email || '';
      payload.contact_org = extra.contact.organisation || '';
    }

    fetch(cfg.global.pbUrl + '/api/collections/deals/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    .then(function(res) {
      if (res.ok) {
        synced = true;
        if (cfg.global.debug) console.log('[SignalMesh Bridge] Deal synced');
      }
    })
    .catch(function() { /* silent fail */ });
  }

  /**
   * Auto-sync on page load for hot/tier1 visitors
   */
  function autoSync() {
    var smState = window.__sm ? window.__sm.getState() : {};
    if (smState.tier === 'hot' || smState.tier === 'tier1') {
      // Delay slightly to ensure engine has finished
      setTimeout(function() {
        syncToDealFlow();
      }, 1500);
    }
  }

  // ── PUBLIC API ────────────────────────────────────
  window.__smBridge = {
    syncToDealFlow: syncToDealFlow,
    isSynced: function() { return synced; },
  };

  // ── INIT ──────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoSync);
  } else {
    // Small delay to ensure engine has run
    setTimeout(autoSync, 500);
  }

})();
