import { motion } from 'framer-motion';
import { SourceResult } from '@/types/analysis';

interface SourceTableProps {
  sources: SourceResult[];
}

export const SourceTable = ({ sources }: SourceTableProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card overflow-hidden"
    >
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[hsl(45,100%,50%,0.05)]">
            <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Source Model</th>
            <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Perception</th>
            <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Top Association</th>
            <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider text-right">Confidence</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[hsl(45,100%,50%,0.05)]">
          {sources.map((row) => (
            <tr key={row.model} className="transition-colors hover:bg-surface-hover/30">
              <td className="p-4 font-data text-primary">{row.model}</td>
              <td className="p-4">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  row.sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-400' :
                  row.sentiment === 'Negative' ? 'bg-red-500/10 text-red-400' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {row.sentiment}
                </span>
              </td>
              <td className="p-4 text-muted-foreground hidden sm:table-cell">{row.association}</td>
              <td className="p-4 text-right font-data">{row.confidence}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};
