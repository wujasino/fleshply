export interface AnalysisResult {
  id: string;
  brandName: string;
  timestamp: string;
  trustScore: number;
  dimensions: {
    authority: number;
    sentiment: number;
    accuracy: number;
    mentions: number;
    recency: number;
  };
  sources: SourceResult[];
  sentimentTrend: { date: string; score: number }[];
  sourceBreakdown: { name: string; value: number; color: string }[];
  status: 'brewing' | 'completed' | 'failed';
  /** Model-written narrative verdict; falls back to canned locale copy when absent. */
  verdict?: string;
  /** Model-written competitor insight for the low-score banner. */
  competitorInsight?: string;
  /** Model-written, prioritised action plan; falls back to dimension-derived actions. */
  actionPlan?: ActionItem[];
}

export interface ActionItem {
  title: string;
  impact: 'High' | 'Medium' | 'Low';
  desc: string;
}

export interface SourceResult {
  model: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  association: string;
  confidence: number;
}

export interface PricingTier {
  name: string;
  price: string;
  monthlyPrice?: string;
  yearlyPrice?: string;
  periodKey: string;
  descriptionKey: string;
  featureKeys: string[];
  highlighted?: boolean;
}
