import { useState, useCallback, useRef } from 'react';
import { AnalysisResult } from '@/types/analysis';
import { mockTeslaAnalysis, mockAppleAnalysis } from '@/data/mockData';

export function useBrewing() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'brewing' | 'completed'>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const startBrewing = useCallback((brandName: string) => {
    setStatus('brewing');
    setProgress(0);
    setResult(null);

    let current = 0;
    intervalRef.current = setInterval(() => {
      current += Math.random() * 8 + 2;
      if (current >= 100) {
        current = 100;
        clearInterval(intervalRef.current);
        setProgress(100);
        setTimeout(() => {
          const mockResult = brandName.toLowerCase().includes('apple')
            ? { ...mockAppleAnalysis, brandName }
            : { ...mockTeslaAnalysis, brandName };
          setResult(mockResult);
          setStatus('completed');
        }, 600);
      } else {
        setProgress(Math.round(current));
      }
    }, 200);
  }, []);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setStatus('idle');
    setProgress(0);
    setResult(null);
  }, []);

  return { progress, status, result, startBrewing, reset };
}
