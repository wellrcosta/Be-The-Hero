'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { TopNav } from '@/components/top-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { getToken } from '@/lib/auth';

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
        toast.error('Failed to load cases', {
          description: err instanceof Error ? err.message : String(err),
        });
      }
    })();
  }, []);

  return (
    <div>
      <TopNav />
      <div className="p-6">
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
    </div>
  );
}
