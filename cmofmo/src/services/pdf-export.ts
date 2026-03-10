import jsPDF from 'jspdf';
import type { ReportData, Language } from '../config/types';
import type { ThemeConfig } from '../themes/hci';

const COLORS = {
  gold: [200, 165, 90] as [number, number, number],
  dark: [8, 9, 12] as [number, number, number],
  card: [19, 21, 28] as [number, number, number],
  text: [168, 166, 180] as [number, number, number],
  bright: [240, 238, 245] as [number, number, number],
  dim: [94, 93, 106] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
  green: [5, 150, 105] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number],
};

function scoreColor(score: number): [number, number, number] {
  if (score >= 7) return COLORS.green;
  if (score >= 4) return COLORS.amber;
  return COLORS.red;
}

export function generatePdf(report: ReportData, lang: Language, theme: ThemeConfig) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const marginL = 20;
  const marginR = 20;
  const contentW = pageW - marginL - marginR;
  let y = 20;

  // Background
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pageW, 297, 'F');

  // Header bar
  doc.setFillColor(...COLORS.gold);
  doc.rect(0, 0, pageW, 3, 'F');

  // Title
  y = 20;
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.bright);
  doc.text('CMO\u2192FMO Quickscan Rapport', marginL, y);

  // Org name + sector
  y += 10;
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.gold);
  doc.text(report.orgName, marginL, y);

  y += 7;
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.dim);
  const dateStr = new Date(report.generatedAt).toLocaleDateString('nl-NL', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  doc.text(`${theme.name} \u00b7 ${dateStr}`, marginL, y);

  // Horizontal rule
  y += 5;
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.3);
  doc.line(marginL, y, pageW - marginR, y);

  // Executive Summary
  y += 10;
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.bright);
  doc.text(lang === 'nl' ? 'Samenvatting' : 'Executive Summary', marginL, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  const summaryLines = doc.splitTextToSize(report.executiveSummary[lang], contentW);
  doc.text(summaryLines, marginL, y);
  y += summaryLines.length * 4.5;

  // Sector context
  if (report.sectorContext[lang]) {
    y += 4;
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.dim);
    const ctxLines = doc.splitTextToSize(report.sectorContext[lang], contentW);
    doc.text(ctxLines, marginL, y);
    y += ctxLines.length * 3.5 + 4;
  }

  // Scores section
  y += 4;
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.bright);
  doc.text(lang === 'nl' ? 'Dimensiescores' : 'Dimension Scores', marginL, y);
  y += 8;

  const colW = contentW / Math.min(report.scores.length, 5);
  report.scores.forEach((s, i) => {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const x = marginL + col * colW;
    const boxY = y + row * 28;

    // Score box
    doc.setFillColor(...COLORS.card);
    doc.roundedRect(x + 1, boxY, colW - 2, 24, 2, 2, 'F');

    // Score value
    doc.setFontSize(16);
    doc.setTextColor(...scoreColor(s.score));
    doc.text(`${s.score}/10`, x + colW / 2, boxY + 10, { align: 'center' });

    // Label
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.text);
    const labelLines = doc.splitTextToSize(s.label[lang], colW - 4);
    doc.text(labelLines, x + colW / 2, boxY + 16, { align: 'center' });
  });

  y += Math.ceil(report.scores.length / 5) * 28 + 8;

  // CMO → FMO Table
  if (y > 220) {
    doc.addPage();
    doc.setFillColor(...COLORS.dark);
    doc.rect(0, 0, pageW, 297, 'F');
    y = 20;
  }

  doc.setFontSize(11);
  doc.setTextColor(...COLORS.bright);
  doc.text(lang === 'nl' ? 'CMO naar FMO Transformatie' : 'CMO to FMO Transformation', marginL, y);
  y += 6;

  // Table header
  const col1W = contentW * 0.25;
  const col2W = contentW * 0.35;
  const col3W = contentW * 0.40;

  doc.setFillColor(28, 30, 40);
  doc.rect(marginL, y, contentW, 7, 'F');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.dim);
  doc.text('Dimensie', marginL + 2, y + 5);
  doc.text('CMO (huidig)', marginL + col1W + 2, y + 5);
  doc.text('FMO (gewenst)', marginL + col1W + col2W + 2, y + 5);
  y += 8;

  // Table rows
  report.cmoFmoRows.forEach((row) => {
    if (y > 270) {
      doc.addPage();
      doc.setFillColor(...COLORS.dark);
      doc.rect(0, 0, pageW, 297, 'F');
      y = 20;
    }

    const dimText = doc.splitTextToSize(row.dimension[lang], col1W - 4);
    const cmoText = doc.splitTextToSize(row.cmo[lang], col2W - 4);
    const fmoText = doc.splitTextToSize(row.fmo[lang], col3W - 4);
    const rowH = Math.max(dimText.length, cmoText.length, fmoText.length) * 3.5 + 4;

    doc.setFillColor(...COLORS.card);
    doc.rect(marginL, y, contentW, rowH, 'F');
    doc.setDrawColor(40, 42, 55);
    doc.line(marginL, y + rowH, marginL + contentW, y + rowH);

    doc.setFontSize(7);
    doc.setTextColor(...COLORS.bright);
    doc.text(dimText, marginL + 2, y + 4);
    doc.setTextColor(...COLORS.text);
    doc.text(cmoText, marginL + col1W + 2, y + 4);
    doc.setTextColor(...COLORS.green);
    doc.text(fmoText, marginL + col1W + col2W + 2, y + 4);

    y += rowH + 1;
  });

  // Investment range
  y += 8;
  if (y > 250) {
    doc.addPage();
    doc.setFillColor(...COLORS.dark);
    doc.rect(0, 0, pageW, 297, 'F');
    y = 20;
  }

  doc.setFillColor(...COLORS.card);
  doc.roundedRect(marginL, y, contentW, 20, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.dim);
  doc.text(lang === 'nl' ? 'INDICATIEVE INVESTERING' : 'INDICATIVE INVESTMENT', pageW / 2, y + 7, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.gold);
  doc.text(report.investmentRange, pageW / 2, y + 14, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.dim);
  doc.text(report.timeline, pageW / 2, y + 19, { align: 'center' });

  // Footer
  y = 280;
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.dim);
  doc.text(theme.report.disclaimer, marginL, y);
  y += 4;
  doc.text(theme.report.footerText, marginL, y);

  // Bottom bar
  doc.setFillColor(...COLORS.gold);
  doc.rect(0, 294, pageW, 3, 'F');

  // Save
  const fileName = `CMO-FMO-Rapport-${report.orgName.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
