/**
 * HCI Module Export Engine — Step 3: DOCX Generation
 * ====================================================
 * Generates professional HCI-branded DOCX from module data.
 * Requires: interactive.js loaded first (provides hciGetStepData)
 * 
 * Dependencies (loaded dynamically from CDN):
 *   - docx@8.5.0 (DOCX generation)
 *   - FileSaver@2.0.5 (download trigger)
 * 
 * Usage: Add <script src="/export.js"></script> after interactive.js
 */

(function() {
  'use strict';

  // ═══════════════════════════════════════════
  // CDN LOADER
  // ═══════════════════════════════════════════

  function loadScript(url) {
    return new Promise(function(ok, fail) {
      var s = document.createElement('script');
      s.src = url;
      s.onload = ok;
      s.onerror = function() { fail(new Error('Failed: ' + url)); };
      document.head.appendChild(s);
    });
  }

  var libsLoaded = false;
  async function ensureLibs() {
    if (libsLoaded) return;
    if (!window.saveAs) await loadScript('https://unpkg.com/file-saver@2.0.5/dist/FileSaver.min.js');
    if (!window.docx) await loadScript('https://unpkg.com/docx@8.5.0/build/index.umd.js');
    libsLoaded = true;
  }

  // ═══════════════════════════════════════════
  // BRAND CONSTANTS
  // ═══════════════════════════════════════════

  var B = {
    navy: '1E3A5F', gold: 'B8860B', goldLight: 'D4A84B',
    ink: '1A1A2E', muted: '6B7280', border: 'E5E5E0',
    success: '059669', white: 'FFFFFF',
    greenBg: 'ECFDF5', goldBg: 'FFFBEB', navyBg: 'EFF6FF'
  };

  // ═══════════════════════════════════════════
  // DETECT MODULE
  // ═══════════════════════════════════════════

  function getModule() {
    var p = window.location.pathname.toLowerCase();
    if (p.includes('pmc')) return 'pmc';
    if (p.includes('gtm')) return 'gtm';
    if (p.includes('outreach')) return 'outreach';
    if (p.includes('sales')) return 'sales';
    return 'module';
  }

  function getLang() {
    if (typeof window.pageLang !== 'undefined') return window.pageLang;
    if (typeof window.aiLang !== 'undefined') return window.aiLang;
    return 'en';
  }

  // ═══════════════════════════════════════════
  // MODULE METADATA
  // ═══════════════════════════════════════════

  var META = {
    pmc: {
      en: { title: 'PMC Creation Framework', sub: 'Product-Market Combinations for EU Market Entry' },
      nl: { title: 'PMC Creatie Framework', sub: 'Product-Markt Combinaties voor EU Marktintroductie' },
      filename: 'HCI_PMC_Framework'
    },
    gtm: {
      en: { title: 'GTM Preparation Kit', sub: 'Go-to-Market Sales Enablement Toolkit' },
      nl: { title: 'GTM Voorbereiding Kit', sub: 'Go-to-Market Sales Enablement Toolkit' },
      filename: 'HCI_GTM_Preparation'
    },
    outreach: {
      en: { title: 'Outreach & Engagement Playbook', sub: 'Multi-Channel EU Outreach Sequences' },
      nl: { title: 'Outreach & Engagement Playbook', sub: 'Multi-Channel EU Outreach Sequences' },
      filename: 'HCI_Outreach_Playbook'
    },
    sales: {
      en: { title: 'Sales Execution Framework', sub: 'CMO→FMO Deal Qualification & Close' },
      nl: { title: 'Sales Executie Framework', sub: 'CMO→FMO Deal Kwalificatie & Close' },
      filename: 'HCI_Sales_Execution'
    }
  };

  // ═══════════════════════════════════════════
  // DOCX HELPERS (use window.docx after load)
  // ═══════════════════════════════════════════

  function D() { return window.docx; }

  function bdr() {
    return { style: D().BorderStyle.SINGLE, size: 1, color: B.border };
  }
  function borders() {
    var b = bdr();
    return { top: b, bottom: b, left: b, right: b };
  }
  var cm = { top: 60, bottom: 60, left: 100, right: 100 };

  // --- Text helpers ---

  function h1(text) {
    return new (D().Paragraph)({
      heading: D().HeadingLevel.HEADING_1,
      spacing: { before: 360, after: 160 },
      children: [new (D().TextRun)({ text: text, font: 'Georgia', bold: true, size: 32, color: B.navy })]
    });
  }

  function h2(text) {
    return new (D().Paragraph)({
      heading: D().HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      children: [new (D().TextRun)({ text: text, font: 'Georgia', bold: true, size: 26, color: B.navy })]
    });
  }

  function h3(text) {
    return new (D().Paragraph)({
      spacing: { before: 200, after: 80 },
      children: [new (D().TextRun)({ text: text, font: 'Georgia', bold: true, size: 22, color: B.gold })]
    });
  }

  function para(text, opts) {
    opts = opts || {};
    return new (D().Paragraph)({
      spacing: { after: opts.after || 120 },
      alignment: opts.align,
      children: [new (D().TextRun)({
        text: text,
        font: 'Segoe UI', size: opts.size || 21,
        color: opts.color || B.ink,
        bold: opts.bold, italics: opts.italic
      })]
    });
  }

  function spacer(n) {
    return new (D().Paragraph)({ spacing: { after: n || 80 }, children: [] });
  }

  // --- Table helpers ---

  function headerRow(cells, widths) {
    return new (D().TableRow)({
      children: cells.map(function(text, i) {
        return new (D().TableCell)({
          borders: borders(),
          width: { size: widths[i], type: D().WidthType.DXA },
          shading: { fill: B.navy, type: D().ShadingType.CLEAR },
          margins: cm,
          children: [new (D().Paragraph)({
            children: [new (D().TextRun)({ text: text, font: 'Segoe UI', size: 18, bold: true, color: B.white })]
          })]
        });
      })
    });
  }

  function dataRow(cells, widths, opts) {
    opts = opts || {};
    return new (D().TableRow)({
      children: cells.map(function(text, i) {
        var shading = opts.shade && opts.shade[i]
          ? { fill: opts.shade[i], type: D().ShadingType.CLEAR }
          : undefined;
        return new (D().TableCell)({
          borders: borders(),
          width: { size: widths[i], type: D().WidthType.DXA },
          shading: shading,
          margins: cm,
          children: [new (D().Paragraph)({
            alignment: opts.center && opts.center[i] ? D().AlignmentType.CENTER : undefined,
            children: [new (D().TextRun)({
              text: String(text || '—'),
              font: 'Segoe UI', size: 18,
              color: text ? B.ink : B.muted,
              bold: opts.boldCols && opts.boldCols[i],
              italics: !text
            })]
          })]
        });
      })
    });
  }

  function table(headers, rows, widths) {
    var totalW = widths.reduce(function(a, b) { return a + b; }, 0);
    var tRows = [headerRow(headers, widths)];
    rows.forEach(function(r) { tRows.push(dataRow(r.cells, widths, r.opts)); });
    return new (D().Table)({
      width: { size: totalW, type: D().WidthType.DXA },
      columnWidths: widths,
      rows: tRows
    });
  }

  // --- Field table (label → value) ---

  function fieldTable(fields) {
    var w = [2800, 6226];
    var rows = [headerRow([getLang() === 'nl' ? 'Veld' : 'Field', getLang() === 'nl' ? 'Invulling' : 'Input'], w)];
    fields.forEach(function(f) {
      rows.push(dataRow([f.label, f.value || ''], w, {
        boldCols: [true, false],
        shade: [, f.value ? B.greenBg : undefined]
      }));
    });
    return new (D().Table)({
      width: { size: 9026, type: D().WidthType.DXA },
      columnWidths: w,
      rows: rows
    });
  }

  // --- Score table ---

  function scoreTable(scores) {
    var w = [3800, 1800, 1600, 1826];
    var rows = [headerRow([
      getLang() === 'nl' ? 'Criterium' : 'Criterion',
      'Score',
      getLang() === 'nl' ? 'Weging' : 'Weight',
      'Status'
    ], w)];

    var total = 0, count = 0;
    scores.forEach(function(s) {
      var val = s.value ? parseInt(s.value) : 0;
      if (s.value) { total += val; count++; }
      var status = val >= 4 ? '● Strong' : val >= 3 ? '◐ Adequate' : val > 0 ? '○ Gap' : '—';
      var statusColor = val >= 4 ? B.greenBg : val >= 3 ? B.goldBg : val > 0 ? 'FEF2F2' : undefined;
      rows.push(dataRow(
        [s.label, s.value ? s.value + ' /5' : '—', s.weight, status], w,
        { center: [false, true, true, true], shade: [,,, statusColor] }
      ));
    });

    // Total row
    rows.push(new (D().TableRow)({
      children: [
        new (D().TableCell)({
          borders: borders(), width: { size: w[0], type: D().WidthType.DXA },
          shading: { fill: B.navy, type: D().ShadingType.CLEAR }, margins: cm,
          children: [new (D().Paragraph)({ children: [new (D().TextRun)({ text: 'TOTAAL', font: 'Segoe UI', size: 18, bold: true, color: B.white })] })]
        }),
        new (D().TableCell)({
          borders: borders(), width: { size: w[1], type: D().WidthType.DXA },
          shading: { fill: total >= 20 ? B.greenBg : total >= 15 ? B.goldBg : 'FEF2F2', type: D().ShadingType.CLEAR }, margins: cm,
          children: [new (D().Paragraph)({ alignment: D().AlignmentType.CENTER, children: [new (D().TextRun)({ text: (count > 0 ? total : '—') + ' /25', font: 'Geist Mono', size: 20, bold: true, color: total >= 20 ? B.success : total >= 15 ? B.gold : 'DC2626' })] })]
        }),
        new (D().TableCell)({
          borders: borders(), width: { size: w[2], type: D().WidthType.DXA },
          shading: { fill: B.navy, type: D().ShadingType.CLEAR }, margins: cm,
          children: [new (D().Paragraph)({ alignment: D().AlignmentType.CENTER, children: [new (D().TextRun)({ text: '100%', font: 'Segoe UI', size: 18, color: B.white })] })]
        }),
        new (D().TableCell)({
          borders: borders(), width: { size: w[3], type: D().WidthType.DXA },
          shading: { fill: B.navy, type: D().ShadingType.CLEAR }, margins: cm,
          children: [new (D().Paragraph)({ alignment: D().AlignmentType.CENTER, children: [new (D().TextRun)({ text: total >= 20 ? 'EU Ready' : total >= 15 ? 'Almost Ready' : count > 0 ? 'Foundation' : '—', font: 'Segoe UI', size: 18, bold: true, color: B.white })] })]
        })
      ]
    }));

    return new (D().Table)({
      width: { size: 9026, type: D().WidthType.DXA },
      columnWidths: w,
      rows: rows
    });
  }

  // --- Title page ---

  function titlePage(meta, lang) {
    var m = meta[lang] || meta.en;
    var date = new Date().toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' });
    return [
      spacer(2400),
      new (D().Paragraph)({
        alignment: D().AlignmentType.CENTER, spacing: { after: 120 },
        children: [new (D().TextRun)({ text: 'HES CONSULTANCY INTERNATIONAL', font: 'Segoe UI', size: 18, color: B.gold, bold: true, characterSpacing: 180 })]
      }),
      new (D().Paragraph)({
        alignment: D().AlignmentType.CENTER, spacing: { after: 80 },
        children: [new (D().TextRun)({ text: m.title, font: 'Georgia', size: 48, color: B.navy })]
      }),
      new (D().Paragraph)({
        alignment: D().AlignmentType.CENTER, spacing: { after: 200 },
        children: [new (D().TextRun)({ text: m.sub, font: 'Georgia', size: 24, color: B.muted, italics: true })]
      }),
      new (D().Paragraph)({
        alignment: D().AlignmentType.CENTER, spacing: { after: 60 },
        children: [new (D().TextRun)({ text: 'From Strategy to First Customer', font: 'Georgia', size: 22, color: B.gold, italics: true })]
      }),
      new (D().Paragraph)({
        alignment: D().AlignmentType.CENTER, spacing: { after: 400 },
        children: [new (D().TextRun)({ text: date + '  ·  Confidential', font: 'Segoe UI', size: 18, color: B.muted })]
      }),
      new (D().Paragraph)({
        alignment: D().AlignmentType.CENTER,
        border: { top: { style: D().BorderStyle.SINGLE, size: 2, color: B.gold, space: 8 } },
        spacing: { before: 200 },
        children: [new (D().TextRun)({ text: 'Generated by HCI Enablement Platform', font: 'Segoe UI', size: 16, color: B.muted })]
      }),
      new (D().Paragraph)({ children: [new (D().PageBreak)()] })
    ];
  }

  // ═══════════════════════════════════════════
  // MODULE-SPECIFIC BUILDERS
  // ═══════════════════════════════════════════

  // Each builder returns an array of Paragraph/Table elements
  // for the body content (after title page)

  function buildPMC(steps) {
    var lang = getLang();
    var c = [];

    // Step 0: Doelmarkt Definitie
    var s0 = steps[0] || { fields: [], scores: [] };
    c.push(h1('1. ' + s0.title));
    c.push(para(s0.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s0.fields.length) { c.push(h3(lang === 'nl' ? 'Doelmarkt Canvas' : 'Target Market Canvas')); c.push(fieldTable(s0.fields)); c.push(spacer()); }
    if (s0.scores.length) { c.push(h3(lang === 'nl' ? 'Prioriterings Score' : 'Prioritization Score')); c.push(scoreTable(s0.scores)); c.push(spacer()); }

    // Step 1: Kernprobleem
    var s1 = steps[1] || { fields: [], scores: [] };
    c.push(h1('2. ' + s1.title));
    c.push(para(s1.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s1.fields.length) { c.push(h3(lang === 'nl' ? 'Besluitvormers Map' : 'Decision Makers Map')); c.push(fieldTable(s1.fields)); c.push(spacer()); }

    // Step 2: Waardepropositie
    var s2 = steps[2] || { fields: [], scores: [] };
    c.push(h1('3. ' + s2.title));
    c.push(para(s2.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s2.fields.length) { c.push(h3(lang === 'nl' ? 'Messaging Framework' : 'Messaging Framework')); c.push(fieldTable(s2.fields)); c.push(spacer()); }

    // Step 3: Offer Packaging
    var s3 = steps[3] || { fields: [], scores: [] };
    c.push(h1('4. ' + s3.title));
    c.push(para(s3.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s3.fields.length) { c.push(h3('A-B-C Sprint Model')); c.push(fieldTable(s3.fields)); c.push(spacer()); }

    // Step 4: Partnerships
    var s4 = steps[4] || { fields: [], scores: [] };
    c.push(h1('5. ' + s4.title));
    c.push(para(s4.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s4.fields.length) { c.push(h3(lang === 'nl' ? 'Vendor & Partner Strategie' : 'Vendor & Partner Strategy')); c.push(fieldTable(s4.fields)); }

    return c;
  }

  function buildGTM(steps) {
    var lang = getLang();
    var c = [];

    // Step 0: Pitch Deck
    var s0 = steps[0] || { fields: [] };
    c.push(h1('1. ' + s0.title));
    c.push(para(s0.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s0.fields.length) { c.push(h3(lang === 'nl' ? 'Pitch Deck Structuur' : 'Pitch Deck Structure')); c.push(fieldTable(s0.fields)); c.push(spacer()); }

    // Step 1: CRM Pipeline
    var s1 = steps[1] || { fields: [] };
    c.push(h1('2. ' + s1.title));
    c.push(para(s1.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s1.fields.length) {
      c.push(h3(lang === 'nl' ? 'Pipeline Stadia' : 'Pipeline Stages'));
      // Custom table for pipeline stages
      var w = [2400, 6626];
      var pRows = [headerRow(['Stadium', lang === 'nl' ? 'Definitie & Criteria' : 'Definition & Criteria'], w)];
      s1.fields.forEach(function(f) {
        pRows.push(dataRow([f.label, f.value || ''], w, { boldCols: [true, false] }));
      });
      c.push(new (D().Table)({ width: { size: 9026, type: D().WidthType.DXA }, columnWidths: w, rows: pRows }));
      c.push(spacer());
    }

    // Step 2: Campaign in a Box
    var s2 = steps[2] || { fields: [] };
    c.push(h1('3. ' + s2.title));
    c.push(para(s2.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s2.fields.length) {
      // Split into email and linkedin sections
      var emailFields = s2.fields.filter(function(f) { return f.label.toLowerCase().includes('email'); });
      var linkedinFields = s2.fields.filter(function(f) { return f.label.toLowerCase().includes('stap') || f.label.toLowerCase().includes('linkedin'); });
      if (emailFields.length) { c.push(h3(lang === 'nl' ? 'Email Sequence' : 'Email Sequence')); c.push(fieldTable(emailFields)); c.push(spacer()); }
      if (linkedinFields.length) { c.push(h3('LinkedIn Sequence')); c.push(fieldTable(linkedinFields)); c.push(spacer()); }
      // Any remaining
      var rest = s2.fields.filter(function(f) { return emailFields.indexOf(f) === -1 && linkedinFields.indexOf(f) === -1; });
      if (rest.length) { c.push(fieldTable(rest)); c.push(spacer()); }
    }

    // Step 3: Database
    var s3 = steps[3] || { fields: [] };
    c.push(h1('4. ' + s3.title));
    c.push(para(s3.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s3.fields.length) { c.push(h3(lang === 'nl' ? 'Database Metrics' : 'Database Metrics')); c.push(fieldTable(s3.fields)); c.push(spacer()); }

    // Step 4: Sales Enablement
    var s4 = steps[4] || { fields: [] };
    c.push(h1('5. ' + s4.title));
    c.push(para(s4.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s4.fields.length) { c.push(h3(lang === 'nl' ? 'Sales Materialen' : 'Sales Materials')); c.push(fieldTable(s4.fields)); }

    return c;
  }

  function buildOutreach(steps) {
    var lang = getLang();
    var c = [];

    // Step 0: Revynu Benchmark
    var s0 = steps[0] || { fields: [] };
    c.push(h1('1. ' + s0.title));
    c.push(para(s0.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s0.fields.length) { c.push(h3(lang === 'nl' ? 'Benchmark Configuratie' : 'Benchmark Configuration')); c.push(fieldTable(s0.fields)); c.push(spacer()); }

    // Step 1: Email Campagnes
    var s1 = steps[1] || { fields: [] };
    c.push(h1('2. ' + s1.title));
    c.push(para(s1.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s1.fields.length) { c.push(h3(lang === 'nl' ? 'Email Setup' : 'Email Setup')); c.push(fieldTable(s1.fields)); c.push(spacer()); }

    // Step 2: LinkedIn
    var s2 = steps[2] || { fields: [] };
    c.push(h1('3. ' + s2.title));
    c.push(para(s2.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s2.fields.length) { c.push(h3('LinkedIn Setup')); c.push(fieldTable(s2.fields)); c.push(spacer()); }

    // Step 3: Telefoon & Netwerk
    var s3 = steps[3] || { fields: [] };
    c.push(h1('4. ' + s3.title));
    c.push(para(s3.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s3.fields.length) {
      var scriptFields = s3.fields.filter(function(f) { return f.label.toLowerCase().includes('script') || f.label.toLowerCase().includes('objection'); });
      var networkFields = s3.fields.filter(function(f) { return f.label.toLowerCase().includes('intro') || f.label.toLowerCase().includes('event'); });
      if (scriptFields.length) { c.push(h3(lang === 'nl' ? 'Telefoonscripts' : 'Phone Scripts')); c.push(fieldTable(scriptFields)); c.push(spacer()); }
      if (networkFields.length) { c.push(h3(lang === 'nl' ? 'Netwerk Activatie' : 'Network Activation')); c.push(fieldTable(networkFields)); c.push(spacer()); }
      var rest = s3.fields.filter(function(f) { return scriptFields.indexOf(f) === -1 && networkFields.indexOf(f) === -1; });
      if (rest.length) { c.push(fieldTable(rest)); c.push(spacer()); }
    }

    // Step 4: Nurturing
    var s4 = steps[4] || { fields: [] };
    c.push(h1('5. ' + s4.title));
    c.push(para(s4.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s4.fields.length) { c.push(h3(lang === 'nl' ? 'KPI Dashboard' : 'KPI Dashboard')); c.push(fieldTable(s4.fields)); }

    return c;
  }

  function buildSales(steps) {
    var lang = getLang();
    var c = [];

    // Step 0: CMO→FMO Kwalificatie
    var s0 = steps[0] || { fields: [], scores: [] };
    c.push(h1('1. ' + s0.title));
    c.push(para(s0.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s0.fields.length) { c.push(h3(lang === 'nl' ? 'Deal Kwalificatie' : 'Deal Qualification')); c.push(fieldTable(s0.fields)); c.push(spacer()); }
    if (s0.scores.length) { c.push(h3('MEDDIC+ Score')); c.push(scoreTable(s0.scores)); c.push(spacer()); }

    // Step 1: Proposal & Pricing
    var s1 = steps[1] || { fields: [] };
    c.push(h1('2. ' + s1.title));
    c.push(para(s1.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s1.fields.length) { c.push(h3(lang === 'nl' ? 'Commercieel Voorstel' : 'Commercial Proposal')); c.push(fieldTable(s1.fields)); c.push(spacer()); }

    // Step 2: Negotiation & Objections
    var s2 = steps[2] || { fields: [] };
    c.push(h1('3. ' + s2.title));
    c.push(para(s2.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s2.fields.length) {
      var compFields = s2.fields.filter(function(f) { return f.label.toLowerCase().includes('concurrent') || f.label.toLowerCase().includes('status quo'); });
      var stakeholders = s2.fields.filter(function(f) { return f.label.toLowerCase().includes('cio') || f.label.toLowerCase().includes('cfo') || f.label.toLowerCase().includes('ciso') || f.label.toLowerCase().includes('end user'); });
      if (compFields.length) { c.push(h3(lang === 'nl' ? 'Concurrentie Analyse' : 'Competitive Analysis')); c.push(fieldTable(compFields)); c.push(spacer()); }
      if (stakeholders.length) { c.push(h3(lang === 'nl' ? 'Stakeholder Aanpak' : 'Stakeholder Approach')); c.push(fieldTable(stakeholders)); c.push(spacer()); }
      var rest = s2.fields.filter(function(f) { return compFields.indexOf(f) === -1 && stakeholders.indexOf(f) === -1; });
      if (rest.length) { c.push(fieldTable(rest)); c.push(spacer()); }
    }

    // Step 3: Co-Sell & Partners
    var s3 = steps[3] || { fields: [] };
    c.push(h1('4. ' + s3.title));
    c.push(para(s3.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s3.fields.length) { c.push(h3(lang === 'nl' ? 'Partner & Vendor Strategie' : 'Partner & Vendor Strategy')); c.push(fieldTable(s3.fields)); c.push(spacer()); }

    // Step 4: Deal Close & Handover
    var s4 = steps[4] || { fields: [] };
    c.push(h1('5. ' + s4.title));
    c.push(para(s4.description, { italic: true, color: B.muted }));
    c.push(spacer());
    if (s4.fields.length) { c.push(h3(lang === 'nl' ? 'Deal Close Checklist' : 'Deal Close Checklist')); c.push(fieldTable(s4.fields)); }

    return c;
  }

  // ═══════════════════════════════════════════
  // SUMMARY PAGE
  // ═══════════════════════════════════════════

  function summaryPage(steps) {
    var lang = getLang();
    var c = [];
    c.push(h1(lang === 'nl' ? 'Samenvatting' : 'Summary'));
    c.push(para(lang === 'nl'
      ? 'Overzicht van alle ingevulde data per module stap.'
      : 'Overview of all completed data per module step.',
      { italic: true, color: B.muted }
    ));
    c.push(spacer());

    // Completion table
    var w = [3800, 1200, 1800, 2226];
    var rows = [headerRow([
      lang === 'nl' ? 'Stap' : 'Step',
      lang === 'nl' ? 'Velden' : 'Fields',
      lang === 'nl' ? 'Ingevuld' : 'Completed',
      'Status'
    ], w)];

    var totalFields = 0, totalFilled = 0;
    steps.forEach(function(s, i) {
      var filled = s.fields.filter(function(f) { return f.value; }).length;
      var total = s.fields.length;
      totalFields += total;
      totalFilled += filled;
      var pct = total > 0 ? Math.round((filled / total) * 100) : 0;
      var status = pct === 100 ? '● Complete' : pct >= 50 ? '◐ In Progress' : pct > 0 ? '○ Started' : '— Empty';
      var statusColor = pct === 100 ? B.greenBg : pct >= 50 ? B.goldBg : pct > 0 ? 'FEF2F2' : undefined;
      rows.push(dataRow(
        [(i + 1) + '. ' + s.title, String(total), filled + '/' + total + ' (' + pct + '%)', status], w,
        { center: [false, true, true, true], shade: [,,, statusColor], boldCols: [true] }
      ));
    });

    // Total row
    var totalPct = totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0;
    rows.push(dataRow(
      ['TOTAAL', String(totalFields), totalFilled + '/' + totalFields + ' (' + totalPct + '%)', totalPct === 100 ? '● Complete' : totalPct + '%'], w,
      { center: [false, true, true, true], boldCols: [true, false, true, true], shade: [B.navyBg, B.navyBg, B.navyBg, totalPct === 100 ? B.greenBg : B.goldBg] }
    ));

    c.push(new (D().Table)({ width: { size: 9026, type: D().WidthType.DXA }, columnWidths: w, rows: rows }));

    return c;
  }

  // ═══════════════════════════════════════════
  // MAIN EXPORT FUNCTION
  // ═══════════════════════════════════════════

  async function exportDOCX() {
    var lang = getLang();
    var mod = getModule();
    var meta = META[mod] || META.pmc;

    // Get step data from interactive.js
    if (typeof window.hciGetStepData !== 'function') {
      alert('Error: interactive.js not loaded');
      return;
    }

    var steps = window.hciGetStepData();
    if (!steps || steps.length === 0) {
      alert(lang === 'nl' ? 'Geen data gevonden om te exporteren.' : 'No data found to export.');
      return;
    }

    // Update button
    var btn = document.getElementById('hciExportBtn');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ ...'; }

    try {
      await ensureLibs();

      // Build module-specific content
      var bodyContent;
      switch(mod) {
        case 'pmc': bodyContent = buildPMC(steps); break;
        case 'gtm': bodyContent = buildGTM(steps); break;
        case 'outreach': bodyContent = buildOutreach(steps); break;
        case 'sales': bodyContent = buildSales(steps); break;
        default: bodyContent = buildPMC(steps);
      }

      // Combine: title page + summary + body + footer
      var children = [];
      children = children.concat(titlePage(meta, lang));
      children = children.concat(summaryPage(steps));
      children.push(new (D().Paragraph)({ children: [new (D().PageBreak)()] }));
      children = children.concat(bodyContent);

      // Closing
      children.push(spacer(400));
      children.push(new (D().Paragraph)({
        border: { top: { style: D().BorderStyle.SINGLE, size: 2, color: B.gold, space: 8 } },
        alignment: D().AlignmentType.CENTER,
        children: [new (D().TextRun)({
          text: 'Generated by HCI Enablement Platform · hes-consultancy-international.com',
          font: 'Segoe UI', size: 16, color: B.muted
        })]
      }));

      // Create document
      var doc = new (D().Document)({
        styles: {
          default: { document: { run: { font: 'Segoe UI', size: 21 } } },
          paragraphStyles: [
            { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
              run: { size: 32, bold: true, font: 'Georgia', color: B.navy },
              paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 } },
            { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
              run: { size: 26, bold: true, font: 'Georgia', color: B.navy },
              paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
          ]
        },
        sections: [{
          properties: {
            page: {
              size: { width: 11906, height: 16838 },
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
            }
          },
          headers: {
            default: new (D().Header)({
              children: [new (D().Paragraph)({
                alignment: D().AlignmentType.RIGHT,
                children: [
                  new (D().TextRun)({ text: 'HES CONSULTANCY INTERNATIONAL', font: 'Segoe UI', size: 14, color: B.gold, bold: true }),
                  new (D().TextRun)({ text: '  |  ' + (meta[lang] || meta.en).title, font: 'Segoe UI', size: 14, color: B.muted })
                ]
              })]
            })
          },
          footers: {
            default: new (D().Footer)({
              children: [new (D().Paragraph)({
                alignment: D().AlignmentType.CENTER,
                children: [
                  new (D().TextRun)({ text: 'Confidential · hes-consultancy-international.com · Page ', font: 'Segoe UI', size: 14, color: B.muted }),
                  new (D().TextRun)({ children: [D().PageNumber.CURRENT], font: 'Segoe UI', size: 14, color: B.muted })
                ]
              })]
            })
          },
          children: children
        }]
      });

      // Generate and download
      var blob = await D().Packer.toBlob(doc);
      var filename = meta.filename + '_' + new Date().toISOString().slice(0, 10) + '.docx';
      window.saveAs(blob, filename);

    } catch(err) {
      console.error('HCI Export Error:', err);
      alert((lang === 'nl' ? 'Export mislukt: ' : 'Export failed: ') + err.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '📄 Export';
      }
    }
  }

  // ═══════════════════════════════════════════
  // HOOK INTO INTERACTIVE.JS
  // ═══════════════════════════════════════════

  function init() {
    // Expose the export function for interactive.js's export button
    window.hciExportDOCX = exportDOCX;

    // Enable the export button if it exists
    var btn = document.getElementById('hciExportBtn');
    if (btn) {
      btn.disabled = false;
      btn.classList.add('hci-prog-export');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 300);
  }

})();
