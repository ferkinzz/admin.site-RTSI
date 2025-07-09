'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import React, { useEffect, useState, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Dictionary, SiteConfig, PublicConfig } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useLicense } from '@/context/LicenseContext';
import { Lock, Upload, Trash2, Bot } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  siteName: z.string().max(30, { message: 'El nombre del sitio no puede tener más de 30 caracteres.' }).optional().or(z.literal('')),
  deployHookUrl: z.string().url({ message: 'Por favor, introduce una URL válida.' }).or(z.literal('')),
  siteUrl: z.string().url({ message: 'Por favor, introduce una URL válida.' }).or(z.literal('')),
  loginLogoUrl: z.string().url({ message: 'Por favor, introduce una URL válida.' }).or(z.literal('')),
  blogPath: z.string().optional().or(z.literal('')),
  resourcesPath: z.string().optional().or(z.literal('')),
  videosPath: z.string().optional().or(z.literal('')),
  otherPath: z.string().optional().or(z.literal('')),
  aiSiteDescription: z.string().optional().or(z.literal('')),
  aiTargetAudience: z.string().optional().or(z.literal('')),
  aiKeyProducts: z.string().optional().or(z.literal('')),
  aiForbiddenTopics: z.string().optional().or(z.literal('')),
});

type SiteConfigFormProps = {
  dict: Dictionary['siteSettings'];
};

