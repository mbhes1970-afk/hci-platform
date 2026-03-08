import type { IcpConfig } from './types';

export const ICPS: IcpConfig[] = [
  { id: 'icp1',
    label: { nl: 'Tech / ISV / Startup', en: 'Tech / ISV / Startup' },
    roles: ['ceo', 'cto'],
    sectorRequired: false },
  { id: 'icp2',
    label: { nl: 'IT-partner / Reseller', en: 'IT Partner / Reseller' },
    roles: ['ceo', 'cto', 'coo'],
    sectorRequired: false },
  { id: 'icp3',
    label: { nl: 'Eindklant', en: 'End Customer' },
    roles: ['ciso', 'cto', 'cio', 'cfo', 'ceo', 'coo'],
    sectorRequired: true },
];
