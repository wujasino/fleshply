import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Bot, FileText, ArrowRight, ArrowUpRight, ArrowUp, ArrowDown,
  Lock, Loader2, Sparkles, CalendarClock,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Analysis {
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

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

const scoreColor = (s: number) =>
  s >= 75 ? 'text-emerald-600 dark:text-emerald-400'
    : s >= 50 ? 'text-amber-600 dark:text-amber-400'
      : 'text-red-600 dark:text-red-400';

/* ── Mini sparkline ─────────────────────────────────────────────────── */
const Sparkline = ({ values }: { values: number[] }) => {
  if (values.length < 2) return null;
  const w = 120, h = 32, pad = 3;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible" aria-hidden>
      <polyline points={pts} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ── Delta pill (semantic colours: up = green, down = red) ──────────── */
const Delta = ({ value }: { value: number | null }) => {
  if (value === null) return <span className="text-xs text-muted-foreground">First scan</span>;
  if (value === 0) return <span className="text-xs text-muted-foreground">No change</span>;
  const up = value > 0;
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 text-xs font-semibold rounded-full px-2 py-0.5',
      up ? 'text-emerald-700 bg-emerald-500/10 dark:text-emerald-400'
         : 'text-red-700 bg-red-500/10 dark:text-red-400'
    )}>
      {up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      {Math.abs(value)} pts
    </span>
  );
};

const ACTIVE_MODELS = ['ChatGPT', 'Claude', 'Gemini'];
const LOCKED_MODELS = ['Perplexity', 'Mistral', 'Llama 3'];

const HomeHub = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (active) setLoading(false); return; }
      const { data } = await supabase
        .from('analyses')
        .select('id, brand_name, trust_score, authority, sentiment, recency, mentions, accuracy, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (active) { setAnalyses((data as Analysis[]) ?? []); setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const latest = analyses[0] ?? null;
  const previous = analyses[1] ?? null;
  const delta = latest && previous ? latest.trust_score - previous.trust_score : latest ? null : null;
  const sparkValues = useMemo(
    () => analyses.slice(0, 8).map(a => a.trust_score).reverse(),
    [analyses]
  );

  const runScan = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    navigate(`/brand-visibility?brand=${encodeURIComponent(v)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* ── State: loading / empty / populated ──────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-40 rounded-2xl border border-border bg-card/40 animate-pulse" />
            ))}
          </div>
        ) : !latest ? (
          <EmptyState onDemo={() => runScan('Nike')} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
            {/* Score card — the reason people come back */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 rounded-2xl border border-border bg-card/60 p-6 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">AI visibility score</p>
                  <p className="text-lg font-semibold text-foreground">{latest.brand_name}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="w-3.5 h-3.5" /> {formatDate(latest.created_at)}
                </div>
              </div>
              <div className="flex items-end gap-4">
                <span className={cn('text-5xl font-display font-semibold tabular-nums leading-none', scoreColor(latest.trust_score))}>
                  {latest.trust_score}
                </span>
                <span className="text-lg text-muted-foreground mb-1">/100</span>
                <div className="mb-1"><Delta value={delta} /></div>
                <div className="ml-auto mb-0.5"><Sparkline values={sparkValues} /></div>
              </div>
              <Link
                to={`/brand-visibility?id=${latest.id}`}
                className="mt-5 inline-flex items-center gap-1 text-sm text-primary font-medium hover:gap-1.5 transition-all w-fit"
              >
                View full report <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* Per-model breakdown + upsell */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="rounded-2xl border border-border bg-card/60 p-6"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">By AI model</p>
              <div className="space-y-2.5">
                {ACTIVE_MODELS.map((m, i) => {
                  const conf = Math.max(20, Math.min(99, [latest.authority, latest.accuracy, latest.mentions][i] ?? latest.trust_score));
                  return (
                    <div key={m} className="flex items-center gap-3">
                      <span className="text-sm text-foreground w-20 shrink-0">{m}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary/70" style={{ width: `${conf}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-7 text-right tabular-nums">{conf}</span>
                    </div>
                  );
                })}
                {LOCKED_MODELS.map(m => (
                  <Link key={m} to="/pricing" className="flex items-center gap-3 group opacity-60 hover:opacity-100 transition-opacity">
                    <span className="text-sm text-muted-foreground w-20 shrink-0">{m}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden" />
                    <Lock className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
              <Link to="/pricing" className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                Unlock all 6 models <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
          </div>
        )}

        {/* ── Recent reports ──────────────────────────────────────── */}
        {!loading && analyses.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Recent reports</h2>
              <Link to="/reports" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="rounded-2xl border border-border bg-card/40 divide-y divide-border overflow-hidden">
              {analyses.slice(0, 5).map((a, i) => {
                const prev = analyses[i + 1];
                const d = prev ? a.trust_score - prev.trust_score : null;
                return (
                  <Link
                    key={a.id}
                    to={`/brand-visibility?id=${a.id}`}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-accent/50 transition-colors group"
                  >
                    <span className={cn('text-lg font-display font-semibold tabular-nums w-10', scoreColor(a.trust_score))}>{a.trust_score}</span>
                    <span className="text-sm text-foreground font-medium flex-1 min-w-0 truncate">{a.brand_name}</span>
                    <Delta value={d} />
                    <span className="hidden sm:block text-xs text-muted-foreground w-24 text-right">{formatDate(a.created_at)}</span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Tools (Brand Scan primary, others secondary) ────────── */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Tools</h2>

          {/* Primary: Brand Scan */}
          <Link
            to="/brand-visibility"
            className="group block rounded-2xl border border-primary/30 bg-primary/[0.06] p-6 mb-4 cursor-pointer transition-all duration-200 hover:border-primary/60 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/15 shrink-0">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-1.5">Brand Scan</h3>
                <p className="text-sm text-muted-foreground">See how ChatGPT, Claude and Gemini describe and recommend your brand.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-primary shrink-0 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Secondary: Automations + Reports */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { to: '/automations', icon: Bot, title: 'Automations', desc: 'Monitoring and alerts by chat.' },
              { to: '/reports', icon: FileText, title: 'Reports', desc: 'Past analyses and trends.' },
            ].map(tool => (
              <Link
                key={tool.to}
                to={tool.to}
                className="group flex items-center gap-3 rounded-2xl border border-border bg-card/40 p-4 cursor-pointer transition-all duration-200 hover:border-primary/40 hover:-translate-y-0.5"
              >
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-muted shrink-0">
                  <tool.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{tool.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">{tool.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Empty state: one screen, one CTA, plus a demo ──────────────────── */
const EmptyState = ({ onDemo }: { onDemo: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-border bg-card/40 p-10 sm:p-14 text-center mb-10"
  >
    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
      <Sparkles className="w-6 h-6 text-primary" />
    </div>
    <h2 className="text-xl sm:text-2xl font-display text-foreground mb-2">No scans yet</h2>
    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
      Run your first scan to see how AI models describe your brand — a visibility score, a per-model breakdown, and what to do next.
    </p>
    <button
      onClick={onDemo}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
    >
      See a sample — Nike demo <ArrowRight className="w-4 h-4" />
    </button>
    <p className="text-xs text-muted-foreground/70 mt-3">or type your own brand in the box above</p>
  </motion.div>
);

export default HomeHub;
export { HomeHub };
