
'use client';

import { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { QrCode, Palette, AppWindow, AlertTriangle, Download, Rocket, Lock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useLicense } from '@/context/LicenseContext';
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';

export default function QrGeneratorPage() {
  const [dict, setDict] = useState<Dictionary | null>(null);
  const { plan } = useLicense();
  const { user, loading: authLoading } = useAuth();
  const isPro = plan === 'pro' || plan === 'ai_pro';
  const canAccess = isPro && (user?.role === 'Admin' || user?.role === 'Redactor' || user?.role === 'Redactor Jr.');

  const [text, setText] = useState<string>("https://rtsi.site");
  const [debouncedText, setDebouncedText] = useState<string>("https://rtsi.site");
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [size, setSize] = useState<number>(256);
  const [level, setLevel] = useState<string>('M');
  
  const qrCanvasRef = useRef<HTMLDivElement>(null); 
  const { toast } = useToast();

  useEffect(() => {
    getDictionary('es').then(setDict);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedText(text);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [text]);

  const handleDownload = () => {
    if (!dict) return;
    const d = dict.tools.qrGenerator;

    if (qrCanvasRef.current) {
      const originalCanvas = qrCanvasRef.current.querySelector('canvas');
      if (originalCanvas) {
        try {
          const padding = 16; 
          const borderRadius = 8; 

          const newCanvasWidth = originalCanvas.width + 2 * padding;
          const newCanvasHeight = originalCanvas.height + 2 * padding;

          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = newCanvasWidth;
          tempCanvas.height = newCanvasHeight;
          const ctx = tempCanvas.getContext('2d');

          if (ctx) {
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.moveTo(borderRadius, 0);
            ctx.lineTo(newCanvasWidth - borderRadius, 0);
            ctx.arcTo(newCanvasWidth, 0, newCanvasWidth, borderRadius, borderRadius);
            ctx.lineTo(newCanvasWidth, newCanvasHeight - borderRadius);
            ctx.arcTo(newCanvasWidth, newCanvasHeight, newCanvasWidth - borderRadius, newCanvasHeight, borderRadius);
            ctx.lineTo(borderRadius, newCanvasHeight);
            ctx.arcTo(0, newCanvasHeight, 0, newCanvasHeight - borderRadius, borderRadius);
            ctx.lineTo(0, borderRadius);
            ctx.arcTo(0, 0, borderRadius, 0, borderRadius);
            ctx.closePath();
            ctx.fill();

            ctx.drawImage(originalCanvas, padding, padding);
            
            const pngUrl = tempCanvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            
            const safeFilename = text.length > 20 ? text.substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase() : text.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            downloadLink.download = `qr-${safeFilename || 'codigo'}.png`;
            
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            toast({
              title: d.toastDownloadSuccessTitle,
              description: d.toastDownloadSuccessDesc,
            });
          } else {
             toast({
              variant: "destructive",
              title: d.toastDownloadErrorTitle,
              description: d.toastDownloadErrorDescCanvas,
            });
          }
        } catch (error) {
          console.error("Error downloading QR:", error);
          toast({
            variant: "destructive",
            title: d.toastDownloadErrorTitle,
            description: d.toastDownloadErrorDescGeneric,
          });
        }
      } else {
         toast({
            variant: "destructive",
            title: d.toastDownloadErrorTitle,
            description: d.toastDownloadErrorDescNotFound,
          });
      }
    }
  };
  
  const handleFgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFgColor(e.target.value || '#000000');
  };

  const handleBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBgColor(e.target.value || '#FFFFFF');
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

  const d = dict.tools.qrGenerator;
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

  const translatedErrorLevels = [
    { value: 'L', label: d.levelLow },
    { value: 'M', label: d.levelMedium },
    { value: 'Q', label: d.levelQuartile },
    { value: 'H', label: d.levelHigh },
  ];

  return (
    <div className="w-full">
      <section className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <QrCode className="w-16 h-16 text-primary" />
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
          {d.pageTitleHtml[0]} <span className="text-primary">{d.pageTitleHtml[1]}</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          {d.pageDescription}
        </p>
      </section>

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        <Card className="md:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
              <AppWindow className="w-6 h-6 text-primary" />
              {d.previewTitle}
            </CardTitle>
            <CardDescription>
              {d.previewDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6 min-h-[300px] bg-muted/20 rounded-md">
            <div ref={qrCanvasRef} className="p-4 bg-white inline-block rounded-lg shadow-md border border-border" style={{ backgroundColor: bgColor }}>
              {debouncedText ? (
                 <QRCodeCanvas
                  value={debouncedText}
                  size={size}
                  fgColor={fgColor}
                  bgColor={"#00000000"}
                  level={level}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                  <AlertTriangle className="w-12 h-12 mb-4" />
                  <p className="font-semibold">{d.placeholderTitle}</p>
                  <p className="text-sm">{d.placeholderDescription}</p>
                </div>
              )}
            </div>
            {debouncedText && (
              <Button onClick={handleDownload} className="mt-6 shadow-md hover:shadow-lg transition-shadow" size="lg">
                <Download className="mr-2 h-5 w-5" />
                {d.downloadButton}
              </Button>
            )}
          </CardContent>
           <CardFooter className="pt-6">
              <p className="text-xs text-muted-foreground text-center w-full">
                  {d.privacyNote}
              </p>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <Palette className="w-5 h-5 text-primary" /> {d.optionsTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="qr-text">{d.textLabel}</Label>
                <Textarea
                  id="qr-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={d.textPlaceholder}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fg-color">{d.fgColorLabel}</Label>
                    <Input
                      id="fg-color"
                      type="color"
                      value={fgColor}
                      onChange={handleFgColorChange}
                      className="h-10 p-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bg-color">{d.bgColorLabel}</Label>
                    <Input
                      id="bg-color"
                      type="color"
                      value={bgColor}
                      onChange={handleBgColorChange}
                      className="h-10 p-1"
                    />
                  </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="qr-size">{d.sizeLabel}: {size}px</Label>
                <Slider
                  id="qr-size"
                  min={64}
                  max={1024}
                  step={32}
                  value={[size]}
                  onValueChange={(value) => setSize(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr-level">{d.levelLabel}</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger id="qr-level">
                    <SelectValue placeholder={d.levelPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {translatedErrorLevels.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    