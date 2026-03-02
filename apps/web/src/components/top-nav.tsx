'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { clearToken } from '@/lib/auth';

export function TopNav() {
  const pathname = usePathname();

  return (
    <div className="w-full border-b bg-background">
      <div className="mx-auto max-w-6xl flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-semibold">
            Be The Hero
          </Link>
          <span className="text-sm text-muted-foreground">{pathname}</span>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/organizations">Organizations</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/organizations/new">New Organization</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/cases">Cases</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/cases/new">New Case</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/api/docs" target="_blank">
              API Docs
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              clearToken();
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
