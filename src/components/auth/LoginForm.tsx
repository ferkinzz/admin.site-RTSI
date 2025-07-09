'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import type { Dictionary } from '@/types';
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


const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormProps = {
  dict: Dictionary['login'];
};

export function LoginForm({ dict }: LoginFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [loginAttemptFailed, setLoginAttemptFailed] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setLoginAttemptFailed(false);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const token = await userCredential.user.getIdToken();
      
      console.log('Login successful. Setting cookie and redirecting...');
      document.cookie = `firebaseIdToken=${token}; path=/; max-age=3600`;
      
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: dict.error,
        variant: 'destructive',
      });
      setLoginAttemptFailed(true);
      setLoading(false);
    }
  }

  async function handlePasswordReset() {
    if (!resetEmail) {
      toast({
        title: 'Error',
        description: dict.enterEmailPrompt,
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        title: dict.resetEmailSent,
        description: dict.resetEmailSentDescription,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: dict.resetError,
        description: dict.resetErrorDescription,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.emailLabel}</FormLabel>
              <FormControl>
                <Input type="email" placeholder="admin@example.com" {...field} />
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
              <FormLabel>{dict.passwordLabel}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
             <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
          ) : (
            dict.submitButton
          )}
        </Button>
      </form>
      {loginAttemptFailed && (
        <div className="mt-4 text-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="link" className="px-0 text-sm h-auto font-normal text-muted-foreground hover:text-primary">
                {dict.forgotPassword}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{dict.resetPasswordTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {dict.resetPasswordDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-2">
                <Label htmlFor="reset-email" className="sr-only">{dict.emailLabel}</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handlePasswordReset();
                    }
                  }}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setResetEmail('')}>{dict.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={handlePasswordReset} disabled={loading}>
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
                  ) : (
                    dict.sendResetLink
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </Form>
  );
}