export function SiteConfigForm({ dict }: SiteConfigFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const { plan } = useLicense();
  const isProOrHigher = plan === 'pro' || plan === 'ai_pro';

  // State for logo upload
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      siteName: '',
      deployHookUrl: '',
      siteUrl: '',
      loginLogoUrl: '',
      blogPath: '',
      resourcesPath: '',
      videosPath: '',
      otherPath: '',
      aiSiteDescription: '',
      aiTargetAudience: '',
      aiKeyProducts: '',
      aiForbiddenTopics: '',
    },
  });

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      try {
        const siteConfigRef = doc(db, 'siteConfig', 'default-site');
        const publicConfigRef = doc(db, 'publicConfig', 'main');

        const [siteConfigSnap, publicConfigSnap] = await Promise.all([
          getDoc(siteConfigRef),
          getDoc(publicConfigRef),
        ]);

        const siteConfigData = siteConfigSnap.exists() ? siteConfigSnap.data() as SiteConfig : {};
        const publicConfigData = publicConfigSnap.exists() ? publicConfigSnap.data() as PublicConfig : {};

        form.reset({
          siteName: siteConfigData.siteName || '',
          deployHookUrl: siteConfigData.deployHookUrl || '',
          siteUrl: siteConfigData.siteUrl || '',
          loginLogoUrl: publicConfigData.loginLogoUrl || '',
          blogPath: siteConfigData.blogPath || '',
          resourcesPath: siteConfigData.resourcesPath || '',
          videosPath: siteConfigData.videosPath || '',
          otherPath: siteConfigData.otherPath || '',
          aiSiteDescription: siteConfigData.aiSiteDescription || '',
          aiTargetAudience: siteConfigData.aiTargetAudience || '',
          aiKeyProducts: siteConfigData.aiKeyProducts || '',
          aiForbiddenTopics: siteConfigData.aiForbiddenTopics || '',
        });
        
        setImagePreview(publicConfigData.loginLogoUrl || null);

      } catch (error) {
        console.error('Error fetching site config:', error);
        toast({
          title: 'Error',
          description: dict.fetchError,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, [form, toast, dict.fetchError]);

  const handleLogoUpload = async (file: File) => {
    if (!isProOrHigher) return;

    if (!file.type.startsWith('image/')) {
        toast({ title: 'Archivo inválido', description: 'Por favor, sube un archivo de imagen.', variant: 'destructive' });
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        toast({ title: 'Archivo demasiado grande', description: 'El tamaño del logo no puede exceder los 2MB.', variant: 'destructive' });
        return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `config/login-logo/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
        'state_changed',
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
        },
        (error) => {
            console.error('Logo upload failed:', error);
            toast({ title: dict.logoUploadError, variant: 'destructive' });
            setIsUploading(false);
            setUploadProgress(null);
        },
        async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            form.setValue('loginLogoUrl', downloadURL, { shouldValidate: true, shouldDirty: true });
            setImagePreview(downloadURL);
            toast({ title: dict.logoUploadSuccess });
            setIsUploading(false);
            setUploadProgress(null);
        }
    );
  };
  
  const handleLogoDelete = () => {
    setImagePreview(null);
    form.setValue('loginLogoUrl', '', { shouldValidate: true, shouldDirty: true });
    if (logoInputRef.current) {
        logoInputRef.current.value = '';
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const siteConfigValues = {
        siteName: values.siteName,
        deployHookUrl: values.deployHookUrl,
        siteUrl: values.siteUrl,
        blogPath: values.blogPath,
        resourcesPath: values.resourcesPath,
        videosPath: values.videosPath,
        otherPath: values.otherPath,
        aiSiteDescription: values.aiSiteDescription,
        aiTargetAudience: values.aiTargetAudience,
        aiKeyProducts: values.aiKeyProducts,
        aiForbiddenTopics: values.aiForbiddenTopics,
      };

      const publicConfigValues = {
        loginLogoUrl: values.loginLogoUrl,
      };

      const publicConfigRef = doc(db, 'publicConfig', 'main');
      const siteConfigRef = doc(db, 'siteConfig', 'default-site');

      await Promise.all([
        setDoc(publicConfigRef, publicConfigValues, { merge: true }),
        setDoc(siteConfigRef, siteConfigValues, { merge: true })
      ]);

      toast({
        title: dict.successTitle,
        description: dict.successMessage,
      });
      // Force a reload to apply new settings across the app
      window.location.reload();
    } catch (error) {
      console.error('Error saving site config:', error);
      toast({
        title: 'Error',
        description: dict.saveError,
        variant: 'destructive',
      });
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">{dict.generalSettingsCardTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="siteName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    {dict.siteNameLabel}
                    {!isProOrHigher && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={dict.aiContext.siteNamePlaceholder} {...field} disabled={!isProOrHigher} />
                  </FormControl>
                  <FormDescription>
                    {dict.siteNameDescription}
                    {!isProOrHigher && <span className="text-primary font-medium ml-1">{dict.proFeatureDescription}</span>}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="siteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.siteUrlLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-domain.com" {...field} />
                  </FormControl>
                  <FormDescription>{dict.siteUrlDescription}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">{dict.logoCardTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="loginLogoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    {dict.loginLogoUrlLabel}
                    {!isProOrHigher && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </FormLabel>
                  <FormDescription>
                    {dict.loginLogoUrlDescription}
                    {!isProOrHigher && <span className="text-primary font-medium ml-1">{dict.proFeatureDescription}</span>}
                  </FormDescription>

                  {isProOrHigher && (
                    <div className="space-y-4 pt-2">
                        {imagePreview && (
                            <div className="relative w-48 h-24 p-2 border rounded-md bg-muted/30">
                                <Image src={imagePreview} alt="Logo Preview" fill className="object-contain"/>
                            </div>
                        )}
                        {isUploading && uploadProgress !== null && (
                            <Progress value={uploadProgress} className="w-full max-w-sm" />
                        )}
                        <div className="flex items-center gap-2">
                            <Button type="button" onClick={() => logoInputRef.current?.click()} disabled={isUploading}>
                                <Upload className="mr-2 h-4 w-4" />
                                {isUploading ? dict.uploadingLogoButton : imagePreview ? dict.changeLogoButton : dict.uploadLogoButton}
                            </Button>
                            {imagePreview && (
                                <Button type="button" variant="ghost" size="icon" onClick={handleLogoDelete} disabled={isUploading}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <Input 
                            id="logo-upload"
                            type="file" 
                            className="hidden" 
                            ref={logoInputRef} 
                            accept="image/png, image/jpeg, image/gif, image/webp, image/svg+xml"
                            onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} 
                        />
                    </div>
                  )}

                  <FormControl>
                    <Input placeholder="https://your-logo-url.png" {...field} disabled={!isProOrHigher} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">{dict.integrationsCardTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="deployHookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dict.deployHookUrlLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.cloudflare.com/..." {...field} />
                  </FormControl>
                  <FormDescription>{dict.deployHookUrlDescription}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">{dict.pathsCardTitle}</CardTitle>
            <CardDescription>{dict.pathSettingsDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>{dict.viewSettings}</AccordionTrigger>
                <AccordionContent className="pt-6 space-y-6">
                  <FormField
                    control={form.control}
                    name="blogPath"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{dict.blogPathLabel}</FormLabel>
                        <FormControl>
                            <Input placeholder="/blog" {...field} />
                        </FormControl>
                        <FormDescription>{dict.blogPathDescription}</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="resourcesPath"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{dict.resourcesPathLabel}</FormLabel>
                        <FormControl>
                            <Input placeholder="/recursos" {...field} />
                        </FormControl>
                        <FormDescription>{dict.resourcesPathDescription}</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="videosPath"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{dict.videosPathLabel}</FormLabel>
                        <FormControl>
                            <Input placeholder="/videos" {...field} />
                        </FormControl>
                        <FormDescription>{dict.videosPathDescription}</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="otherPath"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{dict.otherPathLabel}</FormLabel>
                        <FormControl>
                            <Input placeholder="/archivo" {...field} />
                        </FormControl>
                        <FormDescription>{dict.otherPathDescription}</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center gap-2">
              <Bot className="h-5 w-5" />
              {dict.aiContextCardTitle}
            </CardTitle>
            <CardDescription>{dict.aiContext.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>{dict.viewSettings}</AccordionTrigger>
                <AccordionContent className="pt-6">
                    <FormDescription className="pb-6">
                        {isProOrHigher
                          ? dict.aiContext.formDescription
                          : dict.upgradePlanPrompt 
                        }
                    </FormDescription>
                    <fieldset disabled={!isProOrHigher} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="aiSiteDescription"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{dict.aiContext.siteDescriptionLabel}</FormLabel>
                                <FormControl>
                                    <Textarea placeholder={dict.aiContext.siteDescriptionPlaceholder} {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="aiTargetAudience"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{dict.aiContext.targetAudienceLabel}</FormLabel>
                                <FormControl>
                                    <Input placeholder={dict.aiContext.targetAudiencePlaceholder} {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="aiKeyProducts"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{dict.aiContext.keyProductsLabel}</FormLabel>
                                <FormControl>
                                    <Textarea placeholder={dict.aiContext.keyProductsPlaceholder} {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="aiForbiddenTopics"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>{dict.aiContext.forbiddenTopicsLabel}</FormLabel>
                                <FormControl>
                                    <Textarea placeholder={dict.aiContext.forbiddenTopicsPlaceholder} {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </fieldset>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
            ) : (
              dict.submitButton
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
