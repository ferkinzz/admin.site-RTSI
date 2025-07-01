
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Dictionary, Profile } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pencil } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

const formSchema = z.object({
  displayName: z.string().max(50).optional(),
  bio: z.string().max(160).optional(),
  website: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
});

type ProfileFormProps = {
  dict: Dictionary['settings'];
};

export function ProfileForm({ dict }: ProfileFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.photoURL || null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: '',
      bio: '',
      website: '',
    },
  });

  useEffect(() => {
    if (!user) return;

    async function fetchProfile() {
      setLoading(true);
      try {
        const profileRef = doc(db, 'profiles', user.uid);
        const docSnap = await getDoc(profileRef);
        if (docSnap.exists()) {
          const profileData = docSnap.data() as Profile;
          form.reset({
            displayName: profileData.displayName || '',
            bio: profileData.bio || '',
            website: profileData.website || '',
          });
          if(profileData.photoURL) {
            setPhotoPreview(profileData.photoURL);
          }
        } else {
            // If no profile, still show auth data
            setPhotoPreview(user.photoURL);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user, form]);
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB size limit
        toast({
          title: 'Error',
          description: 'La imagen no puede pesar más de 5MB.',
          variant: 'destructive',
        });
        e.target.value = '';
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !auth.currentUser) {
      toast({
        title: 'Error',
        description: 'You must be logged in.',
        variant: 'destructive',
      });
      return;
    }
    
    let finalPhotoURL = photoPreview || '';

    if (photoFile) {
        setIsUploading(true);
        try {
            const storageRef = ref(storage, `profiles/${user.uid}/photo`);
            const uploadTask = uploadBytesResumable(storageRef, photoFile);
            
            finalPhotoURL = await new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    null,
                    (error) => reject(error),
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    }
                );
            });
            
            await updateProfile(auth.currentUser, { photoURL: finalPhotoURL });
            
        } catch(error) {
             console.error('Error uploading photo:', error);
             toast({
                title: 'Error',
                description: 'Failed to upload new photo.',
                variant: 'destructive',
            });
            setIsUploading(false);
            return;
        } finally {
            setIsUploading(false);
        }
    }

    try {
      const profileRef = doc(db, 'profiles', user.uid);
      await setDoc(profileRef, {
        ...values,
        photoURL: finalPhotoURL,
        email: user.email,
        authorId: user.uid,
      }, { merge: true });

      toast({
        title: 'Success!',
        description: dict.successMessage,
      });
      // Force a reload of the user to get the new photoURL in the context
      await auth.currentUser.reload();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: dict.errorMessage,
        variant: 'destructive',
      });
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-center mb-6">
            <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                    <AvatarImage src={photoPreview || ''} alt={user?.displayName || 'User'} />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">{dict.changePhotoButton}</span>
                </Button>
                <Input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={isUploading}
                />
            </div>
        </div>

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.displayNameLabel}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.bioLabel}</FormLabel>
              <FormControl>
                <Textarea className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.websiteLabel}</FormLabel>
              <FormControl>
                <Input placeholder={dict.websitePlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting || isUploading}>
            {form.formState.isSubmitting || isUploading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
            ) : (
              dict.submitButton
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
