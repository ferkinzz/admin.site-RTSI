
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { License } from '@/types';

type Plan = 'community' | 'pro' | 'ai_pro';
type ApiPlan = 'community' | 'pro' | 'ai-pro';
type Feature = 'advanced_dashboard' | 'user_roles' | 'ai_writing';

interface LicenseContextType {
  plan: Plan;
  features: Feature[];
  isLoading: boolean;
  hasFeature: (feature: Feature) => boolean;
  licenseKey?: string;
  licenseUid?: string;
}

const LicenseContext = createContext<LicenseContextType | null>(null);

const FEATURES_BY_PLAN: Record<Plan, Feature[]> = {
  community: [],
  pro: ['advanced_dashboard', 'user_roles', 'ai_writing'],
  ai_pro: ['advanced_dashboard', 'user_roles', 'ai_writing'],
};

export const LicenseProvider = ({ children }: { children: React.ReactNode }) => {
  const [plan, setPlan] = useState<Plan>('community');
  const [isLoading, setIsLoading] = useState(true);
  const [licenseKey, setLicenseKey] = useState<string | undefined>();
  const [licenseUid, setLicenseUid] = useState<string | undefined>();

  useEffect(() => {
    const verifyLicense = async () => {
      setIsLoading(true);
      
      try {
        let fetchedLicenseKey: string | undefined;
        let fetchedUid: string | undefined;

        const licenseCol = collection(db, 'license');
        const q = query(licenseCol, limit(1));
        const licenseSnap = await getDocs(q);
        
        if (!licenseSnap.empty) {
          const licenseDoc = licenseSnap.docs[0];
          const licenseData = licenseDoc.data() as License;
          fetchedLicenseKey = licenseDoc.id;
          fetchedUid = licenseData.uid;
          setLicenseKey(fetchedLicenseKey);
          setLicenseUid(fetchedUid);
        }

        if (!fetchedLicenseKey || !fetchedUid) {
          console.warn('License key or UID not found, defaulting to community plan.');
          setPlan('community');
        } else {
            const response = await fetch('https://keys.admin.rtsi.site/api/license/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId: fetchedLicenseKey, uid: fetchedUid }),
            });
            
            const data = await response.json();

            if (!response.ok) {
                console.error('License verification failed:', data);
                setPlan('community');
            } else if (data.status === 'active') {
                const apiPlan: ApiPlan = data.plan;
                const appPlan: Plan = apiPlan === 'ai-pro' ? 'ai_pro' : apiPlan;
                setPlan(appPlan);
            } else {
                console.log(`License status is '${data.status}', defaulting to community plan.`);
                setPlan('community');
            }
        }
      } catch (error) {
        console.error('An error occurred during license verification:', error);
        setPlan('community');
      } finally {
        setIsLoading(false);
      }
    };

    verifyLicense();
  }, []);

  const hasFeature = (feature: Feature): boolean => {
    if (isLoading) return false;
    return FEATURES_BY_PLAN[plan].includes(feature);
  };

  const value = { plan, features: isLoading ? [] : FEATURES_BY_PLAN[plan], isLoading, hasFeature, licenseKey, licenseUid };

  return (
    <LicenseContext.Provider value={value}>
      {children}
    </LicenseContext.Provider>
  );
};

export const useLicense = () => {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
};
