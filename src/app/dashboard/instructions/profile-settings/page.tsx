
import { getDictionary } from '@/lib/dictionaries';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Pencil, Link2, Image as ImageIcon } from 'lucide-react';
import React from 'react';

const GuideListItem = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <li className="flex items-start gap-4 py-2">
        <div className="flex-shrink-0 mt-1 text-primary">{icon}</div>
        <div className="text-muted-foreground">{children}</div>
    </li>
);

export default async function ProfileSettingsGuidePage() {
  const dict = await getDictionary('es');
  const guide = dict.instructions.guides.profileSettings;

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

                <h3 className="font-headline text-xl font-semibold pt-4 border-t">{guide.fields.title}</h3>
                <p>{guide.fields.p1}</p>
                <ul className="space-y-2 list-none p-0">
                    <GuideListItem icon={<ImageIcon className="h-5 w-5" />}>
                        <strong>{guide.fields.list.item1.title}</strong> - {guide.fields.list.item1.desc}
                    </GuideListItem>
                    <GuideListItem icon={<User className="h-5 w-5" />}>
                        <strong>{guide.fields.list.item2.title}</strong> - {guide.fields.list.item2.desc}
                    </GuideListItem>
                    <GuideListItem icon={<Pencil className="h-5 w-5" />}>
                        <strong>{guide.fields.list.item3.title}</strong> - {guide.fields.list.item3.desc}
                    </GuideListItem>
                    <GuideListItem icon={<Link2 className="h-5 w-5" />}>
                        <strong>{guide.fields.list.item4.title}</strong> - {guide.fields.list.item4.desc}
                    </GuideListItem>
                </ul>

                <h3 className="font-headline text-xl font-semibold pt-4 border-t">{guide.usage.title}</h3>
                <p>{guide.usage.p1}</p>
            </CardContent>
        </Card>
    </div>
  );
}

