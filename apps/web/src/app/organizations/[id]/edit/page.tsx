'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { TopNav } from '@/components/top-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api';
import { isAdmin } from '@/lib/me';
import { useMe } from '@/hooks/use-me';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

type Values = z.infer<typeof schema>;

type Organization = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
};

export default function EditOrganizationPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { me, loading: loadingMe } = useMe();
  const admin = !loadingMe && isAdmin(me);

  const form = useForm<Values>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      city: '',
      state: '',
    },
  });

  useEffect(() => {
    if (!admin) return;

    (async () => {
      try {
        const res = await apiFetch(`/organizations/${id}`);
        const o = (await res.json()) as Organization;
        form.reset({
          name: o.name,
          email: o.email,
          phone: o.phone ?? '',
          city: o.city ?? '',
          state: o.state ?? '',
        });
      } catch (err) {
        toast.error('Failed to load organization', {
          description: err instanceof Error ? err.message : String(err),
        });
      }
    })();
  }, [admin, form, id]);

  async function onSubmit(values: Values) {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      toast.error('Invalid form');
      return;
    }

    try {
      values = parsed.data;

      await apiFetch(`/organizations/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...values,
          phone: values.phone || undefined,
          city: values.city || undefined,
          state: values.state || undefined,
        }),
      });
      toast.success('Organization updated');
      router.push(`/organizations/${id}`);
    } catch (err) {
      toast.error('Failed to update organization', {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <div>
      <TopNav />
      <div className="p-6 flex justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Edit Organization</CardTitle>
          </CardHeader>
          <CardContent>
            {!admin ? (
              <p className="text-sm text-muted-foreground">ADMIN role required.</p>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
