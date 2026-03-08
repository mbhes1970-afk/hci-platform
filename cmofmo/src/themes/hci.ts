export interface ThemeConfig {
  id: string;
  name: string;
  tagline: string;
  domain: string;
  logoUrl: string;
  logoWhiteUrl: string;
  contactEmail: string;
  websiteUrl: string;
  colors: {
    primary: string; primaryLight: string; primaryDim: string;
    accent: string; bg: string; bgCard: string; bgElevated: string;
    border: string; text: string; textDim: string;
    textBright: string; white: string; success: string;
    warning: string; error: string;
  };
  tone: {
    style: string;
    language: string;
    ctaLabel: { nl: string; en: string };
  };
  contact: {
    email: string;
    phone: string;
    phoneDisplay: string;
    calendlyUrl: string;
    website: string;
  };
  report: {
    headerColor: string;
    footerText: string;
    disclaimer: string;
  };
}

export const hciTheme: ThemeConfig = {
  id: 'hci',
  name: 'HES Consultancy International',
  tagline: 'From Strategy to First Customer',
  domain: 'cmofmo.hes-consultancy-international.com',
  logoUrl: '/logos/hci-logo-gold.svg',
  logoWhiteUrl: '/logos/hci-logo-white.svg',
  contactEmail: 'mbhes@hes-consultancy-international.com',
  websiteUrl: 'https://hes-consultancy-international.com',
  colors: {
    primary: '#c8a55a', primaryLight: '#e0c882', primaryDim: 'rgba(200,165,90,0.12)',
    accent: '#6C5CE7', bg: '#08090c', bgCard: '#13151c', bgElevated: '#1c1e28',
    border: 'rgba(255,255,255,0.06)', text: '#a8a6b4', textDim: '#5e5d6a',
    textBright: '#f0eef5', white: '#ffffff', success: '#059669',
    warning: '#f59e0b', error: '#ef4444',
  },
  tone: {
    style: 'premium-advisory',
    language: 'professioneel, adviserend, 30+ jaar expertise',
    ctaLabel: { nl: 'Genereer uw rapport', en: 'Generate your report' },
  },
  contact: {
    email: 'mbhes@hes-consultancy-international.com',
    phone: '+31612345678',
    phoneDisplay: '+31 6 12 34 56 78',
    calendlyUrl: 'https://calendly.com/hci-mike',
    website: 'https://www.hes-consultancy-international.com',
  },
  report: {
    headerColor: '#c8a55a',
    footerText: 'HES Consultancy International \u00b7 hes-consultancy-international.com',
    disclaimer: 'Dit rapport is vertrouwelijk en opgesteld op basis van uw antwoorden.',
  },
};
