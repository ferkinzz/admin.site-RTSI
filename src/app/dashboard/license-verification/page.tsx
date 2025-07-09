
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, query, limit, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { License } from '@/types';
import { Loader2, CheckCircle, Sparkles, Copy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLicense } from '@/context/LicenseContext';
import { Textarea } from '@/components/ui/textarea';
import { notFound } from 'next/navigation';
import { suggestTitle } from '@/ai/flows/title-suggester-flow';

export default function LicenseVerificationPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const { user, loading: authLoading } = useAuth();
  const { plan, isLoading: licenseLoading } = useLicense();
  
  const [configuredLicenseKey, setConfiguredLicenseKey] = useState('');
  const [configuredUid, setConfiguredUid] = useState('');
  const [customLicenseKey, setCustomLicenseKey] = useState('');
  const [customUid, setCustomUid] = useState('');

  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [licenseRequestDetails, setLicenseRequestDetails] = useState<{ endpoint: string; body: any; curl: string; } | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const { toast } = useToast();

  // State for AI Pro Proxy Playground
  const [prompt, setPrompt] = useState('');
  const [verifyingAI, setVerifyingAI] = useState(false);
  const [aiRequestDetails, setAiRequestDetails] = useState<{
    endpoint: string;
    body: any;
    curl: string;
  } | null>(null);
  const [aiApiResponse, setAiApiResponse] = useState<any>(null);

  // State for AI Pro (Local) Playground
  const [proPrompt, setProPrompt] = useState('');
  const [testingProAI, setTestingProAI] = useState(false);
  const [proAiRequestDetails, setProAiRequestDetails] = useState<{ flow: string; input: any } | null>(null);
  const [proAiApiResponse, setProAiApiResponse] = useState<any>(null);


  const fetchConfig = useCallback(async () => {
    try {
      const licenseCol = collection(db, 'license');
      const q = query(licenseCol, limit(1));
      const licenseSnap = await getDocs(q);
      
      if (!licenseSnap.empty) {
        const licenseDoc = licenseSnap.docs[0];
        const config = licenseDoc.data() as License;
        setConfiguredLicenseKey(licenseDoc.id);
        setConfiguredUid(config.uid);
      } else {
        setConfiguredLicenseKey('Not configured');
        setConfiguredUid('Not configured');
      }
    } catch (error) {
      console.error('Failed to fetch license config', error);
      setConfiguredLicenseKey('Error fetching config');
      setConfiguredUid('Error fetching config');
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleVerify = async (licenseKey: string, uid: string) => {
    if (!licenseKey || !uid || licenseKey.includes('configured') || uid.includes('configured')) {
      toast({
        title: 'Invalid Data',
        description: 'Please provide a valid Document ID and UID to verify.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setApiResponse(null);
    setAiRequestDetails(null);
    setAiApiResponse(null);
    setProAiRequestDetails(null);
    setProAiApiResponse(null);


    const endpoint = 'https://keys.admin.rtsi.site/api/license/verify';
    const requestBody = { documentId: licenseKey, uid };
    const curlCommand = `curl -X POST ${endpoint} \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(requestBody, null, 2).replace(/'/g, "'\\''")}'`;

    setLicenseRequestDetails({
      endpoint,
      body: requestBody,
      curl: curlCommand,
    });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      setApiResponse(data);
      toast({
        title: 'Verification complete',
        description: `API responded with status: ${response.status}`,
      });

    } catch (error: any) {
      setApiResponse({ error: 'Fetch failed', message: error.message });
      toast({
        title: 'API Request Failed',
        description: 'Could not connect to the verification API. Check the console for details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAiProxySubmit = async () => {
    if (!prompt || !configuredLicenseKey || !configuredUid || configuredLicenseKey.includes('configured')) {
        toast({
            title: 'Invalid Data',
            description: 'Cannot send request without a valid license configuration and prompt.',
            variant: 'destructive',
        });
        return;
    }
    
    setVerifyingAI(true);
    const endpoint = 'https://keys.admin.rtsi.site/api/ai/proxy';
    const requestBody = { documentId: configuredLicenseKey, uid: configuredUid, prompt };
    
    const curlCommand = `curl -X POST ${endpoint} \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(requestBody, null, 2).replace(/'/g, "'\\''")}'`;

    setAiRequestDetails({
      endpoint,
      body: requestBody,
      curl: curlCommand,
    });
    setAiApiResponse(null);
    setLicenseRequestDetails(null);
    setApiResponse(null);
    setProAiRequestDetails(null);
    setProAiApiResponse(null);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        setAiApiResponse(data);
        toast({
            title: 'AI Proxy request complete',
            description: `API responded with status: ${response.status}`,
        });

    } catch (error: any) {
        setAiApiResponse({ error: 'Fetch failed', message: error.message });
        toast({
            title: 'API Request Failed',
            description: 'Could not connect to the AI proxy API.',
            variant: 'destructive',
        });
    } finally {
        setVerifyingAI(false);
    }
  };

  const handleTestProAI = async () => {
    if (!proPrompt) {
        toast({ title: 'Prompt is empty', description: 'Please enter a prompt to test the AI flow.', variant: 'destructive' });
        return;
    }
    setTestingProAI(true);
    setProAiRequestDetails({ flow: 'suggestTitle', input: { title: proPrompt } });
    setProAiApiResponse(null);
    setLicenseRequestDetails(null);
    setApiResponse(null);
    setAiRequestDetails(null);
    setAiApiResponse(null);

    try {
        const result = await suggestTitle(proPrompt);
        setProAiApiResponse(result);
        toast({ title: 'Local AI call successful', description: 'The Genkit flow executed without errors.' });
    } catch (error: any) {
        setProAiApiResponse({ error: 'Flow failed', message: error.message });
        toast({ title: 'Local AI call failed', description: error.message, variant: 'destructive' });
    } finally {
        setTestingProAI(false);
    }
  };

  const handleSimulateFirstRun = async () => {
    if (!user) {
        toast({ title: 'Error', description: 'You must be logged in to perform this action.', variant: 'destructive' });
        return;
    }
    setSimulating(true);
    try {
        const newLicenseRef = doc(collection(db, 'license'));
        await setDoc(newLicenseRef, { uid: user.uid });
        toast({
            title: 'Success!',
            description: `New license document created with ID: ${newLicenseRef.id}`,
        });
        await fetchConfig();
    } catch (error: any) {
        console.error("Error creating license doc:", error);
        toast({ title: 'Error', description: 'Failed to create license document.', variant: 'destructive' });
    } finally {
        setSimulating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="text-primary h-6 w-6" />
            Current Plan Status
          </CardTitle>
          <CardDescription>
            This is the plan currently active for the application based on the last license check.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {licenseLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Verifying license...</span>
            </div>
          ) : (
            <p className="text-lg">
              The application is running on the <span className="font-bold text-primary capitalize">{plan.replace('_', '-')}</span> plan.
            </p>
          )}
        </CardContent>
      </Card>

      {plan === 'pro' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-primary h-6 w-6" />
                Pro Plan AI Playground (Local Genkit)
            </CardTitle>
            <CardDescription>
                Test a local Genkit AI flow. This requires a GEMINI_API_KEY to be set in your environment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="pro-ai-prompt">Test Prompt (e.g., a long title)</Label>
              <Textarea 
                id="pro-ai-prompt"
                placeholder="E.g., The best strategies for digital marketing in 2024 for small businesses"
                value={proPrompt}
                onChange={(e) => setProPrompt(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleTestProAI} disabled={testingProAI || !proPrompt}>
              {testingProAI && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test Local AI Flow
            </Button>
          </CardContent>
        </Card>
      )}
      
      {plan === 'ai_pro' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-primary h-6 w-6" />
                AI Pro Proxy Playground
            </CardTitle>
            <CardDescription>
                Test the AI proxy API endpoint. This uses the configured Document ID and UID from above.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="ai-prompt">Prompt</Label>
              <Textarea 
                id="ai-prompt"
                placeholder="E.g., Write a short poem about AI..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleAiProxySubmit} disabled={verifyingAI || !prompt}>
              {verifyingAI && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send to AI Proxy
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>License Verification Debugger</CardTitle>
          <CardDescription>
            Use this page to test the license verification API endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 p-4 border rounded-md">
            <h3 className="font-semibold">Test with Configured License</h3>
             <p className="text-sm text-muted-foreground">
                Document ID: <span className="font-mono bg-muted px-1 py-0.5 rounded">{configuredLicenseKey}</span>
            </p>
             <p className="text-sm text-muted-foreground">
                User ID: <span className="font-mono bg-muted px-1 py-0.5 rounded">{configuredUid}</span>
            </p>
            <Button onClick={() => handleVerify(configuredLicenseKey, configuredUid)} disabled={loading || configuredLicenseKey.includes('configured')}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Configured License
            </Button>
          </div>

          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="font-semibold">Test with Custom Data</h3>
            <div className="space-y-1">
              <Label htmlFor="custom-key">Document ID</Label>
              <Input
                id="custom-key"
                placeholder="Enter Document ID"
                value={customLicenseKey}
                onChange={(e) => setCustomLicenseKey(e.target.value)}
              />
            </div>
            <div className="space-y-1">
                <Label htmlFor="custom-uid">User ID</Label>
                <Input
                    id="custom-uid"
                    placeholder="Enter User ID"
                    value={customUid}
                    onChange={(e) => setCustomUid(e.target.value)}
                />
            </div>
            <Button onClick={() => handleVerify(customLicenseKey, customUid)} disabled={loading || !customLicenseKey || !customUid}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Custom Data
            </Button>
          </div>
          
          <div className="space-y-4 p-4 border rounded-md bg-muted/50">
            <h3 className="font-semibold">Simulate First Run</h3>
            <p className="text-sm text-muted-foreground">
              This will create a new document in the 'license' collection with a random ID, using your current User ID. This is useful for testing if the license collection is empty or has been deleted.
            </p>
            <Button onClick={handleSimulateFirstRun} disabled={authLoading || simulating || !user}>
                {simulating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create License Document
            </Button>
          </div>

          {(apiResponse || aiApiResponse || licenseRequestDetails || aiRequestDetails || proAiRequestDetails || proAiApiResponse) && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">API Results</h3>
              
              {proAiRequestDetails && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Local AI Request Details</h4>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Flow Called:</p>
                    <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto font-mono">
                      {proAiRequestDetails.flow}
                    </pre>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Input:</p>
                    <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto font-mono">
                      {JSON.stringify(proAiRequestDetails.input, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {proAiApiResponse && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Response (Local AI)</h4>
                  <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(proAiApiResponse, null, 2)}
                  </pre>
                </div>
              )}

              {licenseRequestDetails && (
                <div className="space-y-4">
                  <h4 className="font-semibold">License Verification Request Details</h4>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Endpoint:</p>
                    <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto font-mono">
                      POST {licenseRequestDetails.endpoint}
                    </pre>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Request Body:</p>
                    <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto font-mono">
                      {JSON.stringify(licenseRequestDetails.body, null, 2)}
                    </pre>
                  </div>
                  <div className="space-y-1 text-sm">
                    <Label>cURL Command</Label>
                    <div className="relative">
                      <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto font-mono pr-10">
                        {licenseRequestDetails.curl}
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-7 w-7"
                        onClick={() => {
                          navigator.clipboard.writeText(licenseRequestDetails.curl);
                          toast({ title: 'Comando copiado!' });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {apiResponse && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Response (License Verification)</h4>
                  <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              )}

              {aiRequestDetails && (
                <div className="space-y-4">
                  <h4 className="font-semibold">AI Proxy Request Details</h4>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Endpoint:</p>
                    <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto font-mono">
                      POST {aiRequestDetails.endpoint}
                    </pre>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Request Body:</p>
                    <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto font-mono">
                      {JSON.stringify(aiRequestDetails.body, null, 2)}
                    </pre>
                  </div>
                  <div className="space-y-1 text-sm">
                    <Label>cURL Command</Label>
                    <div className="relative">
                      <pre className="p-2 bg-muted rounded-md text-xs overflow-x-auto font-mono pr-10">
                        {aiRequestDetails.curl}
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-7 w-7"
                        onClick={() => {
                          navigator.clipboard.writeText(aiRequestDetails.curl);
                          toast({ title: 'Comando copiado!' });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {aiApiResponse && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Response (AI Proxy)</h4>
                  <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(aiApiResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
