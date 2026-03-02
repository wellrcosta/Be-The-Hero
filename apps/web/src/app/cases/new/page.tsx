'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { apiFetch } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Organization = {
  id: string;
  name: string;
  email: string;
};

export default function NewCasePage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('10.00');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }

    (async () => {
      try {
        const res = await apiFetch('/organizations?skip=0&take=100', {
          headers: { authorization: `Bearer ${token}` },
        });
        const data = (await res.json()) as Organization[];
        setOrgs(data);
        if (data[0]) setOrganizationId(data[0].id);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiFetch('/cases', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          value,
          organizationId,
        }),
      });

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 flex justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>New Case</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Organization</Label>
              <select
                className="w-full border rounded-md h-10 px-3 bg-background"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
              >
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Value</Label>
              <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="10.50" />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
