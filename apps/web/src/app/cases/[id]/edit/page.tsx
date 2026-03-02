'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { TopNav } from '@/components/top-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';

type CaseItem = {
  id: string;
  title: string;
  description: string;
  value: string;
};

export default function EditCasePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('10.00');

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(`/cases/${id}`);
        const c = (await res.json()) as CaseItem;
        setTitle(c.title);
        setDescription(c.description);
        setValue(c.value);
      } catch (err) {
        toast.error('Failed to load case', {
          description: err instanceof Error ? err.message : String(err),
        });
      }
    })();
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch(`/cases/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title, description, value }),
      });
      toast.success('Case updated');
      router.push(`/cases/${id}`);
    } catch (err) {
      toast.error('Failed to update case', {
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
            <CardTitle>Edit Case</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
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
                <Input value={value} onChange={(e) => setValue(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
