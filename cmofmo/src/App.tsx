import { useState } from 'react';
import { ThemeProvider } from './themes/ThemeProvider';
import { LanguageContext } from './config/i18n';
import { Layout } from './components/Layout';
import { WizardShell } from './components/WizardShell';
import type { Language } from './config/types';

export default function App() {
  const [lang, setLang] = useState<Language>('nl');

  return (
    <ThemeProvider>
      <LanguageContext.Provider value={{ lang, setLang }}>
        <Layout>
          <WizardShell />
        </Layout>
      </LanguageContext.Provider>
    </ThemeProvider>
  );
}
