export type Language = 'nl' | 'en';
export type RoleId = 'ciso' | 'cto' | 'cio' | 'cfo' | 'ceo' | 'coo';
export type SectorId = 's01' | 's02' | 's03' | 's04' | 's05' | 's06' | 's07' | 's08';
export type IcpId = 'icp1' | 'icp2' | 'icp3';

export interface Role {
  id: RoleId;
  label: { nl: string; en: string };
  hook: { nl: string; en: string };
  icon: string;
}

export interface Sector {
  id: SectorId;
  label: { nl: string; en: string };
  subtitle: { nl: string; en: string };
  icon: string;
  color: string;
  regulations: string[];
  countries: string[];
}

export interface IcpConfig {
  id: IcpId;
  label: { nl: string; en: string };
  roles: RoleId[];
  sectorRequired: boolean;
}

export interface WizardData {
  role: RoleId | null;
  sector: SectorId | null;
  orgName: string;
  contactName: string;
  contactEmail: string;
  contactRole: string;
  pdfText: string | null;
  pdfFileName: string | null;
  language: Language;
  icp: IcpId | null;
  consentProcessing: boolean;
  consentReportShare: boolean;
  consentFollowup: boolean;
}

export interface DimensionScore {
  id: string;
  label: { nl: string; en: string };
  score: number;
  maxScore: number;
  color: 'green' | 'amber' | 'red';
  className: string;
}

export interface CmoFmoRow {
  dimension: { nl: string; en: string };
  cmo: { nl: string; en: string };
  fmo: { nl: string; en: string };
  impact: { nl: string; en: string };
}

export interface ReportData {
  orgName: string;
  sectorId: SectorId;
  roleId: RoleId;
  scores: DimensionScore[];
  cmoFmoRows: CmoFmoRow[];
  executiveSummary: { nl: string; en: string };
  sectorContext: { nl: string; en: string };
  orgFindings: { nl: string; en: string };
  investmentRange: string;
  timeline: string;
  generatedAt: string;
}
