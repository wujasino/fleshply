import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display text-foreground">Polityka prywatności</h1>
          <p className="text-sm text-muted-foreground mt-1">BitBrew — RODO / GDPR</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <a href="/polityka-prywatnosci-pl.pdf" download>
              <Download className="w-3.5 h-3.5" /> Pobierz PDF
            </a>
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <a href="/polityka-prywatnosci-pl.pdf" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3.5 h-3.5" /> Otwórz
            </a>
          </Button>
        </div>
      </div>
      <div className="rounded-2xl border border-[hsl(var(--glass-border))] overflow-hidden bg-card/40">
        <iframe
          src="/polityka-prywatnosci-pl.pdf"
          className="w-full"
          style={{ height: 'min(80vh, 900px)' }}
          title="Polityka prywatności BitBrew"
        />
      </div>
    </div>
  </div>
);

export default Privacy;
