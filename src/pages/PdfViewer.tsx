import { Navbar } from '@/components/layout/Navbar';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/locale';
import { Button } from '@/components/ui/button';

interface PdfViewerProps {
  title: string;
  file: string;
}

export const PdfViewer = ({ title, file }: PdfViewerProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="min-w-[120px]"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('back')}
            </Button>
            <h1 className="text-2xl font-display text-foreground">{title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="secondary" size="sm" className="min-w-[160px]">
              <a href={file} download>
                <Download className="w-4 h-4" />
                Pobierz PDF
              </a>
            </Button>
            <Button asChild size="sm" className="min-w-[160px]">
              <a href={file} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Otwórz w nowej karcie
              </a>
            </Button>
          </div>
        </div>
        <div className="glass-card overflow-hidden">
          <iframe
            src={`${file}#view=FitH`}
            title={title}
            className="w-full h-[80vh] bg-white"
          />
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
