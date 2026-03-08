import type { Role } from './types';

export const ROLES: Role[] = [
  { id: 'ciso', label: { nl: 'CISO / Security Officer', en: 'CISO / Security Officer' }, icon: '\u{1F6E1}\uFE0F',
    hook: { nl: 'Verantwoordelijk voor informatiebeveiliging en compliance-implementatie.', en: 'Responsible for information security and compliance implementation.' } },
  { id: 'cto', label: { nl: 'IT Director / CTO', en: 'IT Director / CTO' }, icon: '\uD83D\uDCBB',
    hook: { nl: 'Technische beslissingen en architectuur \u2014 NIS2 en CRA vereisen actie.', en: 'Technical decisions and architecture \u2014 NIS2 and CRA require action.' } },
  { id: 'cio', label: { nl: 'Compliance / Privacy Officer', en: 'Compliance / Privacy Officer' }, icon: '\uD83D\uDCCB',
    hook: { nl: 'Wet- en regelgeving, audits, DPO \u2014 AVG, NIS2, AI Act compliance.', en: 'Regulations, audits, DPO \u2014 GDPR, NIS2, AI Act compliance.' } },
  { id: 'ceo', label: { nl: 'Directie / Bestuurder', en: 'Management / Board' }, icon: '\uD83C\uDFAF',
    hook: { nl: 'Strategische beslissingen en risico \u2014 bestuurdersaansprakelijkheid onder NIS2.', en: 'Strategic decisions and risk \u2014 board liability under NIS2.' } },
  { id: 'coo', label: { nl: 'Project / Program Manager', en: 'Project / Program Manager' }, icon: '\uD83D\uDCCA',
    hook: { nl: 'Implementatie en verandermanagement \u2014 van nulmeting naar compliant.', en: 'Implementation and change management \u2014 from baseline to compliant.' } },
  { id: 'cfo', label: { nl: 'Adviseur / Consultant', en: 'Advisor / Consultant' }, icon: '\uD83D\uDD0D',
    hook: { nl: 'Advies voor een klant of organisatie over compliance trajecten.', en: 'Advising a client or organization on compliance journeys.' } },
];

export const getRoleById = (id: string) => ROLES.find(r => r.id === id);
