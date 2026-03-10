import type { Role } from './types';

export const ROLES: Role[] = [
  { id: 'ciso', label: { nl: 'CISO / Security Officer', en: 'CISO / Security Officer' }, icon: '🛡️',
    hook: { nl: 'Verantwoordelijk voor informatiebeveiliging en compliance-implementatie.', en: 'Responsible for information security and compliance implementation.' } },
  { id: 'cto', label: { nl: 'IT Director / CTO', en: 'IT Director / CTO' }, icon: '💻',
    hook: { nl: 'Technische beslissingen en architectuur — NIS2 en CRA vereisen actie.', en: 'Technical decisions and architecture — NIS2 and CRA require action.' } },
  { id: 'cio', label: { nl: 'Compliance / Privacy Officer', en: 'Compliance / Privacy Officer' }, icon: '📋',
    hook: { nl: 'Wet- en regelgeving, audits, DPO — AVG, NIS2, AI Act compliance.', en: 'Regulations, audits, DPO — GDPR, NIS2, AI Act compliance.' } },
  { id: 'ceo', label: { nl: 'Directie / Bestuurder', en: 'Management / Board' }, icon: '🎯',
    hook: { nl: 'Strategische beslissingen en risico — bestuurdersaansprakelijkheid onder NIS2.', en: 'Strategic decisions and risk — board liability under NIS2.' } },
  { id: 'coo', label: { nl: 'Project / Program Manager', en: 'Project / Program Manager' }, icon: '📊',
    hook: { nl: 'Implementatie en verandermanagement — van nulmeting naar compliant.', en: 'Implementation and change management — from baseline to compliant.' } },
  { id: 'cfo', label: { nl: 'Adviseur / Consultant', en: 'Advisor / Consultant' }, icon: '🔍',
    hook: { nl: 'Advies voor een klant of organisatie over compliance trajecten.', en: 'Advising a client or organization on compliance journeys.' } },
];

export const getRoleById = (id: string) => ROLES.find(r => r.id === id);
