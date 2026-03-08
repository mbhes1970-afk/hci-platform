import { useEffect } from 'react';
import { useWizard } from '../hooks/useWizard';
import { useReport } from '../hooks/useReport';
import { useLanguage, t } from '../config/i18n';
import { useTheme } from '../themes/ThemeProvider';
import { ScoreCard } from './ScoreCard';
import { CmoFmoTable } from './CmoFmoTable';
import { calculateScores } from '../services/score-engine';
import { getSectorById } from '../config/sectors';
import { getRoleById } from '../config/roles';
import { getQuestionsForSector } from '../config/questions';
import type { CmoFmoRow, ReportData } from '../config/types';
import { generatePdf } from '../services/pdf-export';

async function pushToDealFlow(reportData: ReportData) {
  const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL
    || 'https://api.hes-consultancy-international.com';
  const smState = (typeof window !== 'undefined' && window.__sm)
    ? window.__sm.getState() : {} as Record<string, unknown>;
  try {
    await fetch(`${POCKETBASE_URL}/api/collections/deals/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'cmo_quickscan',
        company: reportData.orgName || (smState.ipOrg as string) || '',
        stage: 'quickscan_complete',
        icp: (smState.icp as string) || 'icp3',
        sector: reportData.sectorId,
        tier: (smState.tier as string) || 'cold',
        score: (smState.total as number) || 0,
        role: reportData.roleId,
        overall_score: reportData.scores.reduce((s, d) => s + d.score, 0) / reportData.scores.length,
        scores: JSON.stringify(reportData.scores.map(s => ({ id: s.id, score: s.score }))),
        sm_fit: (smState.fit as number) || 0,
        sm_intent: (smState.intent as number) || 0,
        utm_source: (smState.utm_source as string) || '',
      }),
    });
  } catch (e) {
    console.warn('DealFlow push failed (non-critical):', e);
  }
}

const SECTOR_CONTEXT: Record<string, { nl: string; en: string }> = {
  s01: { nl: 'Overheid & Publieke Sector — BIO, NIS2, AVG/GDPR, DigiD compliance.', en: 'Government & Public Sector — BIO, NIS2, GDPR, DigiD compliance.' },
  s02: { nl: 'Zorg & Gezondheid — NEN 7510:2, NIS2, AVG/GDPR, DPIA.', en: 'Healthcare — NEN 7510:2, NIS2, GDPR, DPIA.' },
  s03: { nl: 'Technologie & Software — ISO 27001, SOC2, NIS2, CRA.', en: 'Technology & Software — ISO 27001, SOC2, NIS2, CRA.' },
  s04: { nl: 'Enterprise & MKB — ISO 27001, NIS2, AVG/GDPR.', en: 'Enterprise & SMB — ISO 27001, NIS2, GDPR.' },
  s05: { nl: 'Finance & Banking — DORA, PSD2, NIS2, AVG/GDPR.', en: 'Finance & Banking — DORA, PSD2, NIS2, GDPR.' },
  s06: { nl: 'Telecom & Kritieke Infra — NIS2, ENISA, Telecomwet, CER.', en: 'Telecom & Critical Infrastructure — NIS2, ENISA, Telecom Act, CER.' },
  s07: {
    nl: 'Logistiek & Supply Chain — NIS2 kritieke infrastructuur classificatie, eFTI elektronische vrachtdocumentatie verplicht per 2026, AVG voor chauffeurs/klanten/ontvangers, ADR gevaarlijke stoffen documentatie. HCI positionering: Chunk Works post-quantum encryptie voor ketenbeveiliging, eFTI-ready documentintelligentie.',
    en: 'Logistics & Supply Chain — NIS2 critical infrastructure classification, eFTI electronic freight transport information mandatory by 2026, GDPR for drivers/customers/recipients, ADR hazardous goods documentation. HCI positioning: Chunk Works post-quantum encryption for chain security, eFTI-ready document intelligence.',
  },
  s08: {
    nl: 'Legal & LegalTech — AI Act: juridisch advies-AI valt onder "hoog-risico" (Annex III), conformiteitsbeoordeling verplicht. NIS2: advocatenkantoren zijn essentiële dienstverleners. DORA: legal dienstverleners aan financiële instellingen vallen onder ICT-risicobeheer eisen. AVG: legal professional privilege + bijzondere categorieën persoonsdata. HCI positionering: LexAI Pro compliance-first AI platform, Chunk Works voor beveiligde documentverwerking.',
    en: 'Legal & LegalTech — AI Act: legal advice AI falls under "high-risk" (Annex III), conformity assessment required. NIS2: law firms are essential service providers. DORA: legal service providers to financial institutions fall under ICT risk management requirements. GDPR: legal professional privilege + special categories of personal data. HCI positioning: LexAI Pro compliance-first AI platform, Chunk Works for secure document processing.',
  },
};

function generateCmoFmoFromScores(sectorId: string, scores: { id: string; label: { nl: string; en: string }; score: number }[]): CmoFmoRow[] {
  return scores.map((s) => {
    const isCritical = s.score <= 3;
    const isAttention = s.score <= 6;
    return {
      dimension: s.label,
      cmo: {
        nl: isCritical ? 'Minimaal ingericht, fundamentele gaps' : isAttention ? 'Gedeeltelijk ingericht, verbeterpunten' : 'Grotendeels operationeel',
        en: isCritical ? 'Minimal setup, fundamental gaps' : isAttention ? 'Partially set up, room for improvement' : 'Largely operational',
      },
      fmo: {
        nl: 'Volledig compliant en aantoonbaar ingericht',
        en: 'Fully compliant and demonstrably implemented',
      },
      impact: {
        nl: isCritical ? 'Hoog risico — directe actie nodig' : isAttention ? 'Compliance verbetering vereist' : 'Optimalisatie en fine-tuning',
        en: isCritical ? 'High risk — immediate action needed' : isAttention ? 'Compliance improvement required' : 'Optimization and fine-tuning',
      },
    };
  });
}

export function ReportPreview() {
  const wizard = useWizard();
  const report = useReport();
  const { lang } = useLanguage();
  const theme = useTheme();

  useEffect(() => {
    if (!wizard.sector || !wizard.role) return;
    if (report.report) return;

    report.setLoading(true);

    const timer = setTimeout(() => {
      // Bereken scores uit echte antwoorden
      const scores = calculateScores(wizard.sector!, wizard.answers);
      const cmoFmoRows = generateCmoFmoFromScores(wizard.sector!, scores);

      const avgScore = scores.reduce((s, d) => s + d.score, 0) / scores.length;
      const investMin = Math.round(avgScore < 5 ? 25000 : avgScore < 7 ? 15000 : 8000);
      const investMax = Math.round(investMin * 2.5);

      const mockReport: ReportData = {
        orgName: wizard.orgName || 'Demo Organisatie',
        sectorId: wizard.sector!,
        roleId: wizard.role!,
        scores,
        cmoFmoRows,
        executiveSummary: {
          nl: `Op basis van 9 quickscan-vragen voor ${wizard.orgName || 'uw organisatie'} in de ${getSectorById(wizard.sector!)?.label.nl} sector identificeren wij ${scores.filter(s => s.score <= 3).length} kritieke en ${scores.filter(s => s.score >= 4 && s.score <= 6).length} aandachtspunten. De komende 18 maanden zijn cruciaal voor compliance.`,
          en: `Based on 9 quickscan questions for ${wizard.orgName || 'your organization'} in the ${getSectorById(wizard.sector!)?.label.en} sector, we identify ${scores.filter(s => s.score <= 3).length} critical and ${scores.filter(s => s.score >= 4 && s.score <= 6).length} attention areas. The next 18 months are crucial for compliance.`,
        },
        sectorContext: SECTOR_CONTEXT[wizard.sector!] || { nl: '', en: '' },
        orgFindings: { nl: '', en: '' },
        investmentRange: `€${investMin.toLocaleString('nl-NL')} – €${investMax.toLocaleString('nl-NL')}`,
        timeline: avgScore < 5 ? '12-18 maanden' : '6-12 maanden',
        generatedAt: new Date().toISOString(),
      };
      report.setReport(mockReport);

      // DealFlow push — stuur lead data naar PocketBase
      pushToDealFlow(mockReport);
    }, 1500);

    return () => clearTimeout(timer);
  }, [wizard.sector, wizard.role]);

  if (report.isLoading) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-brand-text-bright font-medium">{t('report.generating', lang)}</p>
        <p className="text-xs text-brand-text-dim mt-2">
          {lang === 'nl' ? 'Dit duurt circa 15-30 seconden...' : 'This takes about 15-30 seconds...'}
        </p>
      </div>
    );
  }

  if (!report.report) return null;

  const r = report.report;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="text-xs font-mono text-brand-primary mb-2">
          {getSectorById(r.sectorId)?.icon} {getSectorById(r.sectorId)?.label[lang]}
        </div>
        <h2 className="font-serif text-2xl text-brand-text-bright">
          {t('report.ready', lang)}
        </h2>
        <p className="text-sm text-brand-text mt-2 max-w-lg mx-auto">
          {r.executiveSummary[lang]}
        </p>
      </div>

      {/* Mock mode banner */}
      <div className="bg-brand-primary-dim border border-brand-primary rounded-lg p-3 text-center">
        <span className="text-xs font-mono text-brand-primary-light">
          PREVIEW — {lang === 'nl' ? 'Scores berekend uit uw antwoorden. Verbind Claude API voor AI-gepersonaliseerde rapporten.' : 'Scores calculated from your answers. Connect Claude API for AI-personalized reports.'}
        </span>
      </div>

      {/* Scores */}
      <div>
        <h3 className="text-sm font-bold text-brand-text-bright mb-4">{t('report.scores', lang)}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {r.scores.map((s) => (
            <ScoreCard key={s.id} score={s} lang={lang} />
          ))}
        </div>
      </div>

      {/* CMO/FMO Table */}
      <div>
        <h3 className="text-sm font-bold text-brand-text-bright mb-4">{t('report.cmoFmo', lang)}</h3>
        <div className="bg-brand-bg-card border border-brand-border rounded-xl overflow-hidden">
          <CmoFmoTable rows={r.cmoFmoRows} lang={lang} />
        </div>
      </div>

      {/* Investment range */}
      <div className="bg-brand-bg-card border border-brand-border rounded-xl p-5 text-center">
        <div className="text-xs font-mono text-brand-text-dim mb-2">
          {lang === 'nl' ? 'INDICATIEVE INVESTERING' : 'INDICATIVE INVESTMENT'}
        </div>
        <div className="text-2xl font-serif text-brand-primary-light">{r.investmentRange}</div>
        <div className="text-xs text-brand-text-dim mt-1">{r.timeline}</div>
      </div>

      {/* Volgende stap CTA */}
      <div className="p-6 rounded-xl border" style={{ borderColor: theme.colors.primary + '40', background: theme.colors.primaryDim }}>
        <h3 className="font-bold text-brand-text-bright mb-2">
          {lang === 'nl' ? 'Volgende stap' : 'Next step'}
        </h3>
        <p className="text-sm text-brand-text mb-4">
          {lang === 'nl'
            ? 'Bespreek uw resultaten met een HCI specialist. Wij helpen u van strategie naar implementatie.'
            : 'Discuss your results with an HCI specialist. We help you from strategy to implementation.'}
        </p>
        <a
          href={theme.contact.calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 rounded-lg font-bold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: theme.colors.primary }}
        >
          {lang === 'nl' ? 'Plan een gesprek →' : 'Schedule a call →'}
        </a>
      </div>

      {/* Download */}
      <div className="text-center">
        <button
          onClick={() => generatePdf(r, lang, theme)}
          className="px-8 py-3 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: theme.colors.primary }}
        >
          {t('report.download', lang)} (PDF)
        </button>
        <p className="text-xs text-brand-text-dim mt-3">
          {theme.name} &middot; {new Date().toLocaleDateString('nl-NL')}
        </p>
      </div>
    </div>
  );
}
