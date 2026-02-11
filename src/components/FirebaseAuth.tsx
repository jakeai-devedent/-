'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { auth, GoogleAuthProvider } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!auth);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async () => {
    if (!auth) return;
    const { signInWithPopup } = await import('firebase/auth');
    await signInWithPopup(auth, new GoogleAuthProvider());
  };

  const logout = async () => {
    if (!auth) return;
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
  };

  return { user, loading, login, logout, isReady: !!auth };
}
