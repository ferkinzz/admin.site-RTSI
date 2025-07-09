'use server';

/**
 * Triggers a deploy webhook.
 * This is a server action that is called from the client (ContentForm.tsx),
 * but executes on the server, which bypasses browser CORS restrictions.
 * @param deployHookUrl The URL of the webhook to trigger.
 * @returns An object indicating success or failure.
 */
export async function triggerDeploy(deployHookUrl: string) {
  if (!deployHookUrl) {
    console.error('--- DEPLOY HOOK FAILED: URL not provided ---');
    return { success: false, error: 'Deploy hook URL is not configured.' };
  }

  console.log('--- TRIGGERING DEPLOY HOOK ---', deployHookUrl);
  try {
    const response = await fetch(deployHookUrl, {
      method: 'POST',
      body: '',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Deploy hook failed with status ${response.status}: ${errorText}`);
    }

    console.log('--- DEPLOY HOOK TRIGGERED SUCCESSFULLY ---');
    return { success: true };
  } catch (error) {
    console.error('--- DEPLOY HOOK FETCH FAILED ---', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
