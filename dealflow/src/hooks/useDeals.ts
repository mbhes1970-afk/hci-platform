import { useState, useEffect, useCallback } from 'react';
import pb from '../config/pb';
import type { Stage } from '../config/stages';

export interface Deal {
  id: string;
  name: string;
  company: string;
  stage: Stage;
  score: number;
  value: number;
  contact_email: string;
  notes: string;
  created: string;
  updated: string;
}

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const records = await pb.collection('deals').getFullList<Deal>({
        sort: '-created',
      });
      setDeals(records);
    } catch (e) {
      console.error('Failed to fetch deals:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStage = useCallback(async (id: string, stage: Stage) => {
    await pb.collection('deals').update(id, { stage });
    setDeals(prev => prev.map(d => d.id === id ? { ...d, stage } : d));
  }, []);

  const createDeal = useCallback(async (data: Partial<Deal>) => {
    const record = await pb.collection('deals').create<Deal>(data);
    setDeals(prev => [record, ...prev]);
    return record;
  }, []);

  return { deals, loading, refresh: fetch, updateStage, createDeal };
}
