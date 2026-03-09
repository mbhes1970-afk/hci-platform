import { useState } from 'react';
import { useWizard } from '../hooks/useWizard';
import { useLanguage } from '../config/i18n';
import { useTheme } from '../themes/ThemeProvider';
import { calculateScores } from '../services/score-engine';
import { getSectorById } from '../config/sectors';

export function LeadCaptureGate() {
  const wizard = useWizard();
  const { lang } = useLanguage();
  const theme = useTheme();
  const [localName, setLocalName] = useState(wizard.contactName);
  const [localOrg, setLocalOrg] = useState(wizard.orgName);
  const [localEmail, setLocalEmail] = useState(wizard.contactEmail);
  const [localConsent, setLocalConsent] = useState(wizard.consent);

  const isValid = localName.trim().length > 0
    && localOrg.trim().length > 0
    && localEmail.trim().length > 0
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localEmail);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !wizard.sector) return;

    // Persist to wizard state
    wizard.setContactName(localName);
    wizard.setOrgName(localOrg);
    wizard.setContactEmail(localEmail);
    wizard.setConsent(localConsent);

    // Calculate scores for mailto
    const scores = calculateScores(wizard.sector, wizard.answers);
    const avgScore = scores.reduce((s, d) => s + d.score, 0) / scores.length;
    const sectorLabel = getSectorById(wizard.sector)?.label[lang] || wizard.sector;

    // Build mailto
    const nl = lang === 'nl';
    const subject = encodeURIComponent(
      `CMO-FMO Rapport — ${localName} — ${localOrg}`
    );

    const lines = [
      nl ? 'CMO-FMO Rapport Resultaten' : 'CMO-FMO Report Results',
      '',
      `${nl ? 'Naam' : 'Name'}: ${localName}`,
      `${nl ? 'Organisatie' : 'Organization'}: ${localOrg}`,
      `E-mail: ${localEmail}`,
      `Sector: ${sectorLabel}`,
      `${nl ? 'Rol' : 'Role'}: ${wizard.role?.toUpperCase()}`,
      '',
      `${nl ? 'Gemiddelde score' : 'Average score'}: ${avgScore.toFixed(1)} / 10`,
      '',
      nl ? 'Dimensiescores:' : 'Dimension scores:',
      ...scores.map(s => `  ${s.label[lang]}: ${s.score}/10 (${s.className})`),
      '',
      nl
        ? `Toestemming rapport delen: ${localConsent ? 'Ja' : 'Nee'}`
        : `Consent to share report: ${localConsent ? 'Yes' : 'No'}`,
      '',
      `Datum: ${new Date().toLocaleDateString('nl-NL')}`,
    ];

    const body = encodeURIComponent(lines.join('\n'));
    const mailtoLink = `mailto:mbhes@hes-consultancy-international.com?subject=${subject}&body=${body}`;

    // Open mailto
    window.location.href = mailtoLink;

    // Proceed to report after short delay (allows mailto to open)
    setTimeout(() => wizard.nextStep(), 500);
  }

  const nl = lang === 'nl';

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: theme.colors.primaryDim, border: `1px solid ${theme.colors.primary}40` }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl text-brand-text-bright">
          {nl ? 'Bijna klaar — uw rapport wordt gegenereerd' : 'Almost done — your report is being generated'}
        </h2>
        <p className="text-sm text-brand-text mt-2 max-w-sm mx-auto">
          {nl
            ? 'Vul onderstaande gegevens in om uw persoonlijke CMO-FMO rapport te ontvangen.'
            : 'Fill in the details below to receive your personalized CMO-FMO report.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Naam */}
        <div>
          <label className="block text-xs font-mono text-brand-text-dim mb-1.5 uppercase tracking-wider">
            {nl ? 'Naam' : 'Name'} *
          </label>
          <input
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            required
            placeholder={nl ? 'Uw volledige naam' : 'Your full name'}
            className="w-full px-4 py-3 rounded-lg text-sm
                       bg-brand-bg-card border border-brand-border
                       text-brand-text-bright placeholder:text-brand-text-dim
                       focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        {/* Organisatie */}
        <div>
          <label className="block text-xs font-mono text-brand-text-dim mb-1.5 uppercase tracking-wider">
            {nl ? 'Organisatie' : 'Organization'} *
          </label>
          <input
            type="text"
            value={localOrg}
            onChange={(e) => setLocalOrg(e.target.value)}
            required
            placeholder={nl ? 'Naam van uw organisatie' : 'Your organization name'}
            className="w-full px-4 py-3 rounded-lg text-sm
                       bg-brand-bg-card border border-brand-border
                       text-brand-text-bright placeholder:text-brand-text-dim
                       focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        {/* E-mailadres */}
        <div>
          <label className="block text-xs font-mono text-brand-text-dim mb-1.5 uppercase tracking-wider">
            {nl ? 'E-mailadres' : 'Email address'} *
          </label>
          <input
            type="email"
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
            required
            placeholder={nl ? 'uw@email.nl' : 'your@email.com'}
            className="w-full px-4 py-3 rounded-lg text-sm
                       bg-brand-bg-card border border-brand-border
                       text-brand-text-bright placeholder:text-brand-text-dim
                       focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        {/* Consent checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5 flex-shrink-0">
            <input
              type="checkbox"
              checked={localConsent}
              onChange={(e) => setLocalConsent(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
              ${localConsent
                ? 'border-brand-primary bg-brand-primary'
                : 'border-brand-border bg-brand-bg-card group-hover:border-brand-primary-light'
              }`}>
              {localConsent && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-brand-text leading-relaxed">
            {nl
              ? 'Ik ga akkoord dat HCI dit rapport ook ontvangt'
              : 'I agree that HCI also receives this report'}
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid}
          className="w-full py-3.5 rounded-lg text-sm font-bold text-white transition-all
                     disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
          style={{ backgroundColor: isValid ? theme.colors.primary : theme.colors.textDim }}
        >
          {nl ? 'Bekijk mijn rapport →' : 'View my report →'}
        </button>

        <p className="text-[11px] text-brand-text-dim text-center leading-relaxed">
          {nl
            ? 'Uw gegevens worden alleen gebruikt voor dit rapport. Geen spam, geen verplichtingen.'
            : 'Your data is only used for this report. No spam, no obligations.'}
        </p>
      </form>

      {/* Back button */}
      <div className="text-center mt-6">
        <button
          onClick={wizard.prevStep}
          className="text-sm text-brand-text-dim hover:text-brand-text-bright transition-colors"
        >
          {nl ? '← Terug naar vragen' : '← Back to questions'}
        </button>
      </div>
    </div>
  );
}
