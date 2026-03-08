export const chunkworksTheme = {
  id: 'cw' as const,
  name: 'ChunkWorks',
  tagline: 'Simple. Fast. Quantum-Secure.',
  domain: 'scan.chunkworks.eu',
  logoUrl: '/logos/chunkworks-logo.svg',
  logoWhiteUrl: '/logos/chunkworks-logo-white.svg',
  contactEmail: 'info@chunkworks.io',
  websiteUrl: 'https://chunkworks.io',
  colors: {
    primary: '#6C5CE7', primaryLight: '#a78bfa', primaryDim: 'rgba(108,92,231,0.12)',
    accent: '#a78bfa', bg: '#08090c', bgCard: '#13151c', bgElevated: '#1c1e28',
    border: 'rgba(255,255,255,0.06)', text: '#a8a6b4', textDim: '#5e5d6a',
    textBright: '#f0eef5', white: '#ffffff', success: '#059669',
    warning: '#f59e0b', error: '#ef4444',
  },
  tone: {
    style: 'tech-forward',
    language: 'direct, helder, ontwikkelaar-vriendelijk',
    ctaLabel: { nl: 'Start quickscan', en: 'Start quickscan' },
  },
};
export type ThemeConfig = typeof chunkworksTheme;
