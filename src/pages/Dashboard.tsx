import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, TrendingUp, TrendingDown, Activity, Layers, Target, RefreshCw, Search, Lock, FileDown, Swords, X, Volume2, Square, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/locale';
import { BrewingProgress } from '@/components/BrewingState';
import { RadarChartCard } from '@/components/charts/RadarChartCard';
import { SentimentChart } from '@/components/charts/SentimentChart';
import { SourceDonutChart } from '@/components/charts/SourceDonutChart';
import { SourceTable } from '@/components/SourceTable';
import BrandKnowledgeForm from '@/components/BrandKnowledgeForm';
import { useBrewing } from '@/hooks/useBrewing';
import { useTTS, loadVoicePrefs } from '@/hooks/useTTS';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { AnalysisResult } from '@/types/analysis';
import { scoreBrand, type BrandScore } from '@/lib/brandScore';

const PLAN_TIER: Record<string, number> = {
  free: 0,
  solo: 1,
  growth: 2,
  enterprise: 2,
};
const tierOf = (plan: string) => PLAN_TIER[plan] ?? 0;

const LockedOverlay = ({ title, description, onUpgrade, t }: { title: string; description: string; onUpgrade: () => void; t: (k: string) => string }) => (
  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl overflow-hidden">
    {/* Blurred bg */}
    <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />
    {/* Subtle gradient top */}
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

    <div className="relative flex flex-col items-center gap-4 text-center px-8">
      {/* Icon */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-150" />
        <div className="relative w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Lock className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Text */}
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-foreground tracking-tight">{title}</p>
        <p className="text-xs text-muted-foreground max-w-[220px] leading-relaxed">{description}</p>
      </div>

      {/* CTA */}
      <button
        onClick={onUpgrade}
        className="relative group mt-1 px-5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
      >
        {t('upgrade_cta')}
      </button>
    </div>
  </div>
);

const getScoreKey = (s: number) => {
  if (s >= 85) return 'score_excellent';
  if (s >= 70) return 'score_high';
  if (s >= 50) return 'score_moderate';
  return 'score_low';
};
const getVerdictKey = (s: number) => {
  if (s >= 85) return 'dashboard_verdict_excellent';
  if (s >= 70) return 'dashboard_verdict_high';
  if (s >= 50) return 'dashboard_verdict_moderate';
  return 'dashboard_verdict_low';
};

// ── Hero score band ─────────────────────────────────────────────
const ScoreHero = ({ result, t }: { result: AnalysisResult; t: (k: string) => string }) => {
  const score = useMemo(() => {
    if (typeof result.trustScore === 'number' && !isNaN(result.trustScore)) return Math.round(result.trustScore);
    const d = result.dimensions;
    return Math.round((d.authority + d.sentiment + d.accuracy + d.mentions + d.recency) / 5);
  }, [result]);

  const trend = result.sentimentTrend;
  const delta = trend && trend.length >= 2 ? Math.round(trend[trend.length - 1].score - trend[trend.length - 2].score) : 0;

  // Strongest / weakest dimension
  const dimensions = Object.entries(result.dimensions) as [string, number][];
  const normalized = dimensions.map(([k, v]) => [k, v <= 1 ? v * 100 : v] as [string, number]);
  const strongest = [...normalized].sort((a, b) => b[1] - a[1])[0];
  const weakest = [...normalized].sort((a, b) => a[1] - b[1])[0];

  // Animated counter
  const [animScore, setAnimScore] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1100;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimScore(Math.round(eased * score));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  // Top model from sources
  const topModel = useMemo(() => {
    if (!result.sources?.length) return null;
    return [...result.sources].sort((a, b) => b.confidence - a.confidence)[0];
  }, [result.sources]);

  const avgConfidence = useMemo(() => {
    if (!result.sources?.length) return 0;
    return Math.round(result.sources.reduce((acc, s) => acc + s.confidence, 0) / result.sources.length);
  }, [result.sources]);

  const positiveRatio = useMemo(() => {
    if (!result.sources?.length) return 0;
    const pos = result.sources.filter(s => s.sentiment === 'Positive').length;
    return Math.round((pos / result.sources.length) * 100);
  }, [result.sources]);

  const { speak, stop, playing, loading: ttsLoading, error: ttsError } = useTTS();
  const [voiceEnabled, setVoiceEnabled] = useState(() => loadVoicePrefs().enabled);
  useEffect(() => {
    const sync = () => setVoiceEnabled(loadVoicePrefs().enabled);
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('focus', sync); };
  }, []);

  const buildReportText = () => {
    const lines = [
      `Report for brand ${result.brandName}.`,
      `AI trust score: ${score} percent.`,
      `Strongest dimension: ${strongest[0]}, ${Math.round(strongest[1])} percent.`,
      `Weakest dimension: ${weakest[0]}, ${Math.round(weakest[1])} percent.`,
      `Average model confidence: ${avgConfidence} percent.`,
      `Positive sentiment: ${positiveRatio} percent.`,
    ];
    if (score < 60) lines.push('Note: AI recommends your competitors instead of you. Your brand is invisible in language model results.');
    return lines.join(' ');
  };

  return (
    <div className="relative rounded-2xl border border-[hsl(var(--glass-border))] bg-card/40 backdrop-blur-xl overflow-hidden mb-6">
      {/* Gradient mesh background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-4 right-8 w-56 h-56 rounded-full bg-violet-500/8 blur-3xl" />
        <div className="absolute -bottom-12 left-1/2 w-64 h-48 rounded-full bg-primary/6 blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
      </div>
      <div className="relative p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Big score */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start">
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
              {t('dashboard_overall_score')}
            </div>
            <div className="relative flex items-baseline gap-1 font-display">
              <span className="text-7xl sm:text-8xl font-light text-primary tabular-nums drop-shadow-[0_0_30px_rgba(255,191,0,0.35)]">
                {animScore}
              </span>
              <span className="text-3xl text-primary/60">%</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-medium bg-primary/10 text-primary border border-primary/20">
                {t(getScoreKey(score))}
              </span>
              {delta !== 0 && (
                <span className={cn(
                  'inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium',
                  delta > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                )}>
                  {delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(delta)} pkt
                </span>
              )}
            </div>
            {voiceEnabled && (
              <button
                onClick={() => playing ? stop() : speak(buildReportText())}
                disabled={ttsLoading}
                className={cn(
                  'mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  playing
                    ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                    : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                )}
              >
                {ttsLoading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : playing
                  ? <Square className="w-3.5 h-3.5" />
                  : <Volume2 className="w-3.5 h-3.5" />}
                {ttsLoading ? 'Loading...' : playing ? 'Stop' : 'Read report'}
              </button>
            )}
          </div>

          {/* Verdict */}
          <div className="lg:col-span-5 lg:border-l lg:border-r lg:border-[hsl(var(--glass-border))] lg:px-8">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
              <Sparkles className="w-3 h-3 text-primary" />
              {t('dashboard_verdict')}
            </div>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
              {t(getVerdictKey(score))}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  {t('dashboard_strongest')}
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-sm font-medium text-foreground capitalize">{t(`dim_${strongest[0]}`)}</span>
                  <span className="text-xs text-emerald-400 font-data">{Math.round(strongest[1])}%</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  {t('dashboard_weakest')}
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-sm font-medium text-foreground capitalize">{t(`dim_${weakest[0]}`)}</span>
                  <span className="text-xs text-amber-400 font-data">{Math.round(weakest[1])}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Insights stats */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 flex items-center gap-2">
              <Layers className="w-3 h-3 text-primary" />
              {t('dashboard_top_insights')}
            </div>
            <InsightRow label={t('dashboard_insight_1')} value={topModel?.model ?? '—'} />
            <InsightRow label={t('dashboard_insight_2')} value={`${avgConfidence}%`} />
            <InsightRow label={t('dashboard_insight_3')} value={`${positiveRatio}%`} accent={positiveRatio >= 50} />
          </div>
        </div>

        {/* "o k***wa moment" — competitor urgency banner for low-scoring brands */}
        {score < 60 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="mt-6 rounded-xl border border-red-500/30 bg-red-500/5 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center mt-0.5">
                <Swords className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-300 mb-1">
                  {t('dashboard_low_score_alert_title') !== 'dashboard_low_score_alert_title'
                    ? t('dashboard_low_score_alert_title')
                    : 'AI recommends your competitors — not you'}
                </p>
                <p className="text-xs text-red-300/70 leading-relaxed">
                  {t('dashboard_low_score_alert_body') !== 'dashboard_low_score_alert_body'
                    ? t('dashboard_low_score_alert_body')
                    : `A score of ${score}% means that when someone asks ChatGPT or Gemini for a solution in your category, the models recommend competitors. Your brand is invisible in AI — this is a direct loss of customers.`}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.sources?.slice(0, 3).map((s, i) => (
                    <span key={i} className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium',
                      s.sentiment === 'Negative' ? 'bg-red-500/15 text-red-300' :
                      s.sentiment === 'Neutral' ? 'bg-amber-500/10 text-amber-300' :
                      'bg-emerald-500/10 text-emerald-300'
                    )}>
                      {s.model}: {s.sentiment === 'Negative' ? '✗ does not recommend' : s.sentiment === 'Neutral' ? '~ neutral' : '✓ recommends'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const InsightRow = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className={cn('font-data font-medium', accent ? 'text-emerald-400' : 'text-foreground')}>{value}</span>
  </div>
);

// ── Live signal pill ─────────────────────────────────────────────
const LiveSignal = ({ label }: { label: string }) => (
  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5">
    <span className="relative flex h-1.5 w-1.5">
      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-ping opacity-75" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
    </span>
    <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-data">
      {label}
    </span>
  </div>
);

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const t = useTranslation().t;
  const analysisId = searchParams.get('id');
  const brandFromUrl = searchParams.get('brand') || '';
  const { progress, status, result, startBrewing, reset, loadStoredAnalysis, guestLimitReached } = useBrewing();
  const displayBrand = result?.brandName || brandFromUrl;
  const [inputValue, setInputValue] = useState(brandFromUrl);
  const [moderationError, setModerationError] = useState('');
  const [plan, setPlan] = useState<string>('free');
  const planTier = tierOf(plan);
  const isIdle = !brandFromUrl && !analysisId;

  // Competitor comparison (deterministic client-side score — no API/credit cost)
  const [competitorInput, setCompetitorInput] = useState('');
  const [competitor, setCompetitor] = useState<BrandScore | null>(null);
  const runCompare = () => {
    const name = competitorInput.trim();
    if (!name) return;
    setCompetitor(scoreBrand(name));
  };
  const clearCompare = () => {
    setCompetitor(null);
    setCompetitorInput('');
  };

  // Embeddable badge
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const badgeBrand = result?.brandName || brandFromUrl || 'Your Brand';
  const badgeSrc = `${typeof window !== 'undefined' ? window.location.origin : 'https://www.bitbrew.pl'}/.netlify/functions/badge?brand=${encodeURIComponent(badgeBrand)}`;
  const embedCode = `<a href="https://www.bitbrew.pl" target="_blank" rel="noopener"><img src="${badgeSrc}" alt="BitBrew AI Visibility" height="36" /></a>`;
  const copyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    } catch { /* ignore */ }
  };
  const canSeeCharts = planTier >= 1;
  const canSeeSources = planTier >= 2;

  useEffect(() => {
    const loadPlan = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();
      if (data?.plan) setPlan(data.plan);
    };
    loadPlan();
  }, []);

  useEffect(() => {
    if (analysisId) {
      loadStoredAnalysis(analysisId);
    } else if (brandFromUrl) {
      startBrewing(brandFromUrl);
    }
    return () => reset();
  }, [analysisId, brandFromUrl, reset, startBrewing, loadStoredAnalysis]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputValue?.trim();
    if (!val) return;
    setModerationError('');
    try {
      const res = await fetch('/.netlify/functions/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: val }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.flagged) {
          setModerationError(data.reason || 'Prohibited content.');
          return;
        }
      }
    } catch { /* network error — allow through */ }
    setSearchParams({ brand: val });
    startBrewing(val);
  };

  if (isIdle) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-display text-foreground mb-2">
              Brand analysis
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              Enter the brand name you want to analyze
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  autoFocus
                  value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); setModerationError(''); }}
                  placeholder="np. Apple, Tesla, Nike…"
                  className="w-full bg-card/40 backdrop-blur-xl border border-[hsl(var(--glass-border))] text-foreground placeholder:text-muted-foreground text-base rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="bg-primary text-primary-foreground px-5 py-3.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-40"
              >
                {t('analyze')}
              </button>
            </form>
            {moderationError && (
              <p className="text-xs text-destructive mt-2 text-left">{moderationError}</p>
            )}
            {inputValue.trim().length > 1 && (
              <div className="mt-6 text-left">
                <BrandKnowledgeForm brandName={inputValue} />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="pt-6 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Top bar */}
        <header className="flex flex-col gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="self-start flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {t('back')}
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                {status === 'completed' && <LiveSignal label={t('dashboard_monitoring')} />}
              </div>
              <h1 className="text-3xl sm:text-4xl font-display text-foreground">
                {displayBrand}{' '}
                <span className="text-muted-foreground font-light">{t('auditSuffix')}</span>
              </h1>
              <p className="text-muted-foreground text-xs mt-1.5 font-data">
                {status === 'completed' ? t('dashboard_monitoring') : t('brewingInProgress')}
              </p>
            </div>

            {/* Search input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 sm:max-w-md w-full"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); setModerationError(''); }}
                  placeholder={t('placeholderExample')}
                  className="w-full bg-card/40 backdrop-blur-xl border border-[hsl(var(--glass-border))] text-foreground placeholder:text-muted-foreground text-sm rounded-xl py-2.5 pl-10 pr-3 focus:outline-none focus:border-primary/40 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                {t('analyze')}
              </button>
              {status === 'completed' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      setSearchParams({ brand: displayBrand });
                      setTimeout(() => startBrewing(displayBrand), 100);
                    }}
                    className="inline-flex items-center gap-1.5 bg-card/40 backdrop-blur-xl border border-[hsl(var(--glass-border))] text-foreground px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-card/60 transition-colors"
                    title={t('reBrew')}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 bg-card/40 backdrop-blur-xl border border-[hsl(var(--glass-border))] text-foreground px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-card/60 transition-colors"
                    title={t('dashboard_export_pdf')}
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-xs">{t('dashboard_export_pdf')}</span>
                  </button>
                </>
              )}
            </form>
          </div>

          {moderationError && (
            <p className="text-xs text-destructive mt-1">{moderationError}</p>
          )}

          {/* Brand knowledge */}
          {inputValue.trim().length > 1 && (
            <BrandKnowledgeForm brandName={inputValue} />
          )}

          {/* Guest limit banner */}
          {guestLimitReached && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{t('dashboard_guest_title')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('dashboard_guest_desc')}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/register"
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {t('dashboard_guest_register')}
                </Link>
                <Link
                  to="/pricing"
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[hsl(var(--glass-border))] text-foreground hover:bg-muted/40 transition-colors"
                >
                  {t('dashboard_guest_plans')}
                </Link>
              </div>
            </motion.div>
          )}
        </header>

        {/* Brewing State */}
        {status === 'brewing' && (
          <BrewingProgress progress={progress} brandName={displayBrand} />
        )}

        {/* Results */}
        {status === 'completed' && result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero band */}
            <ScoreHero result={result} t={t} />

            {/* Grid */}
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 space-y-3">
                {/* Competitor comparison bar */}
                <div className="glass-card px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground shrink-0">
                    <Swords className="w-4 h-4 text-primary" />
                    {t('compare_title')}
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1 sm:max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        value={competitorInput}
                        onChange={e => setCompetitorInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') runCompare(); }}
                        placeholder={t('compare_placeholder')}
                        className="w-full pl-8 h-9 text-sm rounded-lg border border-input bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      />
                    </div>
                    <button
                      onClick={runCompare}
                      disabled={!competitorInput.trim()}
                      className="h-9 px-4 text-sm font-medium rounded-lg bg-primary text-primary-foreground disabled:opacity-50 hover:opacity-90 transition-opacity"
                    >
                      {t('compare_action')}
                    </button>
                    {competitor && (
                      <button
                        onClick={clearCompare}
                        aria-label={t('compare_clear')}
                        className="h-9 w-9 flex items-center justify-center rounded-lg border border-input text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {competitor && (
                    <div className="text-sm shrink-0">
                      {(() => {
                        const diff = result.trustScore - competitor.trustScore;
                        const winning = diff >= 0;
                        return (
                          <span className={cn('font-medium', winning ? 'text-emerald-400' : 'text-red-400')}>
                            {winning ? '▲' : '▼'} {Math.abs(diff)} {t('compare_points')}
                            <span className="text-muted-foreground font-normal"> {winning ? t('compare_ahead') : t('compare_behind')} {competitor.brandName}</span>
                          </span>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <RadarChartCard
                  dimensions={result.dimensions}
                  timestamp={result.timestamp}
                  brandName={result.brandName}
                  competitorDimensions={competitor?.dimensions}
                  competitorName={competitor?.brandName}
                />
              </div>
              <div className="col-span-12 lg:col-span-7 relative">
                <div className={canSeeCharts ? '' : 'pointer-events-none blur-sm select-none'} aria-hidden={!canSeeCharts}>
                  <SentimentChart data={result.sentimentTrend} />
                </div>
                {!canSeeCharts && (
                  <LockedOverlay
                    title={t('dashboard_locked_sentiment_title')}
                    description={t('dashboard_locked_sentiment_desc')}
                    onUpgrade={() => navigate('/pricing')}
                    t={t}
                  />
                )}
              </div>
              <div className="col-span-12 lg:col-span-5 relative">
                <div className={canSeeCharts ? '' : 'pointer-events-none blur-sm select-none'} aria-hidden={!canSeeCharts}>
                  <SourceDonutChart data={result.sourceBreakdown} />
                </div>
                {!canSeeCharts && (
                  <LockedOverlay
                    title={t('dashboard_locked_sources_title')}
                    description={t('dashboard_locked_sources_desc')}
                    onUpgrade={() => navigate('/pricing')}
                    t={t}
                  />
                )}
              </div>
              <div className="col-span-12 relative">
                <div className={canSeeSources ? '' : 'pointer-events-none blur-sm select-none'} aria-hidden={!canSeeSources}>
                  <SourceTable sources={result.sources} />
                </div>
                {!canSeeSources && (
                  <LockedOverlay
                    title={t('dashboard_locked_table_title')}
                    description={t('dashboard_locked_table_desc')}
                    onUpgrade={() => navigate('/pricing')}
                    t={t}
                  />
                )}
              </div>

              {/* Embeddable badge */}
              <div className="col-span-12">
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-medium text-foreground">{t('embed_title')}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">{t('embed_desc')}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <img src={badgeSrc} alt="BitBrew AI Visibility badge" height={36} className="h-9 shrink-0" />
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <code className="flex-1 text-[11px] text-muted-foreground bg-background border border-input rounded-lg px-3 py-2 truncate font-data">
                        {embedCode}
                      </code>
                      <button
                        onClick={copyEmbed}
                        className="h-9 px-4 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity shrink-0"
                      >
                        {copiedEmbed ? t('embed_copied') : t('embed_copy')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
