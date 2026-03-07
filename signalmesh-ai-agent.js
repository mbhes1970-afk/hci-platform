/**
 * SignalMesh v2 — AI Agent
 * ─────────────────────────────────────────────────────────────
 * Triggered na Quickscan voltooiing.
 * Stuurt antwoorden naar /.netlify/functions/claude-proxy
 * Geeft gepersonaliseerd compliance-advies terug.
 * ─────────────────────────────────────────────────────────────
 */
(function() {
  'use strict';

  var cfg = window.SignalMeshConfig;
  if (!cfg) return;

  function lang() {
    return (window.__sm && window.__sm.getState) ? window.__sm.getState().lang : 'nl';
  }

  /**
   * Analyze quickscan answers via Claude AI
   * @param {Object} answers - Quickscan answers { q1: { value, score, label }, ... }
   * @param {number} rawScore - Raw quickscan score
   * @param {number} pct - Percentage score (0-100)
   * @param {string} tier - Quickscan tier (low/medium/high)
   */
  function analyze(answers, rawScore, pct, tier) {
    var container = document.getElementById('sm-qs-ai-result');
    if (!container) return;

    var isNl = lang() === 'nl';
    var smState = window.__sm ? window.__sm.getState() : {};

    // Show loading
    container.innerHTML = '<div class="sm-ai-loading">' +
      (isNl ? 'AI-analyse wordt gegenereerd...' : 'Generating AI analysis...') + '</div>';

    // Build answer summary for the prompt
    var answerSummary = Object.keys(answers).map(function(qId) {
      var a = answers[qId];
      var qCfg = cfg.quickscan.questions.find(function(q) { return q.id === qId; });
      var qText = qCfg ? (qCfg.text[lang()] || qCfg.text.nl) : qId;
      return qText + ': ' + a.label;
    }).join('\n');

    // Sector context
    var sectorLabel = '';
    if (smState.sector && cfg.sectors[smState.sector]) {
      sectorLabel = cfg.sectors[smState.sector].label[lang()] || cfg.sectors[smState.sector].label.nl;
    }

    var icpLabel = '';
    if (smState.icp && cfg.icps[smState.icp]) {
      icpLabel = cfg.icps[smState.icp].label[lang()] || cfg.icps[smState.icp].label.nl;
    }

    var systemPrompt = isNl
      ? 'Je bent een compliance adviseur van HCI (HES Consultancy International). ' +
        'Geef beknopt, praktisch advies op basis van de quickscan resultaten. ' +
        'Gebruik maximaal 3 korte alinea\'s. Wees specifiek over regelgeving (NIS2, BIO, DORA, AI Act, AVG). ' +
        'Eindig met een concrete volgende stap. Schrijf in het Nederlands.'
      : 'You are a compliance advisor from HCI (HES Consultancy International). ' +
        'Provide concise, practical advice based on the quickscan results. ' +
        'Use a maximum of 3 short paragraphs. Be specific about regulations (NIS2, BIO, DORA, AI Act, GDPR). ' +
        'End with a concrete next step. Write in English.';

    var userPrompt = (isNl ? 'Quickscan resultaten:\n' : 'Quickscan results:\n') +
      (isNl ? 'Score: ' : 'Score: ') + pct + '% (' + tier + ')\n' +
      (sectorLabel ? (isNl ? 'Sector: ' : 'Sector: ') + sectorLabel + '\n' : '') +
      (icpLabel ? 'ICP: ' + icpLabel + '\n' : '') +
      '\n' + (isNl ? 'Antwoorden:\n' : 'Answers:\n') + answerSummary;

    fetch('/.netlify/functions/claude-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })
    .then(function(res) {
      if (!res.ok) throw new Error('API error: ' + res.status);
      return res.json();
    })
    .then(function(data) {
      var text = '';
      if (data.content && data.content[0] && data.content[0].text) {
        text = data.content[0].text;
      } else if (data.text) {
        text = data.text;
      }

      if (text) {
        renderAdvice(container, text, isNl);
      } else {
        container.innerHTML = '';
      }
    })
    .catch(function() {
      // Fallback: toon generiek advies
      var fallback = isNl
        ? generateFallbackNl(pct, tier, sectorLabel)
        : generateFallbackEn(pct, tier, sectorLabel);
      renderAdvice(container, fallback, isNl);
    });
  }

  function renderAdvice(container, text, isNl) {
    var paragraphs = text.split('\n\n').filter(function(p) { return p.trim(); });
    var html = '<div class="sm-ai-card">';
    html += '<h4>' + (isNl ? 'AI Compliance Advies' : 'AI Compliance Advice') + '</h4>';
    paragraphs.forEach(function(p) {
      html += '<p style="margin:0 0 8px;">' + escapeHtml(p.trim()) + '</p>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function generateFallbackNl(pct, tier, sector) {
    var sectorText = sector ? ' in de sector ' + sector : '';
    if (tier === 'high') {
      return 'Uw organisatie' + sectorText + ' scoort ' + pct + '% op compliance urgentie. Dit wijst op significante gaps in uw huidige compliance-aanpak. Met de komst van NIS2 en de AI Act is directe actie noodzakelijk.\n\n' +
        'Wij adviseren om te starten met een uitgebreide nulmeting om de exacte gaps in kaart te brengen. Focus eerst op de regelgeving met de kortste deadline.\n\n' +
        'Neem contact op met HCI voor een vrijblijvend gesprek over uw specifieke situatie en een concreet implementatieplan.';
    } else if (tier === 'medium') {
      return 'Uw organisatie' + sectorText + ' scoort ' + pct + '% op compliance urgentie. Er zijn verbeterpunten maar u bent al deels op weg.\n\n' +
        'Focus op het formaliseren van bestaande processen en het dichten van de belangrijkste gaps. Een gerichte gap-analyse kan helpen prioriteiten te stellen.\n\n' +
        'HCI kan u helpen met een gefocust implementatietraject dat voortbouwt op wat u al heeft.';
    } else {
      return 'Uw organisatie' + sectorText + ' scoort ' + pct + '% op compliance urgentie. U bent goed op weg met uw compliance-aanpak.\n\n' +
        'Blijf uw processen actueel houden en monitor nieuwe regelgeving zoals de AI Act die in 2025-2026 gefaseerd van kracht wordt.\n\n' +
        'Overweeg een periodieke review met HCI om uw compliance-status te valideren en vooruit te plannen.';
    }
  }

  function generateFallbackEn(pct, tier, sector) {
    var sectorText = sector ? ' in the ' + sector + ' sector' : '';
    if (tier === 'high') {
      return 'Your organisation' + sectorText + ' scores ' + pct + '% on compliance urgency. This indicates significant gaps in your current compliance approach. With NIS2 and the AI Act, immediate action is needed.\n\n' +
        'We recommend starting with a comprehensive baseline assessment to map exact gaps. Focus first on regulations with the shortest deadlines.\n\n' +
        'Contact HCI for a no-obligation consultation about your specific situation and a concrete implementation plan.';
    } else if (tier === 'medium') {
      return 'Your organisation' + sectorText + ' scores ' + pct + '% on compliance urgency. There are areas for improvement but you are partially on track.\n\n' +
        'Focus on formalising existing processes and closing the most critical gaps. A targeted gap analysis can help prioritise.\n\n' +
        'HCI can help with a focused implementation trajectory that builds on what you already have.';
    } else {
      return 'Your organisation' + sectorText + ' scores ' + pct + '% on compliance urgency. You are well on your way with your compliance approach.\n\n' +
        'Keep your processes up to date and monitor new regulations like the AI Act taking effect in phases during 2025-2026.\n\n' +
        'Consider a periodic review with HCI to validate your compliance status and plan ahead.';
    }
  }

  // ── PUBLIC API ────────────────────────────────────
  window.__smAI = {
    analyze: analyze,
  };

})();
