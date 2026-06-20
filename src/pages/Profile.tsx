import { motion } from 'framer-motion';
import { Clock, TrendingUp, Search, ArrowRight, BarChart2, Zap, ChevronUp, ChevronDown, Plus, Download, Sparkles, AlertTriangle, ExternalLink } from 'lucide-react';
import { PricingModal } from '@/components/ui/pricing-modal';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/lib/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Analysis {
  id: string;
  trust_score: number;
  brand_name: string;
  created_at: string;
}

/* Plan names — no "Roast" branding for paid tiers */
const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  solo: 'Solo',
  growth: 'Growth',
  enterprise: 'Enterprise Suite',
};

const PLAN_LIMITS: Record<string, number> = {
  free: 10,
  solo: 50,
  growth: 100,
  enterprise: 500,
};

const SUB_STATUS_KEY = { active: 'sub_status_active', paused: 'sub_status_paused', cancelled: 'sub_status_cancelled' } as const;
const SUB_DOT = {
  active: 'bg-emerald-400 ring-emerald-400/30',
  paused: 'bg-amber-400 ring-amber-400/30',
  cancelled: 'bg-red-500 ring-red-500/30',
} as const;

/* Locale code → toLocaleDateString tag */
const LOCALE_DATE_TAG: Record<string, string> = {
  en: 'en-GB', pl: 'pl-PL', de: 'de-DE', fr: 'fr-FR', es: 'es-ES', it: 'it-IT',
};

function scoreColor(score: number) {
  if (score >= 75) return 'text-emerald-400';
  if (score >= 50) return 'text-primary';
  return 'text-red-400';
}

