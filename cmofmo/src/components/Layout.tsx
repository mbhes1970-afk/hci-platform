import { useTheme } from '../themes/ThemeProvider';
import { LanguageToggle } from './LanguageToggle';

const NAV_LINKS = [
  { href: '/eu-entry', label: 'EU Market Entry' },
  { href: '/growth', label: 'Partners' },
  { href: '/compliance', label: 'Compliance' },
  { href: '/quickscan', label: 'CMO\u2192FMO' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between
                       bg-brand-bg/90 backdrop-blur-md border-b border-brand-border">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-3">
            <img src={theme.logoUrl} alt={theme.name} className="h-8" />
          </a>
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs px-3 py-1.5 rounded-lg text-brand-text-dim hover:text-brand-text-bright
                           hover:bg-brand-bg-elevated transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          <a
            href="https://calendly.com/mbhes1970/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex text-xs px-4 py-1.5 rounded-lg bg-brand-primary text-black
                       font-medium hover:bg-brand-primary-light transition-colors"
          >
            Plan gesprek
          </a>
          <a href={`mailto:${theme.contactEmail}`}
             className="text-xs text-brand-text-dim hover:text-brand-text-bright transition-colors">
            Contact
          </a>
        </div>
      </nav>

      {/* Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-border px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brand-text-dim">
          <span>&copy; {new Date().getFullYear()} {theme.name}</span>
          <div className="flex items-center gap-4">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-brand-text-bright transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <a href={theme.websiteUrl} className="hover:text-brand-text-bright transition-colors" target="_blank" rel="noopener">
            {theme.websiteUrl.replace('https://', '').replace('www.', '')}
          </a>
        </div>
      </footer>
    </div>
  );
}
