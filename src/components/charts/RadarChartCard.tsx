import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer,
} from 'recharts';
import { AnalysisResult } from '@/types/analysis';

interface RadarChartCardProps {
  dimensions: AnalysisResult['dimensions'];
}

export const RadarChartCard = ({ dimensions }: RadarChartCardProps) => {
  const data = [
    { subject: 'Authority', value: dimensions.authority },
    { subject: 'Sentiment', value: dimensions.sentiment },
    { subject: 'Accuracy', value: dimensions.accuracy },
    { subject: 'Mentions', value: dimensions.mentions },
    { subject: 'Recency', value: dimensions.recency },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-8"
    >
      <h3 className="text-sm font-medium mb-6 text-muted-foreground">AI Perception Dimensions</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="hsl(240, 4%, 22%)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: 'hsl(240, 5%, 50%)', fontSize: 12 }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#FFBF00"
              fill="#FFBF00"
              fillOpacity={0.12}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
