'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { TopNav } from '@/components/top-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

type Organization = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
};

export default function OrganizationsPage() {
  const [items, setItems] = useState<Organization[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/organizations?skip=0&take=50');
        const data = (await res.json()) as Organization[];
        setItems(data);
      } catch (err) {
        toast.error('Failed to load organizations', {
          description: err instanceof Error ? err.message : String(err),
        });
      }
    })();
  }, []);

  return (
    <div>
      <TopNav />
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Organizations</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((o) => (
            <Card key={o.id}>
              <CardHeader>
                <CardTitle className="text-base">{o.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>Email: {o.email}</p>
                {o.phone ? <p>Phone: {o.phone}</p> : null}
                {o.city || o.state ? (
                  <p>Location: {[o.city, o.state].filter(Boolean).join(' - ')}</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
