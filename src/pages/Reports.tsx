import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Download, Trash2, Calendar, ArrowUp, ArrowDown, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Report {
  id: string;
  brand_name: string;
  trust_score: number;
  authority: number;
  sentiment: number;
  recency: number;
  mentions: number;
  accuracy: number;
  created_at: string;
}

const TIME_FILTERS = [
  { key: '7', label: '7 dni', days: 7 },
  { key: '30', label: '30 dni', days: 30 },
  { key: '90', label: '90 dni', days: 90 },
  { key: 'all', label: 'Wszystkie', days: 0 },
] as const;

const scoreColor = (s: number) =>
  s >= 75 ? 'text-emerald-600 dark:text-emerald-400' : s >= 50 ? 'text-primary' : 'text-red-600 dark:text-red-400';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' });

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeKey, setTimeKey] = useState<string>('30');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      const { data } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setReports((data as Report[]) ?? []);
      setLoading(false);
    })();
  }, [navigate]);

  const filtered = useMemo(() => {
    const f = TIME_FILTERS.find(t => t.key === timeKey) ?? TIME_FILTERS[3];
    let list = reports;
    if (f.days > 0) {
      const cutoff = Date.now() - f.days * 86_400_000;
      list = list.filter(r => new Date(r.created_at).getTime() >= cutoff);
    }
    return [...list].sort((a, b) =>
      sortDir === 'desc' ? b.trust_score - a.trust_score : a.trust_score - b.trust_score
    );
  }, [reports, timeKey, sortDir]);

  const downloadReport = (r: Report) => {
    const payload = {
      source: 'Presora',
      brand: r.brand_name,
      trustScore: r.trust_score,
      dimensions: {
        authority: r.authority,
        sentiment: r.sentiment,
        accuracy: r.accuracy,
        mentions: r.mentions,
        recency: r.recency,
      },
      generatedAt: r.created_at,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug = r.brand_name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    a.href = url;
    a.download = `presora-raport-${slug}-${new Date(r.created_at).toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteReport = async (id: string) => {
    const { error } = await supabase.from('analyses').delete().eq('id', id);
    if (!error) setReports(prev => prev.filter(r => r.id !== id));
    setConfirmId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-6 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <FileText className="w-4.5 h-4.5 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display text-foreground">Raporty</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6 ml-12">
          Historia Twoich analiz marki — filtruj, pobieraj i usuwaj.
        </p>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          {/* Time filter */}
          <div className="flex items-center gap-1 p-1 rounded-lg border border-[hsl(var(--glass-border))] bg-muted/40 w-fit">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground ml-1.5 mr-0.5" />
            {TIME_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setTimeKey(f.key)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  timeKey === f.key
                    ? 'bg-background text-foreground shadow-sm border border-input'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort by score */}
          <div className="flex items-center gap-1 p-1 rounded-lg border border-[hsl(var(--glass-border))] bg-muted/40 w-fit">
            <button
              onClick={() => setSortDir('desc')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                sortDir === 'desc'
                  ? 'bg-background text-foreground shadow-sm border border-input'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ArrowDown className="w-3.5 h-3.5" /> Najwyższy wynik
            </button>
            <button
              onClick={() => setSortDir('asc')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                sortDir === 'asc'
                  ? 'bg-background text-foreground shadow-sm border border-input'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ArrowUp className="w-3.5 h-3.5" /> Najniższy wynik
            </button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-[hsl(var(--glass-border))] bg-card/40 p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Brak raportów w tym okresie</p>
            <p className="text-xs text-muted-foreground mt-1">
              Uruchom analizę marki na stronie głównej, aby zobaczyć ją tutaj.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Nowa analiza
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="group flex items-center gap-4 rounded-xl border border-[hsl(var(--glass-border))] bg-card/60 p-4 hover:border-primary/30 transition-colors"
              >
                {/* Score */}
                <div className="shrink-0 w-14 text-center">
                  <div className={cn('text-2xl font-display font-semibold tabular-nums leading-none', scoreColor(r.trust_score))}>
                    {r.trust_score}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">wynik</div>
                </div>

                {/* Brand + date — click opens the full report */}
                <button
                  onClick={() => navigate(`/dashboard?id=${r.id}`)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground truncate">{r.brand_name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{formatDate(r.created_at)}</div>
                </button>

                {/* Actions */}
                {confirmId === r.id ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:inline">Usunąć?</span>
                    <button
                      onClick={() => deleteReport(r.id)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      Tak, usuń
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[hsl(var(--glass-border))] text-foreground hover:bg-accent transition-colors"
                    >
                      Anuluj
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => downloadReport(r)}
                      title="Pobierz raport"
                      aria-label="Pobierz raport"
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-[hsl(var(--glass-border))] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmId(r.id)}
                      title="Usuń raport"
                      aria-label="Usuń raport"
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-[hsl(var(--glass-border))] text-muted-foreground hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
