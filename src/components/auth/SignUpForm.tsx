'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import type { Dictionary } from '@/types';

const formSchema = z.object({
  displayName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  email: z.string().email(),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

type SignUpFormProps = {
  dict: Dictionary['login'];
};

export function SignUpForm({ dict }: SignUpFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { displayName: '', email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.displayName });

      // Create profile document
      const profileRef = doc(db, 'profiles', user.uid);
      await setDoc(profileRef, {
        email: user.email,
        authorId: user.uid,
        displayName: values.displayName,
        bio: '',
        website: '',
        photoURL: '',
      });

      // Create user document with Admin role
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        email: user.email,
        role: 'Admin',
      });
      
      // Create license document with random ID
      const licenseRef = doc(collection(db, 'license'));
      await setDoc(licenseRef, {
        uid: user.uid,
      });

      // Create a default siteConfig document for a better first-run experience
      const siteConfigRef = doc(db, 'siteConfig', 'default-site');
      await setDoc(siteConfigRef, {
        siteName: 'Mi Sitio',
        deployHookUrl: '',
        siteUrl: '',
        blogPath: '/blog',
        resourcesPath: '/recursos',
        videosPath: '/videos',
        otherPath: '/archivo',
      }, { merge: true });

      // Create a default publicConfig document
      const publicConfigRef = doc(db, 'publicConfig', 'main');
      await setDoc(publicConfigRef, {
        loginLogoUrl: '',
      }, { merge: true });

      toast({ title: '¡Cuenta creada!', description: 'Bienvenido a Admin .Site.' });
      router.push('/dashboard');

    } catch (error: any) {
      console.error(error);
      const firebaseErrorMessages: { [key: string]: string } = {
        'auth/email-already-in-use': 'El correo electrónico ya está en uso por otra cuenta.',
        'auth/weak-password': 'La contraseña es demasiado débil.',
        'auth/invalid-email': 'El formato del correo electrónico no es válido.',
      };
      const description = firebaseErrorMessages[error.code] || error.message;

      toast({
        title: 'Error al crear la cuenta',
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
        <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>{dict.firstAdminNameLabel}</FormLabel>
                <FormControl>
                    <Input placeholder={dict.firstAdminNamePlaceholder} {...field} />
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
            dict.createAccountButton
          )}
        </Button>
      </form>
    </Form>
  );
}
