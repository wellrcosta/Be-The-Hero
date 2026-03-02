'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { apiFetch } from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Case = {
  id: string;
  title: string;
  description: string;
  value: string;
  status: 'OPEN' | 'CLOSED';
  organization: {
    id: string;
    name: string;
    email: string;
  };
};

export default function HomePage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }

    (async () => {
      try {
        const res = await apiFetch('/cases?skip=0&take=20', {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        const data = (await res.json()) as Case[];
        setCases(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      }
    })();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cases</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/organizations/new">New Organization</Link>
          </Button>
          <Button asChild>
            <Link href="/cases/new">New Case</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/api/docs" target="_blank">
              API Docs
            </Link>
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              clearToken();
              window.location.href = '/login';
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cases.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle className="text-base">{c.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{c.description}</p>
              <p className="text-sm">Value: {c.value}</p>
              <p className="text-sm">Status: {c.status}</p>
              <p className="text-sm">Org: {c.organization?.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
