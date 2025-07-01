import { getDictionary } from '@/lib/dictionaries';
// import type { Locale } from '@/types';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default async function LoginPage() {
  const dict = await getDictionary('es');
  const logoUrl = process.env.NEXT_PUBLIC_LOGIN_LOGO_URL;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="flex flex-col items-center gap-6">
        {logoUrl && (
          <div className="relative h-20 w-48">
            <Image
              src={logoUrl}
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        )}
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-center">
              {dict.login.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoginForm dict={dict.login} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
