'use client';

import { useLicense } from '@/context/LicenseContext';
import { useEffect } from 'react';

type DynamicTitleHandlerProps = {
  siteName?: string;
};

export function DynamicTitleHandler({ siteName }: DynamicTitleHandlerProps) {
  const { plan } = useLicense();
  const isProOrHigher = plan === 'pro' || plan === 'ai_pro';

  useEffect(() => {
    const baseTitle = 'Admin .Site';
    if (isProOrHigher && siteName) {
      document.title = `${baseTitle} | ${siteName}`;
    } else {
      document.title = baseTitle;
    }
  }, [siteName, isProOrHigher, plan]);

  return null;
}
