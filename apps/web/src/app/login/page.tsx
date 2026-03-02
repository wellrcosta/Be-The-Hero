'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
import { setToken } from '@/lib/auth';
import { fetchAndCacheMe } from '@/lib/me';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type Values = z.infer<typeof schema>;

type LoginResponse = {
  access_token: string;
};

export default function LoginPage() {
  const router = useRouter();

  const form = useForm<Values>({
    defaultValues: {
      email: 'admin@example.com',
      password: 'admin123',
    },
  });

  async function onSubmit(values: Values) {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      toast.error('Invalid form');
      return;
    }

    try {
      values = parsed.data;

      const res = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = (await res.json()) as LoginResponse;
      setToken(data.access_token);
      await fetchAndCacheMe();

      toast.success('Signed in');
      router.push('/cases');
    } catch (err) {
      toast.error('Login failed', {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" autoComplete="current-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
