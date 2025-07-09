'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import type { Dictionary, Invitation } from '@/types';
import { Label } from '../ui/label';

const formSchema = z.object({
  displayName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

type InvitationSignUpFormProps = {
  dict: Dictionary['login'];
  invitation: Invitation & { id: string };
};

export function InvitationSignUpForm({ dict, invitation }: InvitationSignUpFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { displayName: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      // 1. Create user in Auth
      const userCredential = await createUserWithEmailAndPassword(auth, invitation.email, values.password);
      const user = userCredential.user;

      // 2. Update Auth profile with displayName
      await updateProfile(user, { displayName: values.displayName });
      
      // 3. Create profile document in Firestore
      const profileRef = doc(db, 'profiles', user.uid);
      await setDoc(profileRef, {
        email: user.email,
        authorId: user.uid,
        displayName: values.displayName,
        bio: '',
        website: '',
        photoURL: '',
      });

      // 4. Create user document with role from invitation
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        email: user.email,
        role: invitation.role,
      });

      // 5. Mark invitation as used
      const inviteRef = doc(db, 'invitations', invitation.id);
      await updateDoc(inviteRef, { used: true });

      toast({ title: dict.invitation.successTitle, description: dict.invitation.successDescription });
      router.push('/dashboard');

    } catch (error: any) {
      console.error(error);
      const firebaseErrorMessages: { [key: string]: string } = {
        'auth/email-already-in-use': 'El correo electrónico ya está en uso por otra cuenta.',
        'auth/weak-password': 'La contraseña es demasiado débil.',
        'auth/invalid-email': 'El formato del correo electrónico no es válido.',
      };
      const description = firebaseErrorMessages[error.code] || dict.invitation.genericError;
      toast({
        title: dict.invitation.errorTitle,
        description: description,
        variant: 'destructive',
      });
    } finally {
        setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="email">{dict.emailLabel}</Label>
            <Input id="email" type="email" value={invitation.email} disabled />
        </div>
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.invitation.displayNameLabel}</FormLabel>
              <FormControl>
                <Input placeholder={dict.invitation.displayNamePlaceholder} {...field} />
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
            dict.invitation.submitButton
          )}
        </Button>
      </form>
    </Form>
  );
}
