'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { getCachedMe, isAdmin } from '@/lib/me';

type CaseItem = {
  id: string;
  title: string;
  description: string;
  value: string;
  status: 'OPEN' | 'CLOSED';
  organizationId: string;
  organization?: { id: string; name: string; email: string };
};

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const me = getCachedMe();
  const admin = isAdmin(me);

  const [item, setItem] = useState<CaseItem | null>(null);

  async function load() {
    try {
      const res = await apiFetch(`/cases/${id}`);
      setItem((await res.json()) as CaseItem);
    } catch (err) {
      toast.error('Failed to load case', {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function updateStatus(status: 'OPEN' | 'CLOSED') {
    try {
      await apiFetch(`/cases/${id}/status`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      toast.success('Case updated');
      await load();
    } catch (err) {
      toast.error('Failed to update case', {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async function deleteCase() {
    try {
      await apiFetch(`/cases/${id}`, { method: 'DELETE' });
      toast.success('Case deleted');
      router.push('/cases');
    } catch (err) {
      toast.error('Failed to delete case', {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <div>
      <TopNav />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Case</h1>
          {admin ? (
            <div className="flex gap-2">
              <Button asChild variant="secondary">
                <Link href={`/cases/${id}/edit`}>Edit</Link>
              </Button>
              {item?.status === 'OPEN' ? (
                <Button variant="outline" onClick={() => updateStatus('CLOSED')}>
                  Close
                </Button>
              ) : (
                <Button variant="outline" onClick={() => updateStatus('OPEN')}>
                  Reopen
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete case?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the case.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteCase}>Confirm</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : null}
        </div>

        {item ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>{item.description}</p>
              <p>Value: {item.value}</p>
              <p>Status: {item.status}</p>
              <p>
                Organization:{' '}
                <Link className="underline" href={`/organizations/${item.organizationId}`}>
                  {item.organization?.name ?? item.organizationId}
                </Link>
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
