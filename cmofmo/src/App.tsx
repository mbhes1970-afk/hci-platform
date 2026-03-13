import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './themes/ThemeProvider';
import { LanguageContext } from './config/i18n';
import { Layout } from './components/Layout';
import { ScoreIndicator } from './components/ScoreIndicator';
import type { Language } from './config/types';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const EuEntryPage = lazy(() => import('./pages/EuEntryPage').then(m => ({ default: m.EuEntryPage })));
const GrowthPage = lazy(() => import('./pages/GrowthPage').then(m => ({ default: m.GrowthPage })));
const CompliancePage = lazy(() => import('./pages/CompliancePage').then(m => ({ default: m.CompliancePage })));
const WizardShell = lazy(() => import('./components/WizardShell').then(m => ({ default: m.WizardShell })));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="font-mono text-sm text-brand-text-dim">Laden...</div>
    </div>
  );
}

function getInitialLang(): Language {
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang === 'en' || urlLang === 'nl') return urlLang;
  const stored = localStorage.getItem('hci-lang');
  if (stored === 'en' || stored === 'nl') return stored;
  return 'nl';
}

export default function App() {
  const [lang, setLangState] = useState<Language>(getInitialLang);

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('hci-lang', l);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', l);
      window.history.replaceState({}, '', url.toString());
    } catch (e) { /* ignore */ }
  };

  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageContext.Provider value={{ lang, setLang }}>
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/eu-entry" element={<EuEntryPage />} />
                <Route path="/growth" element={<GrowthPage />} />
                <Route path="/compliance" element={<CompliancePage />} />
                <Route path="/compliance/:sectorId" element={<CompliancePage />} />
                <Route path="/quickscan" element={<WizardShell />} />
              </Routes>
            </Suspense>
          </Layout>
          <ScoreIndicator />
        </LanguageContext.Provider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
