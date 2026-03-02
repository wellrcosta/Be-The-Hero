'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { clearToken } from '@/lib/auth';
import { fetchAndCacheMe, isAdmin, type Me } from '@/lib/me';

export function TopNav() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAndCacheMe();
        setMe(data);
      } catch {
        // ignore (e.g. on login page)
      }
    })();
  }, []);

  const admin = isAdmin(me);
  const roleLabel = admin ? 'ADMIN' : 'USER';

  return (
    <div className="w-full border-b bg-background">
      <div className="mx-auto max-w-6xl flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold">
            Be The Hero
          </Link>
          {me?.email ? (
            <span className="text-sm text-muted-foreground">
              {me.email} ({roleLabel})
            </span>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/organizations">Organizations</Link>
          </Button>
          {admin ? (
            <Button asChild variant="secondary">
              <Link href="/organizations/new">New Organization</Link>
            </Button>
          ) : null}
          <Button asChild variant="secondary">
            <Link href="/cases">Cases</Link>
          </Button>
          {admin ? (
            <Button asChild variant="secondary">
              <Link href="/cases/new">New Case</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/api/docs" target="_blank">
              API Docs
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              clearToken();
              toast.success('Logged out');
              window.location.href = '/login';
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