const Profile = () => {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const dateLocale = LOCALE_DATE_TAG[locale] ?? 'en-GB';

  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [plan, setPlan] = useState('free');
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [prevScores, setPrevScores] = useState<Record<string, number>>({});
  const [subStatus] = useState<'active' | 'paused' | 'cancelled'>('active');

  const [showPricing, setShowPricing] = useState(false);

  const [query, setQuery] = useState('');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [showAll, setShowAll] = useState(false);

  const initials = email ? email[0].toUpperCase() : '?';
  const limit = PLAN_LIMITS[plan] ?? 10;
  const usagePercent = Math.min(Math.round((analyses.length / limit) * 100), 100);
  const avgScore = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + a.trust_score, 0) / analyses.length)
    : 0;
  const bestBrand = analyses.reduce<Analysis | null>((best, a) => (a.trust_score > (best?.trust_score ?? 0) ? a : best), null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      setEmail(user.email ?? '');
      setAvatarUrl(user.user_metadata?.avatar_url ?? null);

      const { data: profile } = await supabase.from('profiles').select('plan, avatar_url').eq('id', user.id).single();
      if (profile?.plan) setPlan(profile.plan);
      if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);

      /* Fetch all analyses to compute per-brand trend */
      const { data } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data?.length) {
        /* Keep latest unique brand for the list; also keep 2nd latest for delta */
        const seen = new Set<string>();
        const latest: Analysis[] = [];
        const second: Record<string, number> = {};

        for (const a of data) {
          const k = a.brand_name.trim().toLowerCase();
          if (!seen.has(k)) {
            seen.add(k);
            latest.push(a);
          } else if (!second[k]) {
            second[k] = a.trust_score;
          }
        }
        setAnalyses(latest);
        setPrevScores(second);
      }
    })();
  }, [navigate]);

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportData = (format: 'csv' | 'json') => {
    if (!analyses.length) return;
    const stamp = new Date().toISOString().slice(0, 10);
    if (format === 'json') {
      downloadFile(JSON.stringify(analyses, null, 2), `bitbrew-analizy-${stamp}.json`, 'application/json');
      return;
    }
    const header = ['brand_name', 'trust_score', 'created_at'];
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = analyses.map(a => [escape(a.brand_name), a.trust_score, escape(a.created_at)].join(','));
    downloadFile([header.join(','), ...rows].join('\n'), `bitbrew-analizy-${stamp}.csv`, 'text/csv;charset=utf-8');
  };

  const filtered = useMemo(() => {
    let list = query ? analyses.filter(a => a.brand_name.toLowerCase().includes(query.toLowerCase())) : analyses;
    list = [...list].sort((a, b) => sortDir === 'desc' ? b.trust_score - a.trust_score : a.trust_score - b.trust_score);
    return list;
  }, [analyses, query, sortDir]);

  const displayed = showAll ? filtered : filtered.slice(0, 6);

  /* Alerts — brands whose latest score dropped >= threshold vs the prior run */
  const ALERT_THRESHOLD = 5;
  const alerts = useMemo(() => {
    return analyses
      .map(a => {
        const prev = prevScores[a.brand_name.trim().toLowerCase()];
        const drop = prev !== undefined ? prev - a.trust_score : 0;
        return { brand: a.brand_name, id: a.id, drop, current: a.trust_score };
      })
      .filter(x => x.drop >= ALERT_THRESHOLD)
      .sort((a, b) => b.drop - a.drop);
  }, [analyses, prevScores]);

  return (
    <div className="min-h-screen bg-background">
      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} currentPlan={plan} />
      <div className="pt-6 pb-20 px-4 max-w-5xl mx-auto space-y-6">

        {/* ── USER HEADER ─────────────────────────────────────────── */}
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
                <span className="text-xs text-muted-foreground">{t(SUB_STATUS_KEY[subStatus])}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs font-medium text-primary">{PLAN_LABELS[plan] ?? 'Free'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {plan === 'free' && (
              <Button size="sm" onClick={() => navigate('/pricing')}>
                <Zap className="w-3.5 h-3.5 mr-1.5" /> {t('profile_upgrade')}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
              {t('profile_settings')}
            </Button>
          </div>
        </motion.div>

        {/* ── STATS ROW ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: t('total_brews'), value: analyses.length, icon: BarChart2, accent: false, onClick: undefined },
            { label: t('avg_score'), value: avgScore || '—', icon: TrendingUp, accent: true, onClick: undefined },
            { label: t('profile_best_score'), value: bestBrand ? bestBrand.trust_score : '—', icon: Zap, accent: true, onClick: undefined },
            { label: t('plan_label'), value: PLAN_LABELS[plan] ?? 'Free', icon: ExternalLink, accent: false, onClick: () => setShowPricing(true) },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              onClick={stat.onClick}
              className={cn(
                'glass-card p-5 flex flex-col gap-3',
                stat.onClick && 'cursor-pointer hover:border-primary/40 hover:bg-card/60 transition-colors group'
              )}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <stat.icon className={cn('w-4 h-4 text-muted-foreground/50', stat.onClick && 'group-hover:text-primary transition-colors')} />
              </div>
              <span className={cn('text-2xl font-display', stat.accent ? 'text-primary' : 'text-foreground')}>
                {stat.value}
              </span>
            </motion.div>
          ))}
        </div>

        {/* ── USAGE BAR ────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="glass-card px-6 py-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">{t('profile_usage')}</span>
            <span className="text-muted-foreground">{analyses.length} / {limit} <span className="text-primary font-medium">({usagePercent}%)</span></span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
              initial={{ width: 0 }} animate={{ width: `${usagePercent}%` }} transition={{ duration: 0.8, delay: 0.3 }} />
          </div>
        </motion.div>

        {/* ── ALERTS ───────────────────────────────────────────────── */}
        {alerts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-500/25 bg-red-500/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-semibold text-foreground">{t('alerts_title')}</h2>
              <span className="text-xs text-muted-foreground">({alerts.length})</span>
            </div>
            <div className="space-y-2">
              {alerts.slice(0, 4).map(a => (
                <button key={a.id}
                  onClick={() => navigate(`/dashboard?id=${encodeURIComponent(a.id)}`)}
                  className="w-full flex items-center justify-between gap-3 text-left rounded-xl px-3 py-2.5 hover:bg-red-500/10 transition-colors"
                >
                  <span className="text-sm text-foreground font-medium">{a.brand}</span>
                  <span className="flex items-center gap-2 text-xs">
                    <span className="text-red-400 font-medium flex items-center gap-0.5">
                      <ChevronDown className="w-3.5 h-3.5" /> {a.drop} {t('alerts_points')}
                    </span>
                    <span className="text-muted-foreground">→ {a.current}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── ANALYSES LIST ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>

          {/* Header row: title + CTA + search + sort */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-display text-foreground">{t('past_brews')}</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => navigate('/dashboard')}>
                <Plus className="w-3.5 h-3.5" /> {t('profile_new_analysis')}
              </Button>
              <div className="relative flex-1 sm:w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={t('profile_search')}
                  className="pl-8 h-8 text-sm"
                />
              </div>
              <button
                onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-1 px-3 h-8 rounded-lg border border-input text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                Score {sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
              {analyses.length > 0 && (
                <div className="flex items-center rounded-lg border border-input overflow-hidden">
                  <button
                    onClick={() => exportData('csv')}
                    title={t('profile_export_csv')}
                    className="flex items-center gap-1 px-3 h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Download className="w-3 h-3" /> CSV
                  </button>
                  <span className="w-px h-4 bg-border" />
                  <button
                    onClick={() => exportData('json')}
                    title={t('profile_export_json')}
                    className="px-3 h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    JSON
                  </button>
                </div>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            query ? (
              <div className="glass-card p-10 text-center text-sm text-muted-foreground">
                {t('profile_no_results')}
              </div>
            ) : (
              <div className="glass-card p-10 text-center flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{t('profile_empty_title')}</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{t('profile_empty_desc')}</p>
                </div>
                <Button onClick={() => navigate('/dashboard')} className="gap-1.5">
                  <Plus className="w-4 h-4" /> {t('profile_empty_cta')}
                </Button>
                <p className="text-xs text-muted-foreground/60">{t('profile_empty_hint')}</p>
              </div>
            )
          ) : (
            <div className="space-y-2">
              {displayed.map((brew, i) => {
                const key = brew.brand_name.trim().toLowerCase();
                const prev = prevScores[key];
                const delta = prev !== undefined ? brew.trust_score - prev : null;

                return (
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
                          {new Date(brew.created_at).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })}
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
                      {/* score + trend delta */}
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <span className={cn('text-lg font-display', scoreColor(brew.trust_score))}>{brew.trust_score}</span>
                          {delta !== null && delta !== 0 && (
                            <span className={cn('text-[10px] font-medium flex items-center gap-0.5', delta > 0 ? 'text-emerald-400' : 'text-red-400')}>
                              {delta > 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              {Math.abs(delta)}
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-muted-foreground">score</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {filtered.length > 6 && (
            <button
              onClick={() => setShowAll(s => !s)}
              className="mt-3 w-full py-2.5 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-primary/30 rounded-xl transition-colors"
            >
              {showAll ? t('profile_show_less') : `${t('profile_show_all')} (${filtered.length})`}
            </button>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default Profile;
