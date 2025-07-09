
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2, Rocket } from 'lucide-react';
import { useLicense } from '@/context/LicenseContext';
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary } from '@/types';

export default function PlansPage() {
  const { licenseKey, licenseUid, isLoading } = useLicense();
  const [dict, setDict] = useState<Dictionary['settings'] | null>(null);

  useEffect(() => {
    async function fetchDict() {
        const d = await getDictionary('es');
        setDict(d.settings);
    }
    fetchDict();
  }, []);

  if (isLoading || !dict) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  const activationUrl = `https://keys.admin.rtsi.site/activate?documentId=${licenseKey}&uid=${licenseUid}`;

  const handleOpenPopup = () => {
    const width = 800;
    const height = 700;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
    window.open(
      activationUrl,
      'Stripe',
      `width=${width},height=${height},top=${top},left=${left}`
    );
  };

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mt-4">{dict.activatePlanTitle || 'Plan Activation'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription>
            {dict.activatePlanDescription || 'Click the button below to go to the secure portal where you can manage your plan and payment method.'}
          </CardDescription>
          {!licenseKey || !licenseUid ? (
            <div className="flex items-center justify-center text-destructive">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>{dict.loadingLicense || 'Loading license information...'}</span>
            </div>
          ) : (
            <Button onClick={handleOpenPopup} size="lg">
              <ExternalLink className="mr-2 h-4 w-4" />
              {dict.goToPortalButton || 'Go to Activation Portal'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
