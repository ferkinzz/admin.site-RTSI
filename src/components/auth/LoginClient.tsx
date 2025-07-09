'use client';

import { useEffect, useState } from 'react';
import type { Dictionary, Invitation } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { InvitationSignUpForm } from './InvitationSignUpForm';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type LoginClientProps = {
  dict: Dictionary['login'];
  logoUrl: string;
  invitation: (Invitation & { id: string }) | null;
  invitationError: string | null;
};

export function LoginClient({ dict, logoUrl, invitation, invitationError }: LoginClientProps) {
  const [isFirstRun, setIsFirstRun] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Show invitation error if there is one
    if (invitationError) {
      toast({
        variant: 'destructive',
        title: dict.invitation.errorTitle,
        description: invitationError,
      });
    }
  }, [invitationError, toast, dict.invitation.errorTitle]);

  useEffect(() => {
    // Only check for first run if there is no valid invitation
    if (!invitation) {
      async function checkFirstRun() {
        try {
          const profilesCollection = collection(db, 'profiles');
          const q = query(profilesCollection, limit(1));
          const querySnapshot = await getDocs(q);
          setIsFirstRun(querySnapshot.empty);
        } catch (error) {
          console.error("Error checking for profiles, defaulting to login:", error);
          setIsFirstRun(false); // Default to login form on error
        }
      }
      checkFirstRun();
    }
  }, [invitation]);

  const renderForm = () => {
    if (invitation) {
      return <InvitationSignUpForm dict={dict} invitation={invitation} />;
    }

    if (isFirstRun === null) {
      return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
        </div>
      );
    }
    if (isFirstRun) {
      return <SignUpForm dict={dict} />;
    }
    return <LoginForm dict={dict} />;
  };

  const getTitle = () => {
    if (invitation) {
        return dict.invitation.title;
    }
    if (isFirstRun === null) {
        return <Skeleton className="h-8 w-48 mx-auto" />;
    }
    return isFirstRun ? dict.firstUserTitle : dict.title;
  };
  
  const getDescription = () => {
    if (invitation) {
        return dict.invitation.description;
    }
    if (isFirstRun) {
        return dict.firstUserDescription;
    }
    return null;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-20 w-48">
          <Image
            src={logoUrl}
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">
              {getTitle()}
            </CardTitle>
            <CardDescription>{getDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderForm()}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
