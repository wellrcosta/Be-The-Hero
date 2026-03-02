'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { TopNav } from '@/components/top-nav';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch } from '@/lib/api';

type CaseItem = {
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

type StatusFilter = 'ALL' | 'OPEN' | 'CLOSED';

type Page<T> = { items: T[]; page: { skip: number; take: number; total: number } };

export default function CasesPage() {
  const [items, setItems] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [take] = useState(20);
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [total, setTotal] = useState(0);

  const query = useMemo(() => {
    const params = new URLSearchParams({
      skip: String(skip),
      take: String(take),
    });
    if (status !== 'ALL') params.set('status', status);
    return `/cases?${params.toString()}`;
  }, [skip, take, status]);

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch(query);
      const data = (await res.json()) as Page<CaseItem>;
      setItems(data.items);
      setTotal(data.page.total);
    } catch (err) {
      toast.error('Failed to load cases', {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function closeCase(id: string) {
    try {
      await apiFetch(`/cases/${id}/status`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'CLOSED' }),
      });
      toast.success('Case closed');
      await load();
    } catch (err) {
      toast.error('Failed to close case', {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const canPrev = skip > 0;
  const canNext = skip + take < total;

  return (
    <div>
      <TopNav />
      <div className="p-6">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Cases</h1>
          <div className="flex gap-2 items-center">
            <select
              className="border rounded-md h-10 px-3 bg-background"
              value={status}
              onChange={(e) => {
                setSkip(0);
                setStatus(e.target.value as StatusFilter);
              }}
            >
              <option value="ALL">All</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
            <Button variant="outline" onClick={load} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
          <span>
            Showing {items.length} of {total}
          </span>
          <span>
            Page {Math.floor(skip / take) + 1}
          </span>
        </div>

        <div className="flex gap-2 mb-4">
          <Button variant="outline" disabled={!canPrev || loading} onClick={() => setSkip(Math.max(0, skip - take))}>
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
                  <Skeleton className="h-4 w-3/5" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No cases found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Try adjusting filters or create a new case.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <Card key={c.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    <Link className="underline" href={`/cases/${c.id}`}>
                      {c.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                  <p className="text-sm">Value: {c.value}</p>
                  <p className="text-sm">Status: {c.status}</p>
                  <p className="text-sm">
                    Org:{' '}
                    <Link className="underline" href={`/organizations/${c.organization?.id}`}>
                      {c.organization?.name}
                    </Link>
                  </p>

                  {c.status === 'OPEN' ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="secondary" className="w-full">
                          Close case
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Close case?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will mark the case as CLOSED.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => closeCase(c.id)}>
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
