export const PIPELINE_STAGES = [
  { id: 'suspect', label: 'Suspect', color: '#6b7280' },
  { id: 'prospect', label: 'Prospect', color: '#8b5cf6' },
  { id: 'qualified', label: 'Qualified', color: '#2563eb' },
  { id: 'proposal', label: 'Proposal', color: '#f59e0b' },
  { id: 'won', label: 'Won', color: '#059669' },
  { id: 'lost', label: 'Lost', color: '#ef4444' },
] as const;

export type Stage = typeof PIPELINE_STAGES[number]['id'];
