import type { Sector } from './types';

export const SECTORS: Sector[] = [
  { id: 's01', icon: '\uD83C\uDFDB\uFE0F', color: '#1e3a5f', regulations: ['BIO','NIS2','AVG/GDPR','DigiD'], countries: ['NL','BE'],
    label: { nl: 'Overheid & Publieke Sector', en: 'Government & Public Sector' },
    subtitle: { nl: 'Gemeenten, provincies, uitvoeringsorganisaties', en: 'Municipalities, provinces, agencies' } },
  { id: 's02', icon: '\uD83C\uDFE5', color: '#065f46', regulations: ['NEN 7510','NIS2','AVG/GDPR','DPIA'], countries: ['NL'],
    label: { nl: 'Zorg & Gezondheid', en: 'Healthcare' },
    subtitle: { nl: 'Ziekenhuizen, GGZ, VVT, huisartsen', en: 'Hospitals, mental health, elderly care' } },
  { id: 's03', icon: '\uD83D\uDCBB', color: '#3730a3', regulations: ['ISO 27001','SOC2','NIS2','CRA'], countries: ['NL','EU'],
    label: { nl: 'Technologie & Software', en: 'Technology & Software' },
    subtitle: { nl: 'SaaS, managed services, hosting', en: 'SaaS, managed services, hosting' } },
  { id: 's04', icon: '\uD83C\uDFE2', color: '#78350f', regulations: ['ISO 27001','NIS2','AVG/GDPR'], countries: ['NL','EU'],
    label: { nl: 'Enterprise & MKB', en: 'Enterprise & SMB' },
    subtitle: { nl: 'Multinationals, supply chain, MKB', en: 'Multinationals, supply chain, SMB' } },
  { id: 's05', icon: '\uD83C\uDFE6', color: '#92400e', regulations: ['DORA','PSD2','NIS2','AVG/GDPR'], countries: ['NL','EU'],
    label: { nl: 'Finance & Banking', en: 'Finance & Banking' },
    subtitle: { nl: 'Banken, verzekeraars, fintechs, pensioenen', en: 'Banks, insurers, fintechs, pensions' } },
  { id: 's06', icon: '\uD83D\uDCE1', color: '#134e4a', regulations: ['NIS2','ENISA','Telecomwet','CER'], countries: ['NL','EU'],
    label: { nl: 'Telecom & Kritieke Infra', en: 'Telecom & Critical Infrastructure' },
    subtitle: { nl: 'Telecom, energie, water, OT', en: 'Telecom, energy, water, OT' } },
  { id: 's07', icon: '🚛', color: '#60a5fa', regulations: ['NIS2','eFTI','AVG','ADR'], countries: ['NL','BE','DE','FR'],
    label: { nl: 'Logistiek & Supply Chain', en: 'Logistics & Supply Chain' },
    subtitle: { nl: 'NIS2, eFTI, AVG — digitale ketenbeveiliging', en: 'NIS2, eFTI, GDPR — digital chain security' } },
  { id: 's08', icon: '⚖️', color: '#4ade80', regulations: ['AI Act','NIS2','DORA','AVG'], countries: ['NL','DE','BE','UK'],
    label: { nl: 'Legal & LegalTech', en: 'Legal & LegalTech' },
    subtitle: { nl: 'AI Act, NIS2, DORA — hoog-risico AI en regeldruk', en: 'AI Act, NIS2, DORA — high-risk AI and regulation' } },
];

export const getSectorById = (id: string) => SECTORS.find(s => s.id === id);
