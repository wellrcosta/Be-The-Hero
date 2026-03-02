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

type Organization = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
};

type CaseItem = {
  id: string;
  title: string;
  status: 'OPEN' | 'CLOSED';
  value: string;
};

type Page<T> = { items: T[]; page: { skip: number; take: number; total: number } };

export default function OrganizationDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [org, setOrg] = useState<Organization | null>(null);
  const [cases, setCases] = useState<CaseItem[]>([]);

  async function load() {
    try {
      const res = await apiFetch(`/organizations/${id}`);
      setOrg((await res.json()) as Organization);

      const casesRes = await apiFetch(`/cases?skip=0&take=50&organizationId=${id}`);
      const casesData = (await casesRes.json()) as Page<any>;
      setCases(casesData.items);
    } catch (err) {
      toast.error('Failed to load organization', {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function deleteOrg() {
    try {
      await apiFetch(`/organizations/${id}`, { method: 'DELETE' });
      toast.success('Organization deleted');
      router.push('/organizations');
    } catch (err) {
      toast.error('Failed to delete organization', {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <div>
      <TopNav />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Organization</h1>
          <div className="flex gap-2">
            <Button asChild variant="secondary">
              <Link href={`/organizations/${id}/edit`}>Edit</Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete organization?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the organization.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteOrg}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {org ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{org.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>Email: {org.email}</p>
              {org.phone ? <p>Phone: {org.phone}</p> : null}
              {org.city || org.state ? (
                <p>Location: {[org.city, org.state].filter(Boolean).join(' - ')}</p>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cases</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {cases.length === 0 ? (
              <p className="text-muted-foreground">No cases for this organization.</p>
            ) : (
              <ul className="space-y-1">
                {cases.map((c) => (
                  <li key={c.id}>
                    <Link className="underline" href={`/cases/${c.id}`}>
                      {c.title}
                    </Link>{' '}
                    — {c.status} — {c.value}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
