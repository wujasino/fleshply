import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Smile, Target, AtSign, Clock,
  ListChecks, CheckCircle2, AlertTriangle, ArrowUpRight, Sparkles,
} from 'lucide-react';
import { useTranslation } from '@/lib/locale';
import { AnalysisResult } from '@/types/analysis';
import { cn } from '@/lib/utils';

type DimKey = keyof AnalysisResult['dimensions'];

// Fixed dimension order + the lucide glyph that identifies each one.
const DIM_ORDER: DimKey[] = ['authority', 'sentiment', 'accuracy', 'mentions', 'recency'];
const DIM_ICON: Record<DimKey, typeof ShieldCheck> = {
  authority: ShieldCheck,
  sentiment: Smile,
  accuracy: Target,
  mentions: AtSign,
  recency: Clock,
};

// Score → status band. Reserved status palette (good / warning / critical), each
// shipped with a label — never colour alone. Higher score = healthier.
type Band = 'strong' | 'moderate' | 'critical';
const bandOf = (score: number): Band => (score >= 70 ? 'strong' : score >= 50 ? 'moderate' : 'critical');

const BAND_STYLE: Record<Band, { meter: string; text: string; chip: string; labelKey: string }> = {
  strong:   { meter: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', chip: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20', labelKey: 'status_strong' },
  moderate: { meter: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400',     chip: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',       labelKey: 'status_moderate' },
  critical: { meter: 'bg-red-500',     text: 'text-red-600 dark:text-red-400',         chip: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20',             labelKey: 'status_critical' },
};

const normalize = (v: number) => {
  if (typeof v !== 'number' || isNaN(v)) return 50;
  const num = v <= 1 ? v * 100 : v;
  return Math.round(Math.max(0, Math.min(100, num)));
};

// ── One dimension result: label, score, a magnitude meter, status word ──────
const DimensionResult = ({ dim, score, delay }: { dim: DimKey; score: number; delay: number }) => {
  const { t } = useTranslation();
  const band = bandOf(score);
  const style = BAND_STYLE[band];
  const Icon = DIM_ICON[dim];
  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs font-medium text-foreground truncate">{t(`dim_${dim}`)}</span>
        </div>
        <span className={cn('text-sm font-data font-semibold tabular-nums', style.text)}>{score}%</span>
      </div>
      {/* Magnitude meter — recessive track, status-coloured fill, rounded data-end */}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden" role="img" aria-label={`${t(`dim_${dim}`)}: ${score}%`}>
        <motion.div
          className={cn('h-full rounded-full', style.meter)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay, duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="mt-2.5">
        <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border', style.chip)}>
          {t(style.labelKey)}
        </span>
      </div>
    </div>
  );
};

// ── Prioritised action plan derived from the weakest dimensions ─────────────
const ActionPlan = ({ ranked }: { ranked: { dim: DimKey; score: number }[] }) => {
  const { t } = useTranslation();
  // Everything below "strong" needs attention; surface the three lowest first.
  const todo = ranked.filter(r => r.score < 70).slice(0, 3);

  if (todo.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 flex items-start gap-3">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mt-0.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{t('results_all_strong_title')}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t('results_all_strong_desc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {todo.map((item, i) => {
        const band = bandOf(item.score);
        const isCritical = band === 'critical';
        const Icon = DIM_ICON[item.dim];
        return (
          <motion.div
            key={item.dim}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.35 }}
            className="rounded-xl border border-border bg-card/60 p-4 flex items-start gap-3"
          >
            <div className={cn(
              'shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center mt-0.5',
              isCritical ? 'bg-red-500/12 border-red-500/25' : 'bg-amber-500/12 border-amber-500/25'
            )}>
              <Icon className={cn('w-4 h-4', isCritical ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400')} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <p className="text-sm font-semibold text-foreground">{t(`dim_${item.dim}`)}</p>
                <span className={cn(
                  'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border',
                  isCritical
                    ? 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                )}>
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {t(isCritical ? 'priority_high' : 'priority_medium')}
                </span>
                <span className="text-[10px] font-data text-muted-foreground">{item.score}%</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{t(`rec_${item.dim}`)}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ── Model-written action plan (preferred when the analysis provides one) ────
const IMPACT_STYLE: Record<string, string> = {
  High:   'bg-primary/10 text-primary border-primary/20',
  Medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  Low:    'bg-muted text-muted-foreground border-border',
};
const ModelActionPlan = ({ items }: { items: NonNullable<AnalysisResult['actionPlan']> }) => (
  <div className="space-y-2.5">
    {items.map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 + i * 0.08, duration: 0.35 }}
        className="rounded-xl border border-border bg-card/60 p-4 flex items-start gap-3"
      >
        <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mt-0.5 text-xs font-display font-semibold text-primary">
          {i + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border', IMPACT_STYLE[item.impact] ?? IMPACT_STYLE.Medium)}>
              {item.impact} impact
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
        </div>
      </motion.div>
    ))}
  </div>
);

interface ResultsBreakdownProps {
  result: AnalysisResult;
}

export const ResultsBreakdown = memo(function ResultsBreakdown({ result }: ResultsBreakdownProps) {
  const { t } = useTranslation();

  const ranked = useMemo(() => {
    return DIM_ORDER
      .map(dim => ({ dim, score: normalize(result.dimensions[dim]) }))
      .sort((a, b) => a.score - b.score);
  }, [result.dimensions]);

  const actionsCount = ranked.filter(r => r.score < 70).length;

  return (
    <div className="glass-card p-6">
      {/* Per-dimension results */}
      <div className="flex items-center gap-2 mb-1">
        <ListChecks className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{t('results_title')}</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{t('results_subtitle')}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {DIM_ORDER.map((dim, i) => (
          <DimensionResult key={dim} dim={dim} score={normalize(result.dimensions[dim])} delay={0.1 + i * 0.06} />
        ))}
      </div>

      {/* Action plan */}
      <div className="mt-7 pt-6 border-t border-border">
        <div className="flex items-center gap-2 mb-1">
          <ArrowUpRight className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{t('results_action_title')}</h3>
          {actionsCount > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
              {Math.min(actionsCount, 3)}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-primary/70" />
          {t('results_action_subtitle')}
        </p>
        {result.actionPlan?.length
          ? <ModelActionPlan items={result.actionPlan} />
          : <ActionPlan ranked={ranked} />}
      </div>
    </div>
  );
});

export default ResultsBreakdown;
