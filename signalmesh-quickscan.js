/**
 * SignalMesh v2 — Quickscan Modal
 * ─────────────────────────────────────────────────────────────
 * Toont 5 vragen (1 per keer), berekent score, toont resultaat.
 * Bij warm+ tier: contactformulier vóór resultaat.
 * Data wordt naar PocketBase gestuurd.
 *
 * Openen: document.getElementById('sm-quickscan').classList.add('sm-open')
 * ─────────────────────────────────────────────────────────────
 */
(function() {
  'use strict';

  var cfg = window.SignalMeshConfig;
  if (!cfg || !cfg.quickscan) { console.warn('[SignalMesh QS] Config niet gevonden'); return; }

  var questions = cfg.quickscan.questions;
  var answers = {};
  var currentQ = 0;
  var qsScore = 0;
  var contactData = null;

  function lang() {
    return (window.__sm && window.__sm.getState) ? window.__sm.getState().lang : 'nl';
  }

  function t(obj) {
    if (!obj) return '';
    return obj[lang()] || obj.nl || '';
  }

  // ── BUILD MODAL HTML ──────────────────────────────
  function buildModal() {
    var modal = document.getElementById('sm-quickscan');
    if (!modal) return;

    modal.innerHTML = [
      '<div class="sm-qs-overlay" id="sm-qs-overlay"></div>',
      '<div class="sm-qs-dialog">',
      '  <button class="sm-qs-close" id="sm-qs-close" aria-label="Sluiten">&times;</button>',
      '  <div class="sm-qs-progress"><div class="sm-qs-progress-bar" id="sm-qs-bar"></div></div>',
      '  <div class="sm-qs-counter" id="sm-qs-counter"></div>',
      '  <div id="sm-qs-content"></div>',
      '</div>',
    ].join('\n');

    // Inject styles
    if (!document.getElementById('sm-qs-styles')) {
      var style = document.createElement('style');
      style.id = 'sm-qs-styles';
      style.textContent = getStyles();
      document.head.appendChild(style);
    }

    // Events
    document.getElementById('sm-qs-close').onclick = closeModal;
    document.getElementById('sm-qs-overlay').onclick = closeModal;

    // Watch for sm-open class
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          if (modal.classList.contains('sm-open')) {
            openModal();
          }
        }
      });
    });
    observer.observe(modal, { attributes: true });
  }

  function openModal() {
    currentQ = 0;
    answers = {};
    qsScore = 0;
    contactData = null;
    renderQuestion();
  }

  function closeModal() {
    var modal = document.getElementById('sm-quickscan');
    if (modal) modal.classList.remove('sm-open');
  }

  // ── RENDER QUESTION ───────────────────────────────
  function renderQuestion() {
    var content = document.getElementById('sm-qs-content');
    var bar = document.getElementById('sm-qs-bar');
    var counter = document.getElementById('sm-qs-counter');
    if (!content) return;

    var q = questions[currentQ];
    var progress = ((currentQ) / questions.length) * 100;
    bar.style.width = progress + '%';
    counter.textContent = (currentQ + 1) + ' / ' + questions.length;

    var html = '<h3 class="sm-qs-question">' + t(q.text) + '</h3>';
    html += '<div class="sm-qs-options">';
    q.options.forEach(function(opt) {
      html += '<button class="sm-qs-option" data-value="' + opt.value + '" data-score="' + opt.score + '">' +
        t(opt.label) + '</button>';
    });
    html += '</div>';

    content.innerHTML = html;

    // Bind option clicks
    content.querySelectorAll('.sm-qs-option').forEach(function(btn) {
      btn.onclick = function() {
        var val = btn.getAttribute('data-value');
        var score = parseInt(btn.getAttribute('data-score'), 10);
        answers[q.id] = { value: val, score: score, label: btn.textContent };
        qsScore += score;

        // Visual feedback
        btn.classList.add('sm-qs-selected');

        setTimeout(function() {
          currentQ++;
          if (currentQ < questions.length) {
            renderQuestion();
          } else {
            onQuestionsComplete();
          }
        }, 300);
      };
    });
  }

  // ── QUESTIONS COMPLETE ────────────────────────────
  function onQuestionsComplete() {
    var bar = document.getElementById('sm-qs-bar');
    bar.style.width = '100%';

    var smState = window.__sm ? window.__sm.getState() : { tier: 'cold' };
    var tier = smState.tier;

    // Warm+ bezoekers: toon contactformulier eerst
    if (tier === 'warm' || tier === 'hot' || tier === 'tier1') {
      renderContactForm();
    } else {
      renderResult();
    }
  }

  // ── CONTACT FORM ──────────────────────────────────
  function renderContactForm() {
    var content = document.getElementById('sm-qs-content');
    var counter = document.getElementById('sm-qs-counter');
    counter.textContent = '';

    var isNl = lang() === 'nl';
    var html = [
      '<div class="sm-qs-contact">',
      '  <h3>' + (isNl ? 'Bijna klaar! Vul uw gegevens in voor het resultaat.' : 'Almost done! Enter your details for the result.') + '</h3>',
      '  <input type="text" id="sm-qs-name" class="sm-qs-input" placeholder="' + (isNl ? 'Naam' : 'Name') + '" />',
      '  <input type="email" id="sm-qs-email" class="sm-qs-input" placeholder="' + (isNl ? 'E-mailadres' : 'Email address') + '" />',
      '  <input type="text" id="sm-qs-org" class="sm-qs-input" placeholder="' + (isNl ? 'Organisatie' : 'Organisation') + '" />',
      '  <button class="sm-qs-submit" id="sm-qs-submit">' + (isNl ? 'Bekijk resultaat' : 'View result') + '</button>',
      '  <p class="sm-qs-skip" id="sm-qs-skip">' + (isNl ? 'Overslaan →' : 'Skip →') + '</p>',
      '</div>',
    ].join('\n');

    content.innerHTML = html;

    document.getElementById('sm-qs-submit').onclick = function() {
      var name = document.getElementById('sm-qs-name').value.trim();
      var email = document.getElementById('sm-qs-email').value.trim();
      var org = document.getElementById('sm-qs-org').value.trim();

      if (email) {
        contactData = { name: name, email: email, organisation: org };
      }
      renderResult();
    };

    document.getElementById('sm-qs-skip').onclick = function() {
      renderResult();
    };
  }

  // ── RENDER RESULT ─────────────────────────────────
  function renderResult() {
    var content = document.getElementById('sm-qs-content');
    var counter = document.getElementById('sm-qs-counter');
    counter.textContent = '';

    var isNl = lang() === 'nl';
    var maxScore = 0;
    questions.forEach(function(q) {
      var highest = 0;
      q.options.forEach(function(o) { if (o.score > highest) highest = o.score; });
      maxScore += highest;
    });

    var pct = Math.round((qsScore / maxScore) * 100);
    var tier, tierLabel, tierColor;

    if (pct >= 70) {
      tier = 'high'; tierLabel = isNl ? 'Hoog risico — directe actie nodig' : 'High risk — immediate action needed'; tierColor = '#dc2626';
    } else if (pct >= 40) {
      tier = 'medium'; tierLabel = isNl ? 'Gemiddeld risico — aandacht vereist' : 'Medium risk — attention required'; tierColor = '#f59e0b';
    } else {
      tier = 'low'; tierLabel = isNl ? 'Laag risico — goed op weg' : 'Low risk — on track'; tierColor = '#10b981';
    }

    var smState = window.__sm ? window.__sm.getState() : {};
    var ctaLabel, ctaAction;

    if (smState.tier === 'tier1' || smState.tier === 'hot') {
      ctaLabel = isNl ? 'Plan direct een gesprek' : 'Schedule a call now';
      ctaAction = 'calendly';
    } else if (smState.tier === 'warm') {
      ctaLabel = isNl ? 'Plan een kennismaking' : 'Schedule intro call';
      ctaAction = 'calendly';
    } else {
      ctaLabel = isNl ? 'Ontvang uw volledig rapport' : 'Receive your full report';
      ctaAction = 'report';
    }

    var html = [
      '<div class="sm-qs-result">',
      '  <h3>' + (isNl ? 'Uw Quickscan Resultaat' : 'Your Quickscan Result') + '</h3>',
      '  <div class="sm-qs-score-ring" style="border-color:' + tierColor + '">',
      '    <span class="sm-qs-score-pct">' + pct + '%</span>',
      '  </div>',
      '  <p class="sm-qs-tier-label" style="color:' + tierColor + '">' + tierLabel + '</p>',
      '  <div class="sm-qs-summary">',
      '    <p>' + (isNl
        ? 'Op basis van uw antwoorden scoort uw organisatie <strong>' + pct + '%</strong> op compliance urgentie. '
        : 'Based on your answers, your organisation scores <strong>' + pct + '%</strong> on compliance urgency. ') +
        tierLabel + '.</p>',
      '  </div>',
      '  <div id="sm-qs-ai-result"></div>',
      '  <button class="sm-qs-cta" id="sm-qs-cta" style="background:' + (smState.icp ? (cfg.icps[smState.icp] || {}).color || '#6C5CE7' : '#6C5CE7') + '">' + ctaLabel + '</button>',
      '  <p class="sm-qs-restart" id="sm-qs-restart">' + (isNl ? 'Opnieuw starten' : 'Start over') + '</p>',
      '</div>',
    ].join('\n');

    content.innerHTML = html;

    // CTA handler
    document.getElementById('sm-qs-cta').onclick = function() {
      if (ctaAction === 'calendly') {
        window.open(cfg.global.calendlyUrl, '_blank');
      } else {
        window.location.href = '/hci-quickscan.html' + (smState.sector ? '?sector=' + smState.sector : '');
      }
    };

    // Restart
    document.getElementById('sm-qs-restart').onclick = function() {
      currentQ = 0;
      answers = {};
      qsScore = 0;
      contactData = null;
      renderQuestion();
    };

    // Save to PocketBase
    saveQuickscan(pct, tier);

    // Trigger AI agent
    if (window.__smAI && window.__smAI.analyze) {
      window.__smAI.analyze(answers, qsScore, pct, tier);
    }

    // Trigger CMO bridge
    if (window.__smBridge && window.__smBridge.syncToDealFlow) {
      window.__smBridge.syncToDealFlow({
        quickscanScore: pct,
        quickscanTier: tier,
        contact: contactData,
      });
    }
  }

  // ── SAVE TO POCKETBASE ────────────────────────────
  function saveQuickscan(pct, tier) {
    var smState = window.__sm ? window.__sm.getState() : {};
    var payload = {
      icp: smState.icp || '',
      sector: smState.sector || '',
      tier: smState.tier || 'cold',
      sm_score: smState.total || 0,
      qs_score: pct,
      qs_tier: tier,
      answers: JSON.stringify(answers),
      vid: smState.vid || '',
      utm_source: smState.utm_source || '',
      contact_name: contactData ? contactData.name : '',
      contact_email: contactData ? contactData.email : '',
      contact_org: contactData ? contactData.organisation : '',
      lang: lang(),
      page: window.location.pathname,
    };

    fetch(cfg.global.pbUrl + '/api/collections/quickscans/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(function() { /* silent fail */ });
  }

  // ── STYLES ────────────────────────────────────────
  function getStyles() {
    return [
      '#sm-quickscan { display:none; position:fixed; inset:0; z-index:10000; }',
      '#sm-quickscan.sm-open { display:flex; align-items:center; justify-content:center; }',
      '.sm-qs-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(4px); }',
      '.sm-qs-dialog { position:relative; background:#0f172a; color:#e2e8f0; border:1px solid #334155; border-radius:16px; padding:32px; max-width:520px; width:90%; max-height:90vh; overflow-y:auto; box-shadow:0 25px 50px rgba(0,0,0,0.5); }',
      '.sm-qs-close { position:absolute; top:12px; right:16px; background:none; border:none; color:#94a3b8; font-size:24px; cursor:pointer; line-height:1; }',
      '.sm-qs-close:hover { color:#fff; }',
      '.sm-qs-progress { height:4px; background:#1e293b; border-radius:2px; margin-bottom:8px; overflow:hidden; }',
      '.sm-qs-progress-bar { height:100%; background:#6C5CE7; border-radius:2px; transition:width 0.4s ease; width:0; }',
      '.sm-qs-counter { font-size:12px; color:#64748b; margin-bottom:20px; text-align:right; }',
      '.sm-qs-question { font-size:18px; font-weight:600; margin:0 0 20px; line-height:1.4; }',
      '.sm-qs-options { display:flex; flex-direction:column; gap:10px; }',
      '.sm-qs-option { background:#1e293b; border:1px solid #334155; border-radius:10px; padding:14px 16px; color:#e2e8f0; font-size:14px; cursor:pointer; text-align:left; transition:all 0.2s; }',
      '.sm-qs-option:hover { border-color:#6C5CE7; background:#1e293b; }',
      '.sm-qs-option.sm-qs-selected { border-color:#6C5CE7; background:#6C5CE720; }',
      '.sm-qs-contact { text-align:center; }',
      '.sm-qs-contact h3 { font-size:16px; margin:0 0 16px; }',
      '.sm-qs-input { width:100%; padding:12px 14px; background:#1e293b; border:1px solid #334155; border-radius:8px; color:#e2e8f0; font-size:14px; margin-bottom:10px; box-sizing:border-box; }',
      '.sm-qs-input:focus { outline:none; border-color:#6C5CE7; }',
      '.sm-qs-submit { width:100%; padding:14px; background:#6C5CE7; color:#fff; border:none; border-radius:10px; font-size:15px; font-weight:600; cursor:pointer; margin-top:4px; }',
      '.sm-qs-submit:hover { background:#5b4bd4; }',
      '.sm-qs-skip { color:#64748b; font-size:13px; cursor:pointer; margin-top:12px; }',
      '.sm-qs-skip:hover { color:#94a3b8; }',
      '.sm-qs-result { text-align:center; }',
      '.sm-qs-result h3 { font-size:18px; margin:0 0 20px; }',
      '.sm-qs-score-ring { width:100px; height:100px; border-radius:50%; border:4px solid; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; }',
      '.sm-qs-score-pct { font-size:28px; font-weight:700; }',
      '.sm-qs-tier-label { font-size:14px; font-weight:600; margin:0 0 16px; }',
      '.sm-qs-summary { font-size:13px; color:#94a3b8; line-height:1.6; margin-bottom:20px; }',
      '.sm-qs-summary strong { color:#e2e8f0; }',
      '.sm-qs-cta { width:100%; padding:14px; color:#fff; border:none; border-radius:10px; font-size:15px; font-weight:600; cursor:pointer; }',
      '.sm-qs-cta:hover { opacity:0.9; }',
      '.sm-qs-restart { color:#64748b; font-size:13px; cursor:pointer; margin-top:12px; }',
      '.sm-qs-restart:hover { color:#94a3b8; }',
      '#sm-qs-ai-result { margin-bottom:16px; text-align:left; }',
      '#sm-qs-ai-result .sm-ai-card { background:#1e293b; border:1px solid #334155; border-radius:10px; padding:16px; margin-bottom:12px; font-size:13px; line-height:1.6; color:#cbd5e1; }',
      '#sm-qs-ai-result .sm-ai-card h4 { font-size:14px; color:#e2e8f0; margin:0 0 8px; }',
      '#sm-qs-ai-result .sm-ai-loading { text-align:center; color:#64748b; padding:12px; font-size:13px; }',
    ].join('\n');
  }

  // ── INIT ──────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildModal);
  } else {
    buildModal();
  }

})();
