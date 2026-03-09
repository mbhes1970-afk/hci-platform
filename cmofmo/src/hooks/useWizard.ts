import { create } from 'zustand';
import type { RoleId, SectorId, Language, WizardData } from '../config/types';

interface WizardState extends WizardData {
  currentStep: number;
  totalSteps: number;
  answers: Record<number, number>; // vraag-index → score (0-3)

  // Actions
  setRole: (role: RoleId) => void;
  setSector: (sector: SectorId) => void;
  setOrgName: (name: string) => void;
  setContactName: (name: string) => void;
  setContactEmail: (email: string) => void;
  setContactRole: (role: string) => void;
  setPdfText: (text: string | null, fileName: string | null) => void;
  setLanguage: (lang: Language) => void;
  setConsent: (consent: boolean) => void;
  setAnswer: (questionIndex: number, score: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  canProceed: () => boolean;
  reset: () => void;
}

const initialData: WizardData = {
  role: null,
  sector: null,
  orgName: '',
  contactName: '',
  contactEmail: '',
  contactRole: '',
  pdfText: null,
  pdfFileName: null,
  language: 'nl',
  icp: 'icp3',
  consent: false,
};

export const useWizard = create<WizardState>((set, get) => ({
  ...initialData,
  currentStep: 0,
  totalSteps: 6, // 0=rol, 1=sector, 2=org, 3=vragen, 4=leadgate, 5=rapport
  answers: {},

  setRole: (role) => set({ role }),
  setSector: (sector) => set({ sector, answers: {} }), // Reset antwoorden bij sectorwissel
  setOrgName: (orgName) => set({ orgName }),
  setContactName: (contactName) => set({ contactName }),
  setContactEmail: (contactEmail) => set({ contactEmail }),
  setContactRole: (contactRole) => set({ contactRole }),
  setPdfText: (pdfText, pdfFileName) => set({ pdfText, pdfFileName }),
  setLanguage: (language) => set({ language }),
  setConsent: (consent) => set({ consent }),
  setAnswer: (questionIndex, score) => set((state) => ({
    answers: { ...state.answers, [questionIndex]: score },
  })),

  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps - 1) set({ currentStep: currentStep + 1 });
  },
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) set({ currentStep: currentStep - 1 });
  },
  goToStep: (step) => set({ currentStep: step }),

  canProceed: () => {
    const s = get();
    switch (s.currentStep) {
      case 0: return s.role !== null;
      case 1: return s.sector !== null;
      case 2: return s.orgName.trim().length > 0 && s.contactEmail.trim().length > 0;
      case 3: return Object.keys(s.answers).length >= 9; // alle 9 vragen beantwoord
      case 4: return s.contactName.trim().length > 0 && s.orgName.trim().length > 0 && s.contactEmail.trim().length > 0;
      default: return false;
    }
  },

  reset: () => set({ ...initialData, currentStep: 0, answers: {} }),
}));
