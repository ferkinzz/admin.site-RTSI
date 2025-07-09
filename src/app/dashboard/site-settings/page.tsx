'use client';

import { useAuth } from '@/context/AuthContext';
import { getDictionary } from '@/lib/dictionaries';
import { SiteConfigForm } from '@/components/dashboard/site-settings/SiteConfigForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';
import type { Dictionary } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock } from 'lucide-react';

export default function SiteSettingsPage() {
  const [dict, setDict] = useState<Dictionary | null>(null);
  const { user, loading: authLoading } = useAuth();
  const canAccess = user?.role === 'Admin';

  useEffect(() => {
    getDictionary('es').then(setDict);
  }, []);

  if (authLoading || !dict) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-5 w-96" />
        </div>
        <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const d = dict.siteSettings;

  if (!canAccess) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                    <Lock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4">{d.adminOnlyTitle}</CardTitle>
                <CardDescription>{d.adminOnlyDescription}</CardDescription>
            </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{d.title}</h1>
        <p className="text-muted-foreground">{d.description}</p>
      </div>
      <SiteConfigForm dict={d} />
    </div>
  );
}
