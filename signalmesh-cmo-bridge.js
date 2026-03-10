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

    // Auto-sync for hot/tier1 (score >= 45), or when explicitly called (scan completion)
    var tier = smState.tier || 'cold';
    var score = smState.total || 0;

    // Prevent duplicate auto-syncs
    if (synced && !extra._force) return;

    // PocketBase deals collection field mapping
    var payload = {
      company: smState.ipOrg || smState.vid || (extra.contact && extra.contact.organisation) || 'Anonieme bezoeker — ' + new Date().toLocaleDateString('nl-NL'),
      source: 'signalmesh',
      sector: smState.sector || '',
      sm_tier: tier,
      sm_fit: smState.fit || 0,
      sm_intent: smState.intent || 0,
      overall_score: smState.total || 0,
      org_name: smState.ipOrg || '',
      notes: 'ICP: ' + (smState.icp || '-') +
        ' | UTM: ' + (smState.utm_source || '-') + '/' + (smState.utm_campaign || '-') +
        ' | Land: ' + (smState.ipCountry || '-') +
        ' | Stad: ' + (smState.ipCity || '-') +
        ' | Pagina: ' + window.location.pathname,
    };

    // Add quickscan data to notes
    if (extra.quickscanScore !== undefined) {
      payload.notes += ' | QS: ' + extra.quickscanScore + ' (' + (extra.quickscanTier || '-') + ')';
    }

    // Add contact data
    if (extra.contact) {
      if (extra.contact.organisation) payload.company = extra.contact.organisation;
      if (extra.contact.name) payload.notes += ' | Contact: ' + extra.contact.name;
      if (extra.contact.email) payload.notes += ' | Email: ' + extra.contact.email;
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
