
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Download, UserCircle, Trash2, Contact as ContactIcon, Rocket, Lock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useLicense } from '@/context/LicenseContext';
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';

const defaultVCardValues = {
  firstName: '',
  lastName: '',
  organization: '',
  title: '',
  phoneWork: '',
  phoneHome: '',
  phoneMobile: '',
  emailWork: '',
  emailPersonal: '',
  website: '',
  addressStreet: '',
  addressCity: '',
  addressState: '',
  addressZip: '',
  addressCountry: '',
  notes: '',
  photo: '', // Base64 string
};

export default function VCardGeneratorPage() {
  const [dict, setDict] = useState<Dictionary | null>(null);
  const { plan } = useLicense();
  const { user, loading: authLoading } = useAuth();
  const isPro = plan === 'pro' || plan === 'ai_pro';
  const canAccess = isPro && (user?.role === 'Admin' || user?.role === 'Redactor' || user?.role === 'Redactor Jr.');

  const [vCardData, setVCardData] = useState(defaultVCardValues);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    getDictionary('es').then(setDict);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVCardData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!dict) return;
    const d = dict.tools.vcfGenerator;
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: d.toastPhotoTooLargeTitle,
          description: d.toastPhotoTooLargeDesc,
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setVCardData(prev => ({ ...prev, photo: base64String }));
        setPhotoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setVCardData(prev => ({ ...prev, photo: '' }));
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateVCardString = () => {
    let vCardString = "BEGIN:VCARD\nVERSION:3.0\n";
    if (vCardData.firstName || vCardData.lastName) {
      vCardString += `N:${vCardData.lastName};${vCardData.firstName};;;\n`;
      vCardString += `FN:${vCardData.firstName} ${vCardData.lastName}\n`;
    }
    if (vCardData.organization) vCardString += `ORG:${vCardData.organization}\n`;
    if (vCardData.title) vCardString += `TITLE:${vCardData.title}\n`;
    if (vCardData.phoneWork) vCardString += `TEL;TYPE=WORK,VOICE:${vCardData.phoneWork}\n`;
    if (vCardData.phoneHome) vCardString += `TEL;TYPE=HOME,VOICE:${vCardData.phoneHome}\n`;
    if (vCardData.phoneMobile) vCardString += `TEL;TYPE=CELL,VOICE:${vCardData.phoneMobile}\n`;
    if (vCardData.emailWork) vCardString += `EMAIL;TYPE=WORK,INTERNET:${vCardData.emailWork}\n`;
    if (vCardData.emailPersonal) vCardString += `EMAIL;TYPE=HOME,INTERNET:${vCardData.emailPersonal}\n`;
    if (vCardData.website) vCardString += `URL:${vCardData.website}\n`;
    if (vCardData.addressStreet || vCardData.addressCity || vCardData.addressState || vCardData.addressZip || vCardData.addressCountry) {
      vCardString += `ADR;TYPE=WORK:;;${vCardData.addressStreet};${vCardData.addressCity};${vCardData.addressState};${vCardData.addressZip};${vCardData.addressCountry}\n`;
    }
    if (vCardData.notes) vCardString += `NOTE:${vCardData.notes.replace(/\n/g, '\\n')}\n`;
    if (vCardData.photo) {
      const photoBase64 = vCardData.photo.substring(vCardData.photo.indexOf(',') + 1);
      const photoType = vCardData.photo.substring(vCardData.photo.indexOf(':') + 1, vCardData.photo.indexOf(';'));
      const validTypes = ['JPEG', 'PNG', 'GIF'];
      const upperType = photoType.toUpperCase().split('/')[1] || 'JPEG';
      const finalType = validTypes.includes(upperType) ? upperType : 'JPEG';
      vCardString += `PHOTO;ENCODING=b;TYPE=${finalType}:${photoBase64}\n`;
    }
    vCardString += "END:VCARD";
    return vCardString;
  };

  const handleDownload = () => {
    if (!dict) return;
    const d = dict.tools.vcfGenerator;
    if (!vCardData.firstName && !vCardData.lastName && !vCardData.organization) {
      toast({
        variant: "destructive",
        title: d.toastInsufficientDataTitle,
        description: d.toastInsufficientDataDesc,
      });
      return;
    }

    const vCardString = generateVCardString();
    const blob = new Blob([vCardString], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = (vCardData.firstName || vCardData.lastName || vCardData.organization || 'contacto').replace(/\s+/g, '_').toLowerCase();
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.vcf`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: d.toastDownloadStartedTitle,
      description: d.toastDownloadStartedDesc.replace('{filename}', `${filename}.vcf`),
    });
  };

  if (authLoading || !dict) {
    return (
      <div className="space-y-8">
          <div className="text-center space-y-4">
              <Skeleton className="h-16 w-16 mx-auto rounded-full" />
              <Skeleton className="h-12 w-3/4 mx-auto" />
              <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <div className="md:col-span-2 space-y-6">
                  <Skeleton className="h-[400px] w-full" />
              </div>
              <div className="space-y-6">
                  <Skeleton className="h-[300px] w-full" />
              </div>
          </div>
      </div>
    )
  }
  
  const d = dict.tools.vcfGenerator;
  const { imageOptimizer: dTools } = dict.tools;

  if (!canAccess) {
    return (
      <div className="flex items-center justify-center h-full">
          <Card className="w-full max-w-md text-center">
              <CardHeader>
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                     {!isPro ? <Rocket className="h-8 w-8 text-primary" /> : <Lock className="h-8 w-8 text-primary" />}
                  </div>
                  <CardTitle className="mt-4">{!isPro ? dTools.upgradeTitle : dTools.roleErrorTitle}</CardTitle>
                  <CardDescription>{!isPro ? dTools.upgradeDescription : dTools.roleErrorDescription}</CardDescription>
              </CardHeader>
              {!isPro && (
                <CardContent>
                    <p className="text-sm text-muted-foreground">{dTools.upgradeCTA}</p>
                </CardContent>
              )}
          </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <section className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <ContactIcon className="w-16 h-16 text-primary" />
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
          {d.pageTitleHtml[0]} <span className="text-primary">{d.pageTitleHtml[1]}</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          {d.pageDescription}
        </p>
      </section>

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        <form className="md:col-span-2 space-y-8" onSubmit={(e) => e.preventDefault()}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl">{d.mainInfoTitle}</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">{d.firstNameLabel}</Label>
                <Input id="firstName" name="firstName" value={vCardData.firstName} onChange={handleInputChange} placeholder={d.firstNamePlaceholder} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{d.lastNameLabel}</Label>
                <Input id="lastName" name="lastName" value={vCardData.lastName} onChange={handleInputChange} placeholder={d.lastNamePlaceholder} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">{d.organizationLabel}</Label>
                <Input id="organization" name="organization" value={vCardData.organization} onChange={handleInputChange} placeholder={d.organizationPlaceholder} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">{d.titleLabel}</Label>
                <Input id="title" name="title" value={vCardData.title} onChange={handleInputChange} placeholder={d.titlePlaceholder} />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
              <CardHeader>
                  <CardTitle className="font-headline text-xl">{d.photoTitle}</CardTitle>
                  <CardDescription>{d.photoDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {photoPreview ? (
                      <div className="relative group w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-primary shadow-md">
                          <Image src={photoPreview} alt={d.photoAlt} fill className="object-cover" />
                          <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7"
                              onClick={removePhoto}
                              aria-label={d.photoRemoveAriaLabel}
                          >
                              <Trash2 className="w-4 h-4" />
                          </Button>
                      </div>
                  ) : (
                      <div className="w-32 h-32 mx-auto rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                          <UserCircle className="w-16 h-16 text-muted-foreground" />
                      </div>
                  )}
                  <div className="max-w-sm mx-auto">
                      <Label htmlFor="photoUpload" className="sr-only">{d.photoUploadLabel}</Label>
                      <Input
                          id="photoUpload"
                          name="photoUpload"
                          type="file"
                          accept="image/png, image/jpeg, image/gif"
                          onChange={handlePhotoChange}
                          ref={fileInputRef}
                          className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                  </div>
              </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl">{d.contactDetailsTitle}</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phoneWork">{d.phoneWorkLabel}</Label>
                <Input id="phoneWork" name="phoneWork" type="tel" value={vCardData.phoneWork} onChange={handleInputChange} placeholder={d.phonePlaceholder} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneMobile">{d.phoneMobileLabel}</Label>
                <Input id="phoneMobile" name="phoneMobile" type="tel" value={vCardData.phoneMobile} onChange={handleInputChange} placeholder={d.phonePlaceholder} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailWork">{d.emailWorkLabel}</Label>
                <Input id="emailWork" name="emailWork" type="email" value={vCardData.emailWork} onChange={handleInputChange} placeholder={d.emailWorkPlaceholder} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailPersonal">{d.emailPersonalLabel}</Label>
                <Input id="emailPersonal" name="emailPersonal" type="email" value={vCardData.emailPersonal} onChange={handleInputChange} placeholder={d.emailPersonalPlaceholder} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="website">{d.websiteLabel}</Label>
                <Input id="website" name="website" type="url" value={vCardData.website} onChange={handleInputChange} placeholder={d.websitePlaceholder} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl">{d.addressTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="addressStreet">{d.addressStreetLabel}</Label>
                <Input id="addressStreet" name="addressStreet" value={vCardData.addressStreet} onChange={handleInputChange} placeholder={d.addressStreetPlaceholder} />
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                  <Label htmlFor="addressCity">{d.addressCityLabel}</Label>
                  <Input id="addressCity" name="addressCity" value={vCardData.addressCity} onChange={handleInputChange} placeholder={d.addressCityPlaceholder} />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="addressState">{d.addressStateLabel}</Label>
                  <Input id="addressState" name="addressState" value={vCardData.addressState} onChange={handleInputChange} placeholder={d.addressStatePlaceholder} />
                  </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                  <Label htmlFor="addressZip">{d.addressZipLabel}</Label>
                  <Input id="addressZip" name="addressZip" value={vCardData.addressZip} onChange={handleInputChange} placeholder={d.addressZipPlaceholder} />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="addressCountry">{d.addressCountryLabel}</Label>
                  <Input id="addressCountry" name="addressCountry" value={vCardData.addressCountry} onChange={handleInputChange} placeholder={d.addressCountryPlaceholder} />
                  </div>
              </div>
            </CardContent>
          </Card>

           <Card className="shadow-lg">
              <CardHeader>
                  <CardTitle className="font-headline text-xl">{d.notesTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-2">
                      <Label htmlFor="notes">{d.notesLabel}</Label>
                      <Textarea
                          id="notes"
                          name="notes"
                          value={vCardData.notes}
                          onChange={handleInputChange}
                          placeholder={d.notesPlaceholder}
                          rows={4}
                      />
                  </div>
              </CardContent>
          </Card>

          <Button type="button" onClick={handleDownload} className="w-full shadow-md hover:shadow-lg transition-shadow" size="lg">
            <Download className="mr-2 h-5 w-5" />
            {d.downloadButton}
          </Button>
        </form>

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                {d.faqTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {d.faqItems.map((item, index) => (
                  <AccordionItem value={`faq-${index}`} key={`faq-${index}`}>
                    <AccordionTrigger className="text-sm text-left hover:text-primary">{item.question}</AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    

    