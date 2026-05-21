import { Navbar } from '@/components/layout/Navbar';
import { useTranslation } from '@/lib/locale';
import { Button } from '@/components/ui/button';

const Terms = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto">
        <div className="glass-card p-8">
          <h1 className="text-2xl font-display mb-4">Regulamin sklepu internetowego</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Treść regulaminu sklepu internetowego. Możesz pobrać lub otworzyć wersję PDF.
          </p>
          <div className="flex gap-3">
            <Button asChild variant="secondary">
              <a href="/regulamin-sklepu-internetowego-pl.pdf" target="_blank" rel="noopener noreferrer">Pobierz PDF</a>
            </Button>
            <Button asChild>
              <a href="/regulamin-sklepu-internetowego-pl.pdf" target="_blank" rel="noopener noreferrer">Otwórz PDF</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
