import { create } from 'zustand';
import type { ReportData } from '../config/types';

interface ReportState {
  report: ReportData | null;
  isLoading: boolean;
  error: string | null;
  mockMode: boolean;

  setReport: (r: ReportData) => void;
  setLoading: (l: boolean) => void;
  setError: (e: string | null) => void;
  setMockMode: (m: boolean) => void;
  reset: () => void;
}

export const useReport = create<ReportState>((set) => ({
  report: null,
  isLoading: false,
  error: null,
  mockMode: true, // Start altijd in mock mode

  setReport: (report) => set({ report, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setMockMode: (mockMode) => set({ mockMode }),
  reset: () => set({ report: null, isLoading: false, error: null }),
}));
