import { getDictionary } from '@/lib/dictionaries';
import { LoginClient } from '@/components/auth/LoginClient';
import { doc, getDoc, collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PublicConfig, License, Invitation } from '@/types';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const dict = await getDictionary('es');

  let logoUrl: string = '/android-chrome-512x512.png'; // Default fallback
  let validInvitation: (Invitation & { id: string }) | null = null;
  let invitationError: string | null = null;

  // Check for invitation token first
  if (searchParams.token) {
    const token = searchParams.token;
    const inviteRef = doc(db, 'invitations', token);
    const inviteSnap = await getDoc(inviteRef);

    if (inviteSnap.exists()) {
      const data = inviteSnap.data() as Invitation;
      if (data.used) {
        invitationError = dict.login.invitation.used;
      } else {
        validInvitation = { id: inviteSnap.id, ...data };
      }
    } else {
      invitationError = dict.login.invitation.invalid;
    }
  }

  try {
    // Perform license check to decide if we can use the custom logo
    const licenseCol = collection(db, 'license');
    const licenseQuery = query(licenseCol, limit(1));
    const licenseSnap = await getDocs(licenseQuery);
    
    let isProOrHigher = false;

    if (!licenseSnap.empty) {
        const licenseDoc = licenseSnap.docs[0];
        const licenseData = licenseDoc.data() as License;
        
        try {
            const response = await fetch('https://keys.admin.rtsi.site/api/license/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId: licenseDoc.id, uid: licenseData.uid }),
                cache: 'no-store', // Always get fresh data on login page
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'active' && (data.plan === 'pro' || data.plan === 'ai-pro')) {
                    isProOrHigher = true;
                }
            }
        } catch (apiError) {
             console.error("API verification call failed for login page, using default logo:", apiError);
        }
    }

    if (isProOrHigher) {
        const configRef = doc(db, 'publicConfig', 'main');
        const docSnap = await getDoc(configRef);
        if (docSnap.exists()) {
            const config = docSnap.data() as PublicConfig;
            logoUrl = config.loginLogoUrl || '/android-chrome-512x512.png';
        }
    }
  } catch (error) {
    console.error("Failed to fetch public config or verify license for login page:", error);
  }

  return <LoginClient dict={dict.login} logoUrl={logoUrl} invitation={validInvitation} invitationError={invitationError} />;
}
