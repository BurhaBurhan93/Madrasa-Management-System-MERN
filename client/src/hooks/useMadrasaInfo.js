import { useEffect, useState } from 'react';
import { getCachedMadrasaInfo, setCachedMadrasaInfo, subscribeToMadrasaInfo } from '../lib/madrasaInfo';
import { getToken } from '../lib/auth';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const fetchMadrasaInfo = async () => {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/admin/madrasa-info`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

export default function useMadrasaInfo({ fetchRemote = false } = {}) {
  const [info, setInfo] = useState(() => getCachedMadrasaInfo());

  useEffect(() => {
    const unsubscribe = subscribeToMadrasaInfo(() => {
      setInfo(getCachedMadrasaInfo());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!fetchRemote && getCachedMadrasaInfo()) return;
      const data = await fetchMadrasaInfo();
      if (!mounted || !data) return;
      setInfo(data);
      setCachedMadrasaInfo(data);
    };

    load();
    return () => { mounted = false; };
  }, [fetchRemote]);

  return [info, setInfo, setCachedMadrasaInfo];
}
