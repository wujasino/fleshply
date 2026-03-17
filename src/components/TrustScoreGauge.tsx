import { motion } from 'framer-motion';

interface TrustScoreGaugeProps {
  score: number;
}

function getScoreLabel(score: number) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'High Fidelity';
  if (score >= 50) return 'Moderate';
  return 'Low Signal';
}

export const TrustScoreGauge = ({ score }: TrustScoreGaugeProps) => {
  return (
    <div className="glass-card p-8 flex flex-col items-center justify-center">
      <span className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] mb-6">
        Overall Visibility Score
      </span>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
        className="text-8xl font-light text-primary font-display"
      >
        {score}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs border border-primary/20"
      >
        {getScoreLabel(score)}
      </motion.div>
    </div>
  );
};
