'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { TopNav } from '@/components/top-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }

    (async () => {
      try {
        const res = await apiFetch('/organizations?skip=0&take=100');
        const data = (await res.json()) as { items: Organization[] };
        setOrgs(data.items);
        if (data.items[0]) setOrganizationId(data.items[0].id);
      } catch (err) {
        toast.error('Failed to load organizations', {
          description: err instanceof Error ? err.message : String(err),
        });
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

    try {
      const res = await apiFetch('/cases', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          value,
          organizationId,
        }),
      });

      const created = (await res.json()) as { id: string };

      toast.success('Case created');
      router.push(`/cases/${created.id}`);
    } catch (err) {
      toast.error('Failed to create case', {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <TopNav />
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
    </div>
  );
}
