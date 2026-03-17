import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SentimentChartProps {
  data: { date: string; score: number }[];
}

export const SentimentChart = ({ data }: SentimentChartProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-8"
    >
      <h3 className="text-sm font-medium mb-6 text-muted-foreground">Sentiment Trend</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFBF00" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#FFBF00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: 'hsl(240, 5%, 50%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[50, 100]}
              tick={{ fill: 'hsl(240, 5%, 50%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(240, 4%, 14%)',
                border: '1px solid rgba(255,191,0,0.2)',
                borderRadius: '8px',
                color: 'hsl(240, 5%, 96%)',
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#FFBF00"
              strokeWidth={2}
              fill="url(#amberGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
