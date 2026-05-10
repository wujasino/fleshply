import { useState, useCallback } from 'react';
import { AnalysisResult } from '@/types/analysis';

export function useBrewing() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'brewing' | 'completed'>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const startBrewing = useCallback(async (brandName: string) => {
    setStatus('brewing');
    setProgress(0);
    setResult(null);

    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 8 + 2;
      if (current >= 90) {
        clearInterval(interval);
        setProgress(90);
      } else {
        setProgress(Math.round(current));
      }
    }, 200);

    try {
      const response = await fetch('/.netlify/functions/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: brandName })
      });

      const data = await response.json();

      clearInterval(interval);
      setProgress(100);

      const analysisResult: AnalysisResult = {
        id: crypto.randomUUID(),
        brandName,
        timestamp: new Date().toISOString(),
        dimensions: {
          authority: data.authority,
          sentiment: data.sentiment,
          recency: data.recency,
          mentions: data.mentions,
          accuracy: data.accuracy
        },
        trustScore: data.trustScore,
        sources: [],
        sentimentTrend: [],
        sourceBreakdown: [],
        status: 'completed'
      };

      setTimeout(() => {
        setResult(analysisResult);
        setStatus('completed');
      }, 600);

    } catch (error) {
      clearInterval(interval);
      setStatus('idle');
      setProgress(0);
      console.error('Analysis failed:', error);
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setResult(null);
  }, []);

  return { progress, status, result, startBrewing, reset };
}