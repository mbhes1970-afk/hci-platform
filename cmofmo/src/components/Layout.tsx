import { useTheme } from '../themes/ThemeProvider';
import { LanguageToggle } from './LanguageToggle';

export function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between
                       bg-brand-bg/90 backdrop-blur-md border-b border-brand-border">
        <div className="flex items-center gap-3">
          <div className="text-sm font-bold text-brand-text-bright">{theme.name}</div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-primary-dim text-brand-primary-light">
            CMO\u2192FMO
          </span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          <a href={`mailto:${theme.contactEmail}`}
             className="text-xs text-brand-text-dim hover:text-brand-text-bright transition-colors">
            Contact
          </a>
        </div>
      </nav>

      {/* Content */}
      <main className="pb-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-border px-6 py-4 flex items-center justify-between text-xs text-brand-text-dim">
        <span>\u00a9 {new Date().getFullYear()} {theme.name}</span>
        <span>
          <a href={theme.websiteUrl} className="hover:text-brand-text-bright transition-colors" target="_blank" rel="noopener">
            {theme.websiteUrl.replace('https://', '')}
          </a>
        </span>
      </footer>
    </div>
  );
}
