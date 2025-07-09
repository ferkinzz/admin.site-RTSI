
import { getDictionary } from '@/lib/dictionaries';
import { ProfileForm } from '@/components/dashboard/settings/ProfileForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function SettingsPage() {
  const dict = await getDictionary('es');

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{dict.settings.title}</CardTitle>
          <CardDescription>{dict.settings.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm dict={dict.settings} />
        </CardContent>
      </Card>
    </div>
  );
}
