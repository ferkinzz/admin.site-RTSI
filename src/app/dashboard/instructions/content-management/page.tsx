
import { getDictionary } from '@/lib/dictionaries';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, FileText, ImageUp, CheckCircle, Radio, Link as LinkIcon, List, Eye } from 'lucide-react';
import React from 'react';

const GuideListItem = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <li className="flex items-start gap-4 py-2">
        <div className="flex-shrink-0 mt-1 text-primary">{icon}</div>
        <div className="text-muted-foreground">{children}</div>
    </li>
);

export default async function ContentManagementGuidePage() {
  const dict = await getDictionary('es');
  const guide = dict.instructions.guides.contentManagement;

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

                <h3 className="font-headline text-xl font-semibold pt-4 border-t">{guide.table.title}</h3>
                <p>{guide.table.p1}</p>
                <ul className="space-y-2 list-none p-0">
                    <GuideListItem icon={<FileText className="h-5 w-5" />}>
                        <strong>{guide.table.list.item1.title}</strong> - {guide.table.list.item1.desc}
                    </GuideListItem>
                    <GuideListItem icon={<Radio className="h-5 w-5" />}>
                        <strong>{guide.table.list.item2.title}</strong> - {guide.table.list.item2.desc}
                    </GuideListItem>
                    <GuideListItem icon={<List className="h-5 w-5" />}>
                        <strong>{guide.table.list.item3.title}</strong> - {guide.table.list.item3.desc}
                    </GuideListItem>
                     <GuideListItem icon={<LinkIcon className="h-5 w-5" />}>
                        <strong>{guide.table.list.item4.title}</strong> - {guide.table.list.item4.desc}
                    </GuideListItem>
                </ul>

                <h3 className="font-headline text-xl font-semibold pt-4 border-t">{guide.form.title}</h3>
                <p>{guide.form.p1}</p>
                <ul className="space-y-2 list-none p-0">
                    <GuideListItem icon={<Edit className="h-5 w-5" />}>
                        <strong>{guide.form.list.item1.title}</strong> - {guide.form.list.item1.desc}
                    </GuideListItem>
                    <GuideListItem icon={<ImageUp className="h-5 w-5" />}>
                        <strong>{guide.form.list.item2.title}</strong> - {guide.form.list.item2.desc}
                    </GuideListItem>
                    <GuideListItem icon={<Eye className="h-5 w-5" />}>
                        <strong>{guide.form.list.item3.title}</strong> - {guide.form.list.item3.desc}
                    </GuideListItem>
                     <GuideListItem icon={<CheckCircle className="h-5 w-5" />}>
                        <strong>{guide.form.list.item4.title}</strong> - {guide.form.list.item4.desc}
                    </GuideListItem>
                </ul>
            </CardContent>
        </Card>
    </div>
  );
}

