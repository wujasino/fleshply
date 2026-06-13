import { memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/locale';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer,
} from 'recharts';
import { AnalysisResult } from '@/types/analysis';

interface RadarChartCardProps {
  dimensions: AnalysisResult['dimensions'];
  timestamp?: string;
}

export const RadarChartCard = memo(function RadarChartCard({ dimensions, timestamp }: RadarChartCardProps) {
  // Normalize values to 0-100 and round. Accept either 0-1 or 0-100 inputs.
  const normalize = (v: number) => {
    if (typeof v !== 'number' || isNaN(v)) return 50;
    const num = v <= 1 ? v * 100 : v;
    return Math.round(Math.max(0, Math.min(100, num)));
  };

  const { t } = useTranslation();

  const data = [
    { key: 'authority', subject: t('dim_authority'), value: normalize(dimensions.authority) },
    { key: 'sentiment', subject: t('dim_sentiment'), value: normalize(dimensions.sentiment) },
    { key: 'accuracy', subject: t('dim_accuracy'), value: normalize(dimensions.accuracy) },
    { key: 'mentions', subject: t('dim_mentions'), value: normalize(dimensions.mentions) },
    { key: 'recency', subject: t('dim_recency'), value: normalize(dimensions.recency) },
  ];

  const metaBySubject: Record<string, { key: string; value: number }> = data.reduce((acc, d) => {
    acc[d.subject] = { key: d.key, value: d.value };
    return acc;
  }, {} as Record<string, { key: string; value: number }>);

  type TickProps = {
    x: number;
    y: number;
    cx?: number;
    cy?: number;
    payload?: { value: string };
  };

  const renderTick = ({ x, y, cx, cy, payload }: TickProps) => {
    const label = payload?.value ?? '';
    const meta = metaBySubject[label];
    const key = meta?.key;
    const val = meta?.value;

    let tx = x;
    let ty = y;
    if (typeof cx === 'number' && typeof cy === 'number') {
      const factor = 0.94;
      tx = cx + (x - cx) * factor;
      ty = cy + (y - cy) * factor;
    }

    if (key === 'sentiment') {
      tx += 8;
    }

    return (
      <text
        x={tx}
        y={ty}
        fill="#E6E6E6"
        fontSize={12}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontWeight: 500 }}
      >
        {label}{val !== undefined ? ` ${Math.round(val)}%` : ''}
      </text>
    );
  };

  const formattedDate = timestamp ? new Date(timestamp).toLocaleDateString() : '';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-8"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{t('aiPerceptionDimensions')}</h3>
          <p className="text-xs text-muted-foreground mt-1">{t('radar_chart_description')}</p>
        </div>
        {formattedDate && (
          <span className="text-xs text-muted-foreground">{t('analysis_date_collected')} {formattedDate}</span>
        )}
      </div>
      <div className="h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="90%"
            data={data}
            margin={{ top: 10, right: 0, bottom: 10, left: 0 }}
          >
            <PolarGrid stroke="hsl(240, 4%, 22%)" />
            <PolarAngleAxis dataKey="subject" tick={renderTick} />
            <PolarRadiusAxis
              domain={[0, 100]}
              tickCount={6}
              tick={{ fill: 'hsl(240, 5%, 40%)', fontSize: 9 }}
              tickFormatter={(v: number) => v > 0 ? `${v}%` : ''}
              angle={90}
              stroke="transparent"
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#FFBF00"
              fill="#FFBF00"
              fillOpacity={0.34}
              strokeWidth={3}
              strokeOpacity={1}
              dot={{ r: 4, fill: '#FFBF00' }}
              style={{ filter: 'drop-shadow(0 8px 20px rgba(255,191,0,0.18))' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
});
