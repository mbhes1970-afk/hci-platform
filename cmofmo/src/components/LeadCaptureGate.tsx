import { useState } from 'react';
import { useWizard } from '../hooks/useWizard';
import { useLanguage } from '../config/i18n';
import { useTheme } from '../themes/ThemeProvider';
import { calculateScores } from '../services/score-engine';
import { getSectorById } from '../config/sectors';

// Simple SHA-256 hash for pseudonymisation (AVG-compliant)
async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function LeadCaptureGate() {
  const wizard = useWizard();
  const { lang } = useLanguage();
  const theme = useTheme();
  const [localName, setLocalName] = useState(wizard.contactName);
  const [localOrg, setLocalOrg] = useState(wizard.orgName);
  const [localEmail, setLocalEmail] = useState(wizard.contactEmail);
  const [consentProcessing, setConsentProcessing] = useState(wizard.consentProcessing);
  const [consentReportShare, setConsentReportShare] = useState(wizard.consentReportShare);
  const [consentFollowup, setConsentFollowup] = useState(wizard.consentFollowup);
  const [submitting, setSubmitting] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localEmail);
  const isValid = localName.trim().length > 0
    && localOrg.trim().length > 0
    && localEmail.trim().length > 0
    && emailValid
    && consentProcessing
    && consentReportShare;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !wizard.sector || submitting) return;
    setSubmitting(true);

    // Persist to wizard state
    wizard.setContactName(localName);
    wizard.setOrgName(localOrg);
    wizard.setContactEmail(localEmail);
    wizard.setConsentProcessing(consentProcessing);
    wizard.setConsentReportShare(consentReportShare);
    wizard.setConsentFollowup(consentFollowup);

    // Store consent + create/update contact in PocketBase
    let optOutToken = '';
    try {
      const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL
        || 'https://api.hes-consultancy-international.com';

      // 1. Store AVG consent record (Art. 7 lid 1 — bewijs van toestemming)
      const [ipHash, uaHash] = await Promise.all([
        sha256(Date.now().toString()),
        sha256(navigator.userAgent),
      ]);
      await fetch(`${POCKETBASE_URL}/api/collections/cmo_fmo_consents/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: localEmail,
          org_name: localOrg,
          consent_processing: consentProcessing,
          consent_report_share: consentReportShare,
          consent_followup: consentFollowup,
          consent_timestamp: new Date().toISOString(),
          ip_hash: ipHash,
          user_agent_hash: uaHash,
          withdrawn: false,
        }),
      });

      // 2. Create or update contact with opt_out_token
      const uuid = crypto.randomUUID();
      const lookupRes = await fetch(
        `${POCKETBASE_URL}/api/collections/contacts/records?filter=(email='${encodeURIComponent(localEmail)}')&perPage=1`
      );
      const lookupData = await lookupRes.json();
      if (lookupData.items && lookupData.items.length > 0) {
        // Existing contact — read their token
        optOutToken = lookupData.items[0].opt_out_token || '';
        // Update consent_status
        await fetch(`${POCKETBASE_URL}/api/collections/contacts/records/${lookupData.items[0].id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consent_status: 'cmofmo_consent',
            data_source: 'cmofmo',
            last_contact_date: new Date().toISOString(),
            ...(optOutToken ? {} : { opt_out_token: uuid }),
          }),
        });
        if (!optOutToken) optOutToken = uuid;
      } else {
        // New contact
        optOutToken = uuid;
        await fetch(`${POCKETBASE_URL}/api/collections/contacts/records`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voornaam: localName.split(' ')[0],
            achternaam: localName.split(' ').slice(1).join(' '),
            volledige_naam: localName,
            organisatie: localOrg,
            email: localEmail,
            consent_status: 'cmofmo_consent',
            data_source: 'cmofmo',
            gdpr_basis: 'consent',
            opt_out_token: uuid,
            first_contact_date: new Date().toISOString(),
            last_contact_date: new Date().toISOString(),
          }),
        });
      }
    } catch {
      // Non-blocking — consent/contact storage failure should not block the user
    }

    // Calculate scores for mailto
    const scores = calculateScores(wizard.sector, wizard.answers);
    const avgScore = scores.reduce((s, d) => s + d.score, 0) / scores.length;
    const sectorLabel = getSectorById(wizard.sector)?.label[lang] || wizard.sector;

    // Build mailto with opt-out link
    const nl = lang === 'nl';
    const optOutUrl = optOutToken
      ? `https://hes-consultancy.nl/optout?ref=${optOutToken}`
      : '';
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
      nl ? 'Toestemmingen:' : 'Consents:',
      `  ${nl ? 'Verwerking gegevens' : 'Data processing'}: ${consentProcessing ? (nl ? 'Ja' : 'Yes') : (nl ? 'Nee' : 'No')}`,
      `  ${nl ? 'Rapport delen' : 'Report sharing'}: ${consentReportShare ? (nl ? 'Ja' : 'Yes') : (nl ? 'Nee' : 'No')}`,
      `  ${nl ? 'Commerciele opvolging' : 'Follow-up contact'}: ${consentFollowup ? (nl ? 'Ja' : 'Yes') : (nl ? 'Nee' : 'No')}`,
      '',
      ...(optOutUrl ? [`Opt-out link: ${optOutUrl}`, ''] : []),
      `Datum: ${new Date().toLocaleDateString('nl-NL')}`,
    ];

    const body = encodeURIComponent(lines.join('\n'));
    const mailtoLink = `mailto:mbhes@hes-consultancy-international.com?subject=${subject}&body=${body}`;

    // Open mailto
    window.location.href = mailtoLink;

    // Proceed to report after short delay (allows mailto to open)
    setTimeout(() => {
      setSubmitting(false);
      wizard.nextStep();
    }, 500);
  }

  const nl = lang === 'nl';

  // Reusable checkbox component
  function ConsentCheckbox({
    checked, onChange, required, children,
  }: {
    checked: boolean; onChange: (v: boolean) => void; required?: boolean; children: React.ReactNode;
  }) {
    return (
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-0.5 flex-shrink-0">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
            ${checked
              ? 'border-brand-primary bg-brand-primary'
              : 'border-brand-border bg-brand-bg-card group-hover:border-brand-primary-light'
            }`}>
            {checked && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-sm text-brand-text leading-relaxed">
          {children}
          {required && <span className="text-brand-text-dim ml-1">*</span>}
        </span>
      </label>
    );
  }

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

        {/* AVG Art. 7 lid 2 — drie aparte checkboxen */}
        <div className="space-y-4 pt-2">
          <p className="text-xs font-mono text-brand-text-dim uppercase tracking-wider">
            {nl ? 'Toestemmingen' : 'Consents'}
          </p>

          {/* Checkbox 1 — Verwerking (verplicht) */}
          <ConsentCheckbox checked={consentProcessing} onChange={setConsentProcessing} required>
            {nl
              ? 'Ik ga akkoord dat HES Consultancy International mijn naam, organisatie en e-mailadres opslaat en gebruikt om contact met mij op te nemen over dit rapport en gerelateerde diensten. Ik kan mijn toestemming te allen tijde intrekken via mbhes@hes-consultancy-international.com.'
              : 'I agree that HES Consultancy International stores my name, organization and email address and uses them to contact me about this report and related services. I can withdraw my consent at any time via mbhes@hes-consultancy-international.com.'}
          </ConsentCheckbox>

          {/* Checkbox 2 — Rapport delen (verplicht) */}
          <ConsentCheckbox checked={consentReportShare} onChange={setConsentReportShare} required>
            {nl
              ? 'Ik ga akkoord dat HES Consultancy International een kopie van mijn rapport ontvangt voor kwaliteits- en opvolgingsdoeleinden.'
              : 'I agree that HES Consultancy International receives a copy of my report for quality and follow-up purposes.'}
          </ConsentCheckbox>

          {/* Checkbox 3 — Commerciele opvolging (optioneel) */}
          <ConsentCheckbox checked={consentFollowup} onChange={setConsentFollowup}>
            {nl
              ? 'Ik sta open voor een vrijblijvend gesprek met HES Consultancy International over de uitkomsten van dit rapport.'
              : 'I am open to a no-obligation conversation with HES Consultancy International about the results of this report.'}
          </ConsentCheckbox>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || submitting}
          className="w-full py-3.5 rounded-lg text-sm font-bold text-white transition-all
                     disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
          style={{ backgroundColor: isValid ? theme.colors.primary : theme.colors.textDim }}
        >
          {submitting
            ? (nl ? 'Bezig...' : 'Processing...')
            : (nl ? 'Bekijk mijn rapport →' : 'View my report →')}
        </button>

        <p className="text-[11px] text-brand-text-dim text-center leading-relaxed">
          {nl
            ? 'Uw gegevens worden alleen gebruikt voor de doeleinden waarvoor u toestemming geeft. U kunt uw toestemming te allen tijde intrekken via mbhes@hes-consultancy-international.com.'
            : 'Your data is only used for the purposes you consent to. You can withdraw your consent at any time via mbhes@hes-consultancy-international.com.'}
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
