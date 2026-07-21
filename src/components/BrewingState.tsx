import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import { useTranslation } from '@/lib/locale';
import { Sparkles, Zap } from 'lucide-react';

interface BrewingProgressProps {
  progress: number;
  brandName: string;
}

const MODELS = [
  { name: 'GPT-4o',     color: '#10A37F' },
  { name: 'Claude',     color: '#D97757' },
  { name: 'Gemini',     color: '#4285F4' },
  { name: 'Perplexity', color: '#20B2AA' },
  { name: 'Mistral',    color: '#FA5515' },
  { name: 'Llama',      color: '#8B5CF6' },
];

export const BrewingProgress = ({ progress, brandName }: BrewingProgressProps) => {
  const { t } = useTranslation();

  const stages = [
    { threshold: 0,  label: t('stage_0') },
    { threshold: 20, label: t('stage_1') },
    { threshold: 45, label: t('stage_2') },
    { threshold: 70, label: t('stage_3') },
    { threshold: 90, label: t('stage_4') },
  ];
  const currentStage = [...stages].reverse().find(s => progress >= s.threshold);
  const currentStageIndex = stages.findIndex(s => s.label === currentStage?.label);

  // Each model "activates" sequentially as progress advances
  const activeModelCount = Math.min(MODELS.length, Math.ceil((progress / 100) * MODELS.length));

  // Position model nodes on a circle
  const radius = 170;
  const center = 220;
  const modelPositions = useMemo(
    () =>
      MODELS.map((m, i) => {
        const angle = (i / MODELS.length) * Math.PI * 2 - Math.PI / 2;
        return {
          ...m,
          x: center + Math.cos(angle) * radius,
          y: center + Math.sin(angle) * radius,
          angle,
        };
      }),
    []
  );

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] overflow-hidden">
      {/* Atmospheric glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      {/* Status pill */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary animate-ping opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
        <span className="text-[10px] uppercase tracking-[0.25em] text-primary font-data">
          {t('brewing_label')} · LIVE
        </span>
      </motion.div>

      {/* Neural network visualization */}
      <div className="relative w-[440px] h-[440px]">
        <svg viewBox="0 0 440 440" className="w-full h-full">
          <defs>
            <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#8B79F6" stopOpacity="0.9" />
              <stop offset="60%"  stopColor="#8B79F6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8B79F6" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="connectionLive" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8B79F6" stopOpacity="0" />
              <stop offset="50%" stopColor="#8B79F6" stopOpacity="1" />
              <stop offset="100%" stopColor="#8B79F6" stopOpacity="0" />
            </linearGradient>
            <filter id="modelGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Orbital rings */}
          {[1, 2, 3].map(i => (
            <motion.circle
              key={i}
              cx={center}
              cy={center}
              r={50 + i * 40}
              fill="none"
              stroke="hsl(45, 100%, 50%)"
              strokeOpacity={0.04 + (4 - i) * 0.02}
              strokeWidth={0.5}
              animate={{ rotate: 360 }}
              transition={{ duration: 60 / i, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: `${center}px ${center}px` }}
            />
          ))}

          {/* Pulse rings emitting from center */}
          {[0, 1, 2].map(i => (
            <motion.circle
              key={`pulse-${i}`}
              cx={center}
              cy={center}
              r={30}
              fill="none"
              stroke="#8B79F6"
              strokeWidth={1}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 6, opacity: 0 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1,
                ease: 'easeOut',
              }}
              style={{ transformOrigin: `${center}px ${center}px` }}
            />
          ))}

          {/* Connections center → models */}
          {modelPositions.map((m, i) => {
            const isActive = i < activeModelCount;
            return (
              <g key={`conn-${m.name}`}>
                {/* base line */}
                <line
                  x1={center} y1={center}
                  x2={m.x} y2={m.y}
                  stroke="hsl(45, 100%, 50%)"
                  strokeOpacity={isActive ? 0.25 : 0.06}
                  strokeWidth={1}
                />
                {/* animated traveling pulse */}
                {isActive && (
                  <motion.circle
                    r={3}
                    fill="#8B79F6"
                    filter="url(#modelGlow)"
                    initial={{ cx: center, cy: center, opacity: 0 }}
                    animate={{
                      cx: [center, m.x],
                      cy: [center, m.y],
                      opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </g>
            );
          })}

          {/* Center brand core */}
          <circle cx={center} cy={center} r={70} fill="url(#coreGlow)" />
          <motion.circle
            cx={center} cy={center}
            r={32}
            fill="hsl(240, 4%, 10%)"
            stroke="#8B79F6"
            strokeWidth={1.5}
            animate={{
              strokeOpacity: [0.5, 1, 0.5],
              r: [32, 34, 32],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Model nodes */}
          {modelPositions.map((m, i) => {
            const isActive = i < activeModelCount;
            return (
              <g key={`node-${m.name}`}>
                {isActive && (
                  <motion.circle
                    cx={m.x} cy={m.y}
                    r={20}
                    fill={m.color}
                    fillOpacity={0.15}
                    animate={{ r: [18, 24, 18], fillOpacity: [0.1, 0.25, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                  />
                )}
                <circle
                  cx={m.x} cy={m.y}
                  r={6}
                  fill={isActive ? m.color : 'hsl(240, 4%, 18%)'}
                  stroke={isActive ? m.color : 'hsl(240, 4%, 25%)'}
                  strokeWidth={1.5}
                />
                <text
                  x={m.x}
                  y={m.y + (m.y > center ? 22 : -16)}
                  textAnchor="middle"
                  fill={isActive ? '#E6E6E6' : 'hsl(240, 5%, 35%)'}
                  fontSize="10"
                  fontWeight="500"
                  style={{ letterSpacing: '0.03em' }}
                >
                  {m.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Progress + stage console */}
      <div className="relative z-10 mt-2 w-full max-w-md flex flex-col items-center">
        {/* Big % */}
        <div className="flex items-baseline gap-1 font-display">
          <motion.span
            key={progress}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-light text-foreground tabular-nums"
          >
            {progress}
          </motion.span>
          <span className="text-xl text-muted-foreground">%</span>
        </div>

        {/* Progress bar */}
        <div className="mt-4 w-full h-[2px] bg-muted/40 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary/60 via-primary to-primary/60"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Stage line */}
        <div className="mt-5 h-5">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStage?.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-sm text-foreground/80 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              {currentStage?.label}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Brand line */}
        <p className="mt-2 text-xs text-muted-foreground/70 font-data">
          {(() => {
            const parts = t('analyzing_across').split('{brand}');
            return (
              <>
                {parts[0]} <span className="text-primary">{brandName}</span> {parts[1]}
              </>
            );
          })()}
        </p>

        {/* Stage dots */}
        <div className="mt-6 flex gap-2">
          {stages.map((_, i) => (
            <div
              key={i}
              className="flex items-center"
            >
              <motion.div
                className="h-1 rounded-full"
                animate={{
                  width: i <= currentStageIndex ? 24 : 8,
                  backgroundColor: i <= currentStageIndex
                    ? 'hsl(45, 100%, 50%)'
                    : 'hsl(240, 4%, 22%)',
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          ))}
        </div>

        {/* Models scanned counter */}
        <div className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-data">
          <Zap className="w-3 h-3 text-primary/60" />
          {activeModelCount} / {MODELS.length} models active
        </div>
      </div>
    </div>
  );
};
