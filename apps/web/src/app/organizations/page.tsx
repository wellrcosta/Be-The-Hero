'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { TopNav } from '@/components/top-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch } from '@/lib/api';

type Organization = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
};

type Page<T> = { items: T[]; page: { skip: number; take: number; total: number } };

export default function OrganizationsPage() {
  const [items, setItems] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/organizations?skip=0&take=50');
        const data = (await res.json()) as Page<Organization>;
        setItems(data.items);
      } catch (err) {
        toast.error('Failed to load organizations', {
          description: err instanceof Error ? err.message : String(err),
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <TopNav />
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Organizations</h1>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No organizations yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create your first organization to start managing cases.
              </p>
            </CardContent>
          </Card>
        ) : (
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
        )}
      </div>
    </div>
  );
}
