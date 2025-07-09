
'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from "@/hooks/use-toast";
import { Compass, QrCode, Copy, ExternalLink, Download, Smartphone, AtSign, Rocket, Lock } from 'lucide-react';
import { useLicense } from '@/context/LicenseContext';
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';

type Platform = 'whatsapp' | 'telegram';

export default function LinkGeneratorPage() {
    const [dict, setDict] = useState<Dictionary | null>(null);
    const { plan } = useLicense();
    const { user, loading: authLoading } = useAuth();
    const isPro = plan === 'pro' || plan === 'ai_pro';
    const canAccess = isPro && (user?.role === 'Admin' || user?.role === 'Redactor' || user?.role === 'Redactor Jr.');

    const [platform, setPlatform] = useState<Platform>('whatsapp');
    const [identifier, setIdentifier] = useState('');
    const [message, setMessage] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const qrCanvasRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // Debounce effect
    const [debouncedIdentifier, setDebouncedIdentifier] = useState(identifier);
    const [debouncedMessage, setDebouncedMessage] = useState(message);

    useEffect(() => {
        getDictionary('es').then(setDict);
    }, []);

    useEffect(() => {
        const identifierTimer = setTimeout(() => setDebouncedIdentifier(identifier), 300);
        const messageTimer = setTimeout(() => setDebouncedMessage(message), 300);
        return () => {
            clearTimeout(identifierTimer);
            clearTimeout(messageTimer);
        };
    }, [identifier, message]);

    useEffect(() => {
        const trimmedIdentifier = debouncedIdentifier.trim();
        if (!trimmedIdentifier) {
            setGeneratedLink('');
            return;
        }

        let link = '';
        const encodedMessage = encodeURIComponent(debouncedMessage);

        if (platform === 'whatsapp') {
            const sanitizedNumber = trimmedIdentifier.replace(/\D/g, '');
            if(sanitizedNumber) {
                link = `https://wa.me/${sanitizedNumber}`;
                if (debouncedMessage) {
                    link += `?text=${encodedMessage}`;
                }
            }
        } else { // telegram
            if (trimmedIdentifier) {
                const isPhoneNumber = /^\+?\d+$/.test(trimmedIdentifier);

                if (isPhoneNumber) {
                    const phoneNumber = trimmedIdentifier.startsWith('+') ? trimmedIdentifier : `+${trimmedIdentifier}`;
                    link = `https://t.me/${phoneNumber}`;
                } else {
                    const username = trimmedIdentifier.replace(/^@/, '');
                    link = `https://t.me/${username}`;
                }

                if (debouncedMessage) {
                    link += `?text=${encodedMessage}`;
                }
            }
        }
        setGeneratedLink(link);
    }, [platform, debouncedIdentifier, debouncedMessage]);

    const handleCopyLink = () => {
        if (!generatedLink || !dict) return;
        navigator.clipboard.writeText(generatedLink).then(() => {
            toast({ title: dict.tools.linkGenerator.toastCopySuccessTitle, description: dict.tools.linkGenerator.toastCopySuccessDesc });
        }).catch(err => {
            console.error("Error copying link:", err);
            toast({ variant: "destructive", title: dict.tools.linkGenerator.toastCopyErrorTitle, description: dict.tools.linkGenerator.toastCopyErrorDesc });
        });
    };

    const handleDownloadQr = () => {
        if (!generatedLink || !qrCanvasRef.current || !dict) return;
        const canvas = qrCanvasRef.current.querySelector('canvas');
        if (canvas) {
            try {
                const highResCanvas = document.createElement('canvas');
                highResCanvas.width = 500;
                highResCanvas.height = 500;
                const ctx = highResCanvas.getContext('2d');
                
                if (ctx) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, 500, 500);
                    ctx.imageSmoothingEnabled = false;
                    ctx.drawImage(canvas, 0, 0, 500, 500);

                    const pngUrl = highResCanvas.toDataURL("image/png");
                    const downloadLink = document.createElement("a");
                    downloadLink.href = pngUrl;
                    const safeFilename = (identifier || 'chat').replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    downloadLink.download = `qr-${platform}-${safeFilename}.png`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    toast({ title: dict.tools.linkGenerator.toastDownloadSuccessTitle, description: dict.tools.linkGenerator.toastDownloadSuccessDesc });
                }
            } catch (error) {
                console.error("Error downloading QR:", error);
                toast({ variant: "destructive", title: dict.tools.linkGenerator.toastDownloadErrorTitle, description: dict.tools.linkGenerator.toastDownloadErrorDesc });
            }
        }
    };
    
    if (authLoading || !dict) {
      return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <Skeleton className="h-16 w-16 mx-auto rounded-full" />
                <Skeleton className="h-12 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
            </div>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                <Skeleton className="h-[400px] w-full" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        </div>
      )
    }
    
    const d = dict.tools.linkGenerator;
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

    const isWhatsapp = platform === 'whatsapp';
    const hasInput = identifier.trim() !== '';

    return (
      <div className="w-full">
          <section className="text-center mb-12">
              <div className="flex justify-center mb-4"><Compass className="w-16 h-16 text-primary" /></div>
              <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
                  {d.pageTitleHtml[0]} <span className="text-primary">{d.pageTitleHtml[1]}</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                  {d.pageDescription}
              </p>
          </section>
          
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Controls */}
              <Card className="shadow-lg">
                  <CardHeader>
                      <CardTitle className="font-headline text-2xl">{d.configTitle}</CardTitle>
                      <CardDescription>{d.configDescription}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="flex items-center justify-center space-x-4 rounded-lg bg-muted p-2">
                          <Label htmlFor="platform-switch" className={!isWhatsapp ? 'text-muted-foreground' : 'font-bold text-green-600'}>{d.platformWhatsapp}</Label>
                          <Switch
                              id="platform-switch"
                              checked={!isWhatsapp}
                              onCheckedChange={(checked) => setPlatform(checked ? 'telegram' : 'whatsapp')}
                              className="data-[state=unchecked]:bg-green-500 data-[state=checked]:bg-blue-500"
                          />
                          <Label htmlFor="platform-switch" className={isWhatsapp ? 'text-muted-foreground' : 'font-bold text-blue-500'}>{d.platformTelegram}</Label>
                      </div>

                      <div className="space-y-2">
                          <Label htmlFor="identifier">{isWhatsapp ? d.identifierLabelWhatsapp : d.identifierLabelTelegram}</Label>
                          <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                  {isWhatsapp ? <Smartphone className="h-4 w-4" /> : <AtSign className="h-4 w-4" />}
                              </span>
                              <Input
                                  id="identifier"
                                  value={identifier}
                                  onChange={(e) => setIdentifier(e.target.value)}
                                  placeholder={isWhatsapp ? d.identifierPlaceholderWhatsapp : d.identifierPlaceholderTelegram}
                                  className="pl-9"
                              />
                          </div>
                          <p className="text-xs text-muted-foreground">
                              {isWhatsapp ? d.identifierDescriptionWhatsapp : d.identifierDescriptionTelegram}
                          </p>
                      </div>
                      
                      <div className="space-y-2">
                          <Label htmlFor="message">{d.messageLabel}</Label>
                          <Textarea
                              id="message"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder={d.messagePlaceholder}
                              rows={4}
                          />
                      </div>
                  </CardContent>
              </Card>

              {/* Results & CTA Column */}
              <div className="space-y-6">
                  <Card className="shadow-lg">
                      <CardHeader>
                          <CardTitle className="font-headline text-2xl">{d.resultTitle}</CardTitle>
                          <CardDescription>{d.resultDescription}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6 text-center">
                          {hasInput && generatedLink ? (
                              <>
                                  <div ref={qrCanvasRef} className="p-4 bg-white inline-block rounded-lg shadow-md border">
                                      <QRCodeCanvas
                                          value={generatedLink}
                                          size={256}
                                          fgColor="#000000"
                                          bgColor="#FFFFFF"
                                          level="M"
                                      />
                                  </div>
                                  <div className="w-full break-words bg-muted p-3 rounded-md text-sm text-muted-foreground">
                                      {generatedLink}
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      <Button onClick={handleCopyLink}><Copy className="mr-2 h-4 w-4" />{d.copyButton}</Button>
                                      <Button asChild variant="secondary">
                                          <a href={generatedLink} target="_blank" rel="noopener noreferrer">
                                              <ExternalLink className="mr-2 h-4 w-4" />{d.openButton}
                                          </a>
                                      </Button>
                                      <Button onClick={handleDownloadQr} variant="outline"><Download className="mr-2 h-4 w-4" />{d.downloadButton}</Button>
                                  </div>
                              </>
                          ) : (
                              <div className="flex flex-col items-center justify-center text-muted-foreground p-8 min-h-[300px]">
                                  <QrCode className="w-16 h-16 mb-4"/>
                                  <p>{d.qrPlaceholder}</p>
                              </div>
                          )}
                           {platform === 'telegram' && debouncedMessage && (
                              <p className="text-xs text-muted-foreground pt-4">{d.telegramNote}</p>
                           )}
                      </CardContent>
                  </Card>
              </div>
          </div>
      </div>
    );
}

    

    