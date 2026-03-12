import { useState, useEffect, useCallback } from 'react';
import pb from '../config/pb';

export interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  phone: string;
  notes: string;
  created: string;
  updated: string;
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const records = await pb.collection('contacts').getFullList<Contact>({
        sort: '-created',
      });
      setContacts(records);
    } catch (e) {
      console.error('Failed to fetch contacts:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const createContact = useCallback(async (data: Partial<Contact>) => {
    const record = await pb.collection('contacts').create<Contact>(data);
    setContacts(prev => [record, ...prev]);
    return record;
  }, []);

  return { contacts, loading, refresh: fetch, createContact };
}
