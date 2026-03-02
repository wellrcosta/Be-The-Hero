'use client';

import { useEffect, useState } from 'react';

import { fetchAndCacheMe, getCachedMe, type Me } from '@/lib/me';

export function useMe() {
  const [me, setMe] = useState<Me | null>(() => getCachedMe());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAndCacheMe();
        setMe(data);
      } catch {
        // ignore (unauthorized handled by apiFetch)
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { me, loading };
}
