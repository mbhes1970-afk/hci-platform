import { create } from 'zustand';
import type { IcpId, SectorId } from '../config/types';

export type Tier = 'cold' | 'warm' | 'hot' | 'tier1';

export interface Signal {
  type: 'utm' | 'return_visitor' | 'ip_match' | 'icp_select' | 'ip_bonus' |
        'story_section' | 'qualifier_q1' | 'qualifier_q2' | 'qualifier_output' |
        'cta_click' | 'quickscan_start' | 'quickscan_complete' | 'email_captured';
  fitDelta?: number;
  intentDelta?: number;
  meta?: Record<string, unknown>;
}

interface IntelligenceState {
  fitScore: number;
  intentScore: number;
  dealFlowScore: number;
  tier: Tier;

  storySectionsRead: number;
  qualifierCompleted: boolean;
  ctaClicked: boolean;
  isReturnVisitor: boolean;

  selectedIcp: IcpId | null;
  selectedSector: SectorId | null;
  utmSource: string | null;
  utmCampaign: string | null;
  utmMedium: string | null;

  qualifierAnswers: Record<string, string>;
  signals: Signal[];

  addSignal: (signal: Signal) => void;
  recalculate: () => void;
  setIcp: (icp: IcpId) => void;
  setSector: (sector: SectorId) => void;
  setQualifierAnswer: (key: string, value: string) => void;
  markQualifierCompleted: () => void;
  markCtaClicked: () => void;
  incrementStorySections: () => void;
}

function calculateTier(intentScore: number): Tier {
  if (intentScore >= 90) return 'tier1';
  if (intentScore >= 70) return 'hot';
  if (intentScore >= 40) return 'warm';
  return 'cold';
}

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

function parseUtmSignals(): Signal[] {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_source');
  const signals: Signal[] = [];

  if (source === 'linkedin') signals.push({ type: 'utm', intentDelta: 20, meta: { source } });
  else if (source === 'email') signals.push({ type: 'utm', intentDelta: 15, meta: { source } });
  else if (source === 'whatsapp') signals.push({ type: 'utm', intentDelta: 12, meta: { source } });
  else if (source === 'event') signals.push({ type: 'utm', intentDelta: 8, meta: { source } });

  return signals;
}

function checkReturnVisitor(): boolean {
  try {
    const visited = localStorage.getItem('hci_visited');
    if (visited) return true;
    localStorage.setItem('hci_visited', new Date().toISOString());
  } catch { /* localStorage unavailable */ }
  return false;
}

export const useIntelligence = create<IntelligenceState>((set, get) => {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');
  const utmCampaign = params.get('utm_campaign');
  const utmMedium = params.get('utm_medium');
  const isReturn = checkReturnVisitor();
  const initialSignals = parseUtmSignals();

  if (isReturn) {
    initialSignals.push({ type: 'return_visitor', intentDelta: 15 });
  }

  // Calculate initial scores
  let initFit = 0;
  let initIntent = 0;
  for (const s of initialSignals) {
    initFit += s.fitDelta || 0;
    initIntent += s.intentDelta || 0;
  }

  return {
    fitScore: clamp(initFit, 0, 100),
    intentScore: clamp(initIntent, 0, 100),
    dealFlowScore: clamp(initFit * 0.4 + initIntent * 0.6, 0, 100),
    tier: calculateTier(initIntent),

    storySectionsRead: 0,
    qualifierCompleted: false,
    ctaClicked: false,
    isReturnVisitor: isReturn,

    selectedIcp: null,
    selectedSector: (params.get('sector') as SectorId) || null,
    utmSource,
    utmCampaign,
    utmMedium,

    qualifierAnswers: {},
    signals: initialSignals,

    addSignal: (signal) => {
      const state = get();
      const newFit = clamp(state.fitScore + (signal.fitDelta || 0), 0, 100);
      const newIntent = clamp(state.intentScore + (signal.intentDelta || 0), 0, 100);
      const newDealFlow = clamp(newFit * 0.4 + newIntent * 0.6, 0, 100);

      set({
        fitScore: newFit,
        intentScore: newIntent,
        dealFlowScore: newDealFlow,
        tier: calculateTier(newIntent),
        signals: [...state.signals, signal],
      });

      // Fire Slack alert when crossing warm threshold
      if (state.intentScore < 40 && newIntent >= 40) {
        fireSlackAlert(get());
      }
    },

    recalculate: () => {
      const state = get();
      const newDealFlow = clamp(state.fitScore * 0.4 + state.intentScore * 0.6, 0, 100);
      set({
        dealFlowScore: newDealFlow,
        tier: calculateTier(state.intentScore),
      });
    },

    setIcp: (icp) => {
      set({ selectedIcp: icp });
      get().addSignal({ type: 'icp_select', fitDelta: 20, intentDelta: 10, meta: { icp } });
    },

    setSector: (sector) => {
      set({ selectedSector: sector });
    },

    setQualifierAnswer: (key, value) => {
      const state = get();
      set({ qualifierAnswers: { ...state.qualifierAnswers, [key]: value } });
    },

    markQualifierCompleted: () => {
      set({ qualifierCompleted: true });
      get().addSignal({ type: 'qualifier_output', intentDelta: 20 });
    },

    markCtaClicked: () => {
      if (!get().ctaClicked) {
        set({ ctaClicked: true });
        get().addSignal({ type: 'cta_click', intentDelta: 30 });
      }
    },

    incrementStorySections: () => {
      const state = get();
      if (state.storySectionsRead < 5) {
        set({ storySectionsRead: state.storySectionsRead + 1 });
        get().addSignal({ type: 'story_section', intentDelta: 5, meta: { index: state.storySectionsRead + 1 } });
      }
    },
  };
});

// SignalMesh alert — fires to Netlify function which proxies to n8n + Slack
async function fireSlackAlert(state: IntelligenceState) {
  const sessionId = `sm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const payload = {
    icpType: state.selectedIcp || 'unknown',
    sector: state.selectedSector || 'unknown',
    tier: state.tier,
    fitScore: state.fitScore,
    intentScore: state.intentScore,
    dealFlowScore: Math.round(state.dealFlowScore),
    qualifierAnswers: state.qualifierAnswers,
    storySectionsRead: state.storySectionsRead,
    utmSource: state.utmSource || 'direct',
    isReturnVisitor: state.isReturnVisitor,
    deviceType: /Mobi/.test(navigator.userAgent) ? 'mobile' : 'desktop',
    language: navigator.language?.slice(0, 2) || 'nl',
    sessionId,
  };

  try {
    // Primary: Netlify function (proxies to n8n + Slack)
    await fetch('/.netlify/functions/signalmesh-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('[SignalMesh] Alert failed:', err);
  }
}

// PocketBase deal push
export async function pushDealToPocketBase(data: {
  orgName: string;
  sector: string;
  role: string;
  email: string;
  scores: Record<string, number>;
}) {
  const state = useIntelligence.getState();
  const pbUrl = import.meta.env.VITE_POCKETBASE_URL || 'https://api.hes-consultancy-international.com';

  const payload = {
    organisatie: data.orgName,
    sector: data.sector,
    rol: data.role,
    email: data.email,
    fit_score: state.fitScore,
    intent_score: state.intentScore,
    deal_flow_score: Math.round(state.dealFlowScore),
    tier: state.tier,
    utm_source: state.utmSource || 'direct',
    qualifier_answers: state.qualifierAnswers,
    rapport_scores: data.scores,
    status: 'new',
  };

  try {
    await fetch(`${pbUrl}/api/collections/deals/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('[SignalMesh] PocketBase push failed:', err);
  }
}
