import { getDictionary } from '@/lib/dictionaries';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { SchemaDisplay } from '@/components/dashboard/instructions/SchemaDisplay';

export default async function BuildingSiteGuidePage() {
  const dict = await getDictionary('es');
  const guide = dict.instructions.guides.buildingYourSite;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
        <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/instructions">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {dict.instructions.guides.back}
            </Link>
        </Button>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{guide.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-muted-foreground">{guide.intro}</p>
                <p className="text-muted-foreground">{guide.p1}</p>
                <p className="text-muted-foreground">{guide.p2}</p>
                
                <div className="pt-4 border-t">
                    <SchemaDisplay dict={guide} rawMarkdown={guide.databaseSchemaMarkdown} />
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
