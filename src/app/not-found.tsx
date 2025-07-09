
import { getDictionary } from '@/lib/dictionaries';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Compass } from 'lucide-react';

export default async function NotFound() {
  const dict = await getDictionary('es');
  const d = dict.notFound;

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <Compass className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-5xl font-extrabold font-headline text-primary">404</CardTitle>
            <CardDescription className="text-2xl font-semibold mt-2">{d.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {d.description}
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard">{d.backButton}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
