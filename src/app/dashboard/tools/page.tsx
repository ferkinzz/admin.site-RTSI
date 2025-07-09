
'use client';

import { getDictionary } from '@/lib/dictionaries';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Contact, Sparkles, Compass, HardDriveUpload, Rocket, Lock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLicense } from '@/context/LicenseContext';
import { useEffect, useState } from 'react';
import type { Dictionary } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ToolsPage() {
  const [dict, setDict] = useState<Dictionary | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { plan } = useLicense();
  const isPro = plan === 'pro' || plan === 'ai_pro';
  const canAccess = isPro && (user?.role === 'Admin' || user?.role === 'Redactor' || user?.role === 'Redactor Jr.');

  useEffect(() => {
    getDictionary('es').then(setDict);
  }, []);

  if (authLoading || !dict) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-2 h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }
  
  const { tools: toolsDict, users: usersDict } = dict;

  if (!canAccess) {
    return (
      <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md text-center">
              <CardHeader>
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                     {!isPro ? <Rocket className="h-8 w-8 text-primary" /> : <Lock className="h-8 w-8 text-primary" />}
                  </div>
                  <CardTitle className="mt-4">{!isPro ? toolsDict.imageOptimizer.upgradeTitle : toolsDict.imageOptimizer.roleErrorTitle}</CardTitle>
                  <CardDescription>{!isPro ? toolsDict.imageOptimizer.upgradeDescription : toolsDict.imageOptimizer.roleErrorDescription}</CardDescription>
              </CardHeader>
              {!isPro && (
                <CardContent>
                    <p className="text-sm text-muted-foreground">{toolsDict.imageOptimizer.upgradeCTA}</p>
                </CardContent>
              )}
          </Card>
      </div>
    );
  }

  const toolsData = [
    {
      href: '/dashboard/tools/qr-generator',
      label: toolsDict.qrGenerator.label,
      description: toolsDict.qrGenerator.description,
      icon: <QrCode className="h-8 w-8 text-primary" />
    },
    {
      href: '/dashboard/tools/vcf-generator',
      label: toolsDict.vcfGenerator.label,
      description: toolsDict.vcfGenerator.description,
      icon: <Contact className="h-8 w-8 text-primary" />
    },
    {
      href: '/dashboard/tools/image-optimizer',
      label: toolsDict.imageOptimizer.label,
      description: toolsDict.imageOptimizer.description,
      icon: <Sparkles className="h-8 w-8 text-primary" />
    },
    {
      href: '/dashboard/tools/image-optimizer-batch',
      label: toolsDict.imageOptimizerBatch.label,
      description: toolsDict.imageOptimizerBatch.description,
      icon: <HardDriveUpload className="h-8 w-8 text-primary" />
    },
    {
      href: '/dashboard/tools/link-generator',
      label: toolsDict.linkGenerator.label,
      description: toolsDict.linkGenerator.description,
      icon: <Compass className="h-8 w-8 text-primary" />
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{toolsDict.title}</h1>
        <p className="text-muted-foreground">{toolsDict.description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {toolsData.map((tool) => (
          <Link href={tool.href} key={tool.href} className="group block">
            <Card className="h-full hover:border-primary/50 hover:bg-muted/50 transition-all">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <div>{tool.icon}</div>
                <div className="flex-1">
                  <CardTitle className="text-xl">{tool.label}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

    