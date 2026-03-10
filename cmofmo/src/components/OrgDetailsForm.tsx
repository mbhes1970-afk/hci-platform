import { useWizard } from '../hooks/useWizard';
import { useLanguage, t } from '../config/i18n';
import { useCallback, useRef, useState } from 'react';

export function OrgDetailsForm() {
  const wizard = useWizard();
  const { lang } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') return;
    // Simpele tekst-extractie stub. In productie: pdf.js gebruiken.
    wizard.setPdfText(`[PDF geupload: ${file.name}]`, file.name);
  }, [wizard]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div>
      <h2 className="font-serif text-2xl text-brand-text-bright mb-2">
        {t('org.title', lang)}
      </h2>

      <div className="space-y-4 mt-6">
        {/* Organisatienaam */}
        <div>
          <label className="block text-xs font-medium text-brand-text-dim mb-1.5">{t('org.name', lang)} *</label>
          <input
            type="text"
            value={wizard.orgName}
            onChange={(e) => wizard.setOrgName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-brand-bg-elevated border border-brand-border
                       text-brand-text-bright text-sm placeholder:text-brand-text-dim
                       focus:outline-none focus:border-brand-primary transition-colors"
            placeholder={lang === 'nl' ? 'Bijv. Gemeente Amsterdam' : 'E.g. City of Amsterdam'}
          />
        </div>

        {/* Contact naam */}
        <div>
          <label className="block text-xs font-medium text-brand-text-dim mb-1.5">{t('org.contact', lang)}</label>
          <input
            type="text"
            value={wizard.contactName}
            onChange={(e) => wizard.setContactName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-brand-bg-elevated border border-brand-border
                       text-brand-text-bright text-sm placeholder:text-brand-text-dim
                       focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-brand-text-dim mb-1.5">{t('org.email', lang)} *</label>
          <input
            type="email"
            value={wizard.contactEmail}
            onChange={(e) => wizard.setContactEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-brand-bg-elevated border border-brand-border
                       text-brand-text-bright text-sm placeholder:text-brand-text-dim
                       focus:outline-none focus:border-brand-primary transition-colors"
            placeholder="naam@organisatie.nl"
          />
        </div>

        {/* Functietitel */}
        <div>
          <label className="block text-xs font-medium text-brand-text-dim mb-1.5">{t('org.role', lang)}</label>
          <input
            type="text"
            value={wizard.contactRole}
            onChange={(e) => wizard.setContactRole(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-brand-bg-elevated border border-brand-border
                       text-brand-text-bright text-sm placeholder:text-brand-text-dim
                       focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        {/* PDF Upload */}
        <div>
          <label className="block text-xs font-medium text-brand-text-dim mb-1.5">{t('org.upload', lang)}</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
              ${dragOver ? 'border-brand-primary bg-brand-primary-dim' : 'border-brand-border hover:border-brand-primary-light'}
            `}
          >
            <input ref={fileRef} type="file" accept=".pdf" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

            {wizard.pdfFileName ? (
              <div>
                <span className="text-2xl">📄</span>
                <p className="text-sm text-brand-primary-light font-medium mt-2">{wizard.pdfFileName}</p>
                <p className="text-xs text-brand-text-dim mt-1">{lang === 'nl' ? 'Klik om te wijzigen' : 'Click to change'}</p>
              </div>
            ) : (
              <div>
                <span className="text-2xl">⬆️</span>
                <p className="text-sm text-brand-text mt-2">{t('org.uploadHint', lang)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
