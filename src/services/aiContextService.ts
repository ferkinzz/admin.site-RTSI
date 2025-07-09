
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AiContext, SiteConfig } from '@/types';

let cachedContext: AiContext | null = null;

/**
 * Fetches the AI context from Firestore.
 * The context is cached after the first fetch to prevent multiple reads.
 * @returns {Promise<AiContext | null>} The AI context data or null if not found.
 */
export async function getAiContext(): Promise<AiContext | null> {
  if (cachedContext) {
    console.log('--- Returning cached AI context ---');
    return cachedContext;
  }

  console.log('--- Fetching AI context from Firestore ---');
  try {
    const configRef = doc(db, 'siteConfig', 'default-site');
    const docSnap = await getDoc(configRef);

    if (docSnap.exists()) {
      const config = docSnap.data() as SiteConfig;
      
      const context: AiContext = {
        siteName: config.siteName || '',
        aiSiteDescription: config.aiSiteDescription || '',
        aiTargetAudience: config.aiTargetAudience || '',
        aiKeyProducts: config.aiKeyProducts || '',
        aiForbiddenTopics: config.aiForbiddenTopics || '',
      };

      cachedContext = context;
      return context;
    }
    return null;
  } catch (error) {
    console.error("Error fetching AI context:", error);
    return null;
  }
}
