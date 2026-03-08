import { createContext, useContext } from 'react';
import type { Language } from './types';

export const translations = {
  // Wizard
  'wizard.step1': { nl: 'Uw rol', en: 'Your role' },
  'wizard.step2': { nl: 'Sector', en: 'Sector' },
  'wizard.step3': { nl: 'Organisatie', en: 'Organization' },
  'wizard.step4': { nl: 'Rapport', en: 'Report' },
  'wizard.back': { nl: 'Terug', en: 'Back' },
  'wizard.next': { nl: 'Volgende', en: 'Next' },
  'wizard.generate': { nl: 'Genereer rapport', en: 'Generate report' },

  // Role selector
  'role.title': { nl: 'Wat is uw rol?', en: 'What is your role?' },
  'role.subtitle': { nl: 'Selecteer uw functie voor een gepersonaliseerd rapport.', en: 'Select your role for a personalized report.' },

  // Sector selector
  'sector.title': { nl: 'In welke sector opereert uw organisatie?', en: 'What sector does your organization operate in?' },
  'sector.subtitle': { nl: 'Dit bepaalt de relevante regelgeving en benchmarks.', en: 'This determines relevant regulations and benchmarks.' },

  // Org form
  'org.title': { nl: 'Over uw organisatie', en: 'About your organization' },
  'org.name': { nl: 'Organisatienaam', en: 'Organization name' },
  'org.contact': { nl: 'Uw naam', en: 'Your name' },
  'org.email': { nl: 'E-mailadres', en: 'Email address' },
  'org.role': { nl: 'Uw functietitel', en: 'Your job title' },
  'org.upload': { nl: 'Upload jaarverslag of beleidsdocument (optioneel)', en: 'Upload annual report or policy document (optional)' },
  'org.uploadHint': { nl: 'PDF, max 10MB. Verbetert de personalisatie van uw rapport.', en: 'PDF, max 10MB. Improves personalization of your report.' },

  // Report
  'report.generating': { nl: 'Uw rapport wordt gegenereerd...', en: 'Generating your report...' },
  'report.ready': { nl: 'Uw rapport is klaar', en: 'Your report is ready' },
  'report.download': { nl: 'Download PDF', en: 'Download PDF' },
  'report.scores': { nl: 'Dimensiescores', en: 'Dimension scores' },
  'report.cmoFmo': { nl: 'CMO naar FMO Transformatie', en: 'CMO to FMO Transformation' },

  // Email gate
  'gate.title': { nl: 'Ontvang het volledige rapport', en: 'Get the full report' },
  'gate.subtitle': { nl: 'Vul uw e-mail in om het complete PDF rapport te downloaden.', en: 'Enter your email to download the complete PDF report.' },
  'gate.consent': { nl: 'Ik geef toestemming om benaderd te worden over de resultaten.', en: 'I consent to being contacted about the results.' },
  'gate.submit': { nl: 'Verstuur & download', en: 'Submit & download' },

  // General
  'lang.switch': { nl: 'EN', en: 'NL' },
  'footer.powered': { nl: 'Powered by', en: 'Powered by' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Language): string {
  return translations[key]?.[lang] || key;
}

// React context voor taal
export const LanguageContext = createContext<{
  lang: Language;
  setLang: (l: Language) => void;
}>({ lang: 'nl', setLang: () => {} });

export const useLanguage = () => useContext(LanguageContext);
