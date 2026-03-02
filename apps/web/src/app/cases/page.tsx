'use client';

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

export default function CasesPage() {
  const [items, setItems] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [take] = useState(20);
  const [status, setStatus] = useState<StatusFilter>('ALL');

  const query = useMemo(() => {
    return `/cases?skip=${skip}&take=${take}`;
  }, [skip, take]);

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch(query);
      const data = (await res.json()) as CaseItem[];
      setItems(status === 'ALL' ? data : data.filter((c) => c.status === status));
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
  }, [query, status]);

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
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
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

        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            disabled={skip === 0 || loading}
            onClick={() => setSkip(Math.max(0, skip - take))}
          >
            Prev
          </Button>
          <Button variant="outline" disabled={loading} onClick={() => setSkip(skip + take)}>
            Next
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="text-base">{c.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{c.description}</p>
                <p className="text-sm">Value: {c.value}</p>
                <p className="text-sm">Status: {c.status}</p>
                <p className="text-sm">Org: {c.organization?.name}</p>

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
      </div>
    </div>
  );
}
