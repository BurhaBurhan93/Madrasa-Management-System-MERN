import { useEffect, useState } from 'react';
import { getCachedMadrasaInfo, setCachedMadrasaInfo, subscribeToMadrasaInfo } from '../lib/madrasaInfo';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

export default function useMadrasaInfo({ fetchRemote = false } = {}) {
  const [info, setInfo] = useState(() => getCachedMadrasaInfo());

  useEffect(() => {
    const unsubscribe = subscribeToMadrasaInfo(() => {
      setInfo(getCachedMadrasaInfo());
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!fetchRemote) return;

    let mounted = true;

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/madrasa-info`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) return;

        const data = await res.json();
        if (!mounted) return;

        setInfo(data);
        setCachedMadrasaInfo(data);
      } catch {
        // Keep using the cached version when the remote fetch is unavailable.
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [fetchRemote]);

  return [info, setInfo, setCachedMadrasaInfo];
}
