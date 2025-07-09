
import { getDictionary } from '@/lib/dictionaries';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LayoutDashboard, FileText, User, Settings2, ArrowRight, Code2 } from 'lucide-react';
import Link from 'next/link';

export default async function InstructionsPage() {
  const dict = await getDictionary('es');

  const guides = [
    {
      title: dict.instructions.controlPanelTitle,
      description: dict.instructions.controlPanelDescription,
      href: '/dashboard/instructions/control-panel',
      icon: <LayoutDashboard className="h-8 w-8 text-primary" />,
    },
    {
      title: dict.instructions.contentManagementTitle,
      description: dict.instructions.contentManagementDescription,
      href: '/dashboard/instructions/content-management',
      icon: <FileText className="h-8 w-8 text-primary" />,
    },
    {
      title: dict.instructions.profileSettingsTitle,
      description: dict.instructions.profileSettingsDescription,
      href: '/dashboard/instructions/profile-settings',
      icon: <User className="h-8 w-8 text-primary" />,
    },
    {
      title: dict.instructions.siteSettingsTitle,
      description: dict.instructions.siteSettingsDescription,
      href: '/dashboard/instructions/site-settings',
      icon: <Settings2 className="h-8 w-8 text-primary" />,
    },
    {
      title: dict.instructions.buildingYourSiteTitle,
      description: dict.instructions.buildingYourSiteDescription,
      href: '/dashboard/instructions/building-your-site',
      icon: <Code2 className="h-8 w-8 text-primary" />,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{dict.instructions.title}</h1>
        <p className="text-muted-foreground">{dict.instructions.description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guides.map((guide) => (
          <Link href={guide.href} key={guide.href} className="group">
            <Card className="h-full hover:border-primary/50 hover:bg-muted/50 transition-all">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <div>{guide.icon}</div>
                <div className="flex-1">
                  <CardTitle className="text-xl">{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
