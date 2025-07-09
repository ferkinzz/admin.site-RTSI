
import { getDictionary } from '@/lib/dictionaries';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Image as ImageIcon, Globe, Zap, Route } from 'lucide-react';
import React from 'react';

const GuideListItem = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <li className="flex items-start gap-4 py-2">
        <div className="flex-shrink-0 mt-1 text-primary">{icon}</div>
        <div className="text-muted-foreground">{children}</div>
    </li>
);

export default async function SiteSettingsGuidePage() {
  const dict = await getDictionary('es');
  const guide = dict.instructions.guides.siteSettings;

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

                <h3 className="font-headline text-xl font-semibold pt-4 border-t">{guide.general.title}</h3>
                <ul className="space-y-2 list-none p-0">
                    <GuideListItem icon={<Settings className="h-5 w-5" />}>
                        <strong>{guide.general.list.item1.title}</strong> - {guide.general.list.item1.desc}
                    </GuideListItem>
                    <GuideListItem icon={<Globe className="h-5 w-5" />}>
                        <strong>{guide.general.list.item2.title}</strong> - {guide.general.list.item2.desc}
                    </GuideListItem>
                    <GuideListItem icon={<ImageIcon className="h-5 w-5" />}>
                        <strong>{guide.general.list.item3.title}</strong> - {guide.general.list.item3.desc}
                    </GuideListItem>
                </ul>
                
                <h3 className="font-headline text-xl font-semibold pt-4 border-t">{guide.integrations.title}</h3>
                <ul className="space-y-2 list-none p-0">
                    <GuideListItem icon={<Zap className="h-5 w-5" />}>
                        <strong>{guide.integrations.list.item1.title}</strong> - {guide.integrations.list.item1.desc}
                    </GuideListItem>
                </ul>

                <h3 className="font-headline text-xl font-semibold pt-4 border-t">{guide.paths.title}</h3>
                 <ul className="space-y-2 list-none p-0">
                    <GuideListItem icon={<Route className="h-5 w-5" />}>
                        <strong>{guide.paths.list.item1.title}</strong> - {guide.paths.list.item1.desc}
                    </GuideListItem>
                </ul>
            </CardContent>
        </Card>
    </div>
  );
}

