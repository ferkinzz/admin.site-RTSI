
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLicense } from '@/context/LicenseContext';
import { Loader2, Handshake } from 'lucide-react';

export default function DevPartnersPage() {
  const { licenseKey, licenseUid, isLoading: isLicenseLoading } = useLicense();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey || !licenseUid) {
      toast({
        title: 'License Error',
        description: 'Could not find the license information for this installation.',
        variant: 'destructive',
      });
      return;
    }
    if (!email) {
      toast({
        title: 'Input Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setIsRegistered(false);

    try {
      const response = await fetch('https://keys.admin.rtsi.site/api/license/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: licenseKey,
          uid: licenseUid,
          email: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An unknown error occurred.');
      }

      // Handle both 200 and 201 success codes
      toast({
        title: 'Success!',
        description: data.message || 'You have been registered as a partner.',
      });
      setIsRegistered(true);

    } catch (error: any) {
      console.error('Partner registration failed:', error);
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLicenseLoading) {
     return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <Handshake className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Developer Partner Program</CardTitle>
          <CardDescription>
            Register your developer email to associate this installation with your partner account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isRegistered ? (
            <div className="text-center p-4 bg-green-100/50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-md">
                <p className="font-semibold">Registration successful!</p>
                <p className="text-sm mt-2">
                    Registered. Go to https://keys.admin.rtsi.site to verify.
                </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="partner-email">Your Partner Email</Label>
                <Input
                  id="partner-email"
                  type="email"
                  placeholder="developer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || !email}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
