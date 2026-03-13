import { useState, useEffect, useCallback } from 'react';
import pb from '../config/pb';

export type Role = 'admin' | 'partner' | 'viewer';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

function getUser(): AuthUser | null {
  if (!pb.authStore.isValid || !pb.authStore.record) return null;
  const r = pb.authStore.record;
  return {
    id: r.id,
    email: r.email ?? '',
    name: r.name ?? r.email ?? '',
    role: (r.role as Role) || 'viewer',
  };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(getUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = pb.authStore.onChange(() => setUser(getUser()));
    return () => unsub();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await pb.collection('users').authWithPassword(email, password);
      setUser(getUser());
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Login mislukt';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    pb.authStore.clear();
    setUser(null);
  }, []);

  return { user, loading, error, login, logout };
}
