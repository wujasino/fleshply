import { motion } from 'framer-motion';
import { Clock, TrendingUp, Search, ArrowRight, BarChart2, Zap, ChevronUp, ChevronDown, Download } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/lib/locale';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Analysis {
  id: string;
  trust_score: number;
  brand_name: string;
  created_at: string;
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  solo: 'Solo Brew',
  growth: 'Growth Roast',
  enterprise: 'Enterprise Roast',
};

const PLAN_LIMITS: Record<string, number> = {
  free: 10,
  solo: 50,
  growth: 100,
  enterprise: 500,
};

const SUB_LABELS = { active: 'Aktywna', paused: 'Wstrzymana', cancelled: 'Anulowana' } as const;
const SUB_DOT = {
  active: 'bg-emerald-400 ring-emerald-400/30',
  paused: 'bg-amber-400 ring-amber-400/30',
  cancelled: 'bg-red-500 ring-red-500/30',
} as const;

function scoreColor(score: number) {
  if (score >= 75) return 'text-emerald-400';
  if (score >= 50) return 'text-primary';
  return 'text-red-400';
}

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [plan, setPlan] = useState('free');
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [avgScore, setAvgScore] = useState(0);
  const [bestBrand, setBestBrand] = useState<Analysis | null>(null);
  const [subStatus, setSubStatus] = useState<'active' | 'paused' | 'cancelled'>('active');
  const [subHistory, setSubHistory] = useState<Array<{ status: 'active' | 'paused' | 'cancelled'; label: string; timestamp: string }>>([]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  const [query, setQuery] = useState('');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [showAll, setShowAll] = useState(false);

  const initials = email ? email[0].toUpperCase() : '?';
  const limit = PLAN_LIMITS[plan] ?? 10;
  const usagePercent = Math.min(Math.round((analyses.length / limit) * 100), 100);

  useEffect(() => {
    const stored = localStorage.getItem('subscriptionStatus') as typeof subStatus | null;
    if (stored) setSubStatus(stored);

    const storedHist = localStorage.getItem('subscriptionHistory');
    if (storedHist) {
      try { setSubHistory(JSON.parse(storedHist)); } catch { /* noop */ }
    } else {
      const init = [{ status: 'active' as const, label: 'Subskrypcja aktywna od momentu rozpoczęcia', timestamp: new Date().toISOString() }];
      setSubHistory(init);
      localStorage.setItem('subscriptionHistory', JSON.stringify(init));
    }

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      setEmail(user.email ?? '');
      setAvatarUrl(user.user_metadata?.avatar_url ?? null);

      const { data: profile } = await supabase.from('profiles').select('plan, avatar_url').eq('id', user.id).single();
      if (profile?.plan) setPlan(profile.plan);
      if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);

      const { data } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data?.length) {
        const seen = new Set<string>();
        const unique = data.filter((a) => {
          const k = a.brand_name.trim().toLowerCase();
          return seen.has(k) ? false : (seen.add(k), true);
        });
        setAnalyses(unique);
        setAvgScore(Math.round(unique.reduce((s, a) => s + a.trust_score, 0) / unique.length));
        setBestBrand(unique.reduce((best, a) => (a.trust_score > (best?.trust_score ?? 0) ? a : best), unique[0]));
      }
    })();
  }, [navigate]);

  const filtered = useMemo(() => {
    let list = query ? analyses.filter(a => a.brand_name.toLowerCase().includes(query.toLowerCase())) : analyses;
    list = [...list].sort((a, b) => sortDir === 'desc' ? b.trust_score - a.trust_score : a.trust_score - b.trust_score);
    return list;
  }, [analyses, query, sortDir]);

  const displayed = showAll ? filtered : filtered.slice(0, 6);

  const recordHistory = (status: typeof subStatus, label: string) => {
    setSubHistory(prev => {
      const next = [{ status, label, timestamp: new Date().toISOString() }, ...prev].slice(0, 20);
      localStorage.setItem('subscriptionHistory', JSON.stringify(next));
      return next;
    });
  };

  const updateSub = (status: typeof subStatus) => {
    if (status === subStatus) return;
    setSubStatus(status);
    localStorage.setItem('subscriptionStatus', status);
    const labels = { paused: 'Subskrypcja wstrzymana', cancelled: 'Subskrypcja anulowana', active: 'Subskrypcja wznowiona' };
    recordHistory(status, labels[status]);
    toast(labels[status]);
  };

  const downloadHistory = () => {
    if (!subHistory.length) { toast('Brak historii.'); return; }
    const isJson = exportFormat === 'json';
    const content = isJson
      ? JSON.stringify(subHistory, null, 2)
      : [['Data', 'Status', 'Opis'], ...subHistory.map(i => [
          new Date(i.timestamp).toLocaleString('pl-PL'),
          SUB_LABELS[i.status],
          i.label,
        ])].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([content], { type: isJson ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: `historia.${exportFormat}` }).click();
    URL.revokeObjectURL(url);
    toast(`Pobrano jako ${exportFormat.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto space-y-6">

        {/* ── USER HEADER CARD ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl ?? undefined} />
              <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{email || '…'}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">BitBrew User</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex h-2 w-2 rounded-full ring-2 ${SUB_DOT[subStatus]} animate-pulse`} />
                <span className="text-xs text-muted-foreground">{SUB_LABELS[subStatus]}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs font-medium text-primary">{PLAN_LABELS[plan] ?? 'Free'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {plan === 'free' && (
              <Button size="sm" onClick={() => navigate('/pricing')}>
                <Zap className="w-3.5 h-3.5 mr-1.5" /> Ulepsz plan
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
              Ustawienia
            </Button>
          </div>
        </motion.div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: t('total_brews'), value: analyses.length, icon: BarChart2, accent: false },
            { label: t('avg_score'), value: avgScore || '—', icon: TrendingUp, accent: true },
            { label: 'Najlepszy wynik', value: bestBrand ? bestBrand.trust_score : '—', icon: Zap, accent: true },
            { label: t('plan_label'), value: PLAN_LABELS[plan] ?? 'Free', icon: ArrowRight, accent: false },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="glass-card p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <stat.icon className="w-4 h-4 text-muted-foreground/50" />
              </div>
              <span className={cn('text-2xl font-display', stat.accent ? 'text-primary' : 'text-foreground')}>
                {stat.value}
              </span>
            </motion.div>
          ))}
        </div>

        {/* ── USAGE BAR ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="glass-card px-6 py-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Użycie analiz</span>
            <span className="text-muted-foreground">{analyses.length} / {limit} <span className="text-primary font-medium">({usagePercent}%)</span></span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
              initial={{ width: 0 }} animate={{ width: `${usagePercent}%` }} transition={{ duration: 0.8, delay: 0.3 }} />
          </div>
        </motion.div>

        {/* ── ANALYSES LIST ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-display text-foreground">{t('past_brews')}</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Szukaj marki…"
                  className="pl-8 h-8 text-sm"
                />
              </div>
              <button
                onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-1 px-3 h-8 rounded-lg border border-input text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                Score {sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="glass-card p-10 text-center text-sm text-muted-foreground">
              {query ? 'Brak wyników dla podanej frazy.' : 'Brak analiz — wpisz nazwę marki na stronie głównej.'}
            </div>
          ) : (
            <div className="space-y-2">
              {displayed.map((brew, i) => (
                <motion.div key={brew.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/dashboard?id=${encodeURIComponent(brew.id)}`)}
                  className="glass-card-hover flex items-center justify-between p-4 cursor-pointer hover:!border-primary/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{brew.brand_name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(brew.created_at).toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* mini score bar */}
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary/60" style={{ width: `${brew.trust_score}%` }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn('text-lg font-display', scoreColor(brew.trust_score))}>{brew.trust_score}</div>
                      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">score</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {filtered.length > 6 && (
            <button
              onClick={() => setShowAll(s => !s)}
              className="mt-3 w-full py-2.5 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-primary/30 rounded-xl transition-colors"
            >
              {showAll ? 'Pokaż mniej' : `Pokaż wszystkie (${filtered.length})`}
            </button>
          )}
        </motion.div>

        {/* ── SUBSCRIPTION MANAGEMENT ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass-card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Zarządzanie subskrypcją</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Wstrzymaj lub anuluj w dowolnym momencie.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {subStatus === 'active' && (
                <>
                  <Button size="sm" variant="outline" onClick={() => updateSub('paused')}>Wstrzymaj</Button>
                  <Button size="sm" variant="outline" onClick={() => updateSub('cancelled')}>Anuluj</Button>
                </>
              )}
              {subStatus === 'paused' && (
                <>
                  <Button size="sm" onClick={() => updateSub('active')}>Wznów</Button>
                  <Button size="sm" variant="outline" onClick={() => updateSub('cancelled')}>Anuluj</Button>
                </>
              )}
              {subStatus === 'cancelled' && (
                <Button size="sm" onClick={() => updateSub('active')}>Wznów</Button>
              )}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* History header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-semibold">Historia subskrypcji</p>
            <div className="flex items-center gap-2">
              <select
                value={exportFormat}
                onChange={e => setExportFormat(e.target.value as 'csv' | 'json')}
                className="rounded-md border border-input bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={downloadHistory}>
                <Download className="w-3 h-3" /> Pobierz
              </Button>
            </div>
          </div>

          {subHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">Brak historii.</p>
          ) : (
            <div className="space-y-2">
              {subHistory.map((item, i) => (
                <div key={item.timestamp + i}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[hsl(var(--glass-border))] bg-muted/20 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`inline-flex h-2 w-2 shrink-0 rounded-full ring-2 ${SUB_DOT[item.status]}`} />
                    <span className="font-medium text-foreground truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{SUB_LABELS[item.status]}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default Profile;
