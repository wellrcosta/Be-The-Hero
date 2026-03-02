'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { TopNav } from '@/components/top-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch } from '@/lib/api';
import { isAdmin } from '@/lib/me';
import { useMe } from '@/hooks/use-me';

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
  const { me, loading: loadingMe } = useMe();
  const admin = !loadingMe && isAdmin(me);

  const [items, setItems] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [take] = useState(20);
  const [total, setTotal] = useState(0);

  const query = useMemo(() => {
    const params = new URLSearchParams({
      skip: String(skip),
      take: String(take),
    });
    return `/organizations?${params.toString()}`;
  }, [skip, take]);

  async function load() {
    if (!admin) return;

    setLoading(true);
    try {
      const res = await apiFetch(query);
      const data = (await res.json()) as Page<Organization>;
      setItems(data.items);
      setTotal(data.page.total);
    } catch (err) {
      toast.error('Failed to load organizations', {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, admin]);

  const canPrev = skip > 0;
  const canNext = skip + take < total;

  return (
    <div>
      <TopNav />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Organizations</h1>
          <Button variant="outline" onClick={load} disabled={loading || !admin}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {!admin ? (
          <Card>
            <CardHeader>
              <CardTitle>Access denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You need ADMIN role to view organizations.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
              <span>
                Showing {items.length} of {total}
              </span>
              <span>Page {Math.floor(skip / take) + 1}</span>
            </div>

            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                disabled={!canPrev || loading}
                onClick={() => setSkip(Math.max(0, skip - take))}
              >
                Prev
              </Button>
              <Button variant="outline" disabled={!canNext || loading} onClick={() => setSkip(skip + take)}>
                Next
              </Button>
            </div>

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
                      <CardTitle className="text-base">
                        <Link className="underline" href={`/organizations/${o.id}`}>
                          {o.name}
                        </Link>
                      </CardTitle>
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
          </>
        )}
      </div>
    </div>
  );
}
