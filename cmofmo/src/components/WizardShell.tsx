import React, { useEffect } from 'react';
import { useWizard } from '../hooks/useWizard';
import { useTheme } from '../themes/ThemeProvider';
import { useLanguage } from '../config/i18n';
import { t } from '../config/i18n';
import { RoleSelector } from './RoleSelector';
import { SectorSelector } from './SectorSelector';
import { OrgDetailsForm } from './OrgDetailsForm';
import { QuestionStep } from './QuestionStep';
import { LeadCaptureGate } from './LeadCaptureGate';
import { ReportPreview } from './ReportPreview';

const STEPS = [
  { key: 'wizard.step1', label: { nl: 'Uw rol', en: 'Your role' } },
  { key: 'wizard.step2', label: { nl: 'Sector', en: 'Sector' } },
  { key: 'wizard.step3', label: { nl: 'Organisatie', en: 'Organization' } },
  { key: 'wizard.step4q', label: { nl: 'Quickscan', en: 'Quickscan' } },
  { key: 'wizard.step5g', label: { nl: 'Gegevens', en: 'Details' } },
  { key: 'wizard.step6', label: { nl: 'Rapport', en: 'Report' } },
];

// Map wizard roles naar SignalMesh ICP's
const ICP_MAP: Record<string, string> = {
  ciso: 'icp3', cio: 'icp3', ceo: 'icp3',
  cto: 'icp1', cfo: 'icp2', coo: 'icp3',
};

export function WizardShell() {
  const { currentStep, totalSteps, nextStep, prevStep, canProceed, role, sector } = useWizard();
  const theme = useTheme();
  const { lang } = useLanguage();

  // SignalMesh integratie: update state bij elke wizard stap
  useEffect(() => {
    if (typeof window !== 'undefined' && window.__sm) {
      window.__sm.addIntent?.(5);
      if (role) window.__sm.selectICP?.(ICP_MAP[role] || 'icp3');
      if (sector) window.__sm.selectSector?.(sector);
    }
  }, [currentStep, role, sector]);

  const steps = [
    <RoleSelector key="role" />,
    <SectorSelector key="sector" />,
    <OrgDetailsForm key="org" />,
    <QuestionStep key="questions" />,
    <LeadCaptureGate key="leadgate" />,
    <ReportPreview key="report" />,
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-10 flex-wrap">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.key}>
            <div className={`
              flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-mono
              transition-all duration-300
              ${i === currentStep
                ? 'bg-brand-primary text-white font-bold'
                : i < currentStep
                  ? 'bg-brand-primary-dim text-brand-primary-light'
                  : 'bg-brand-bg-elevated text-brand-text-dim'
              }
            `}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current">
                {i < currentStep ? '✓' : i + 1}
              </span>
              <span className="hidden sm:inline">{step.label[lang]}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-4 sm:w-8 h-px ${i < currentStep ? 'bg-brand-primary' : 'bg-brand-border'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Current step content */}
      <div className="animate-fade-in" key={currentStep}>
        {steps[currentStep]}
      </div>

      {/* Navigation — niet tonen bij vragen (heeft eigen nav) en rapport */}
      {currentStep < 3 && (
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-5 py-2.5 rounded-lg text-sm font-medium border border-brand-border text-brand-text
                       hover:border-brand-primary-light hover:text-brand-text-bright
                       disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {t('wizard.back', lang)}
          </button>
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-white
                       disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            style={{ backgroundColor: canProceed() ? theme.colors.primary : theme.colors.textDim }}
          >
            {t('wizard.next', lang)}
          </button>
        </div>
      )}
    </div>
  );
}
