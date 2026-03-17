import { AnalysisResult, PricingTier } from '@/types/analysis';

export const mockTeslaAnalysis: AnalysisResult = {
  id: 'analysis-001',
  brandName: 'Tesla',
  timestamp: '2024-10-24T14:30:00Z',
  trustScore: 84,
  dimensions: {
    authority: 92,
    sentiment: 78,
    accuracy: 86,
    mentions: 95,
    recency: 88,
  },
  sources: [
    { model: 'GPT-4o', sentiment: 'Positive', association: 'Innovation & EV Leadership', confidence: 98 },
    { model: 'Claude 3.5 Sonnet', sentiment: 'Neutral', association: 'Manufacturing Scale', confidence: 94 },
    { model: 'Gemini 1.5 Pro', sentiment: 'Positive', association: 'Autonomous Driving', confidence: 91 },
    { model: 'Llama 3.1', sentiment: 'Positive', association: 'Energy Storage', confidence: 87 },
    { model: 'Mistral Large', sentiment: 'Neutral', association: 'Market Valuation', confidence: 82 },
  ],
  sentimentTrend: [
    { date: 'Jan', score: 72 },
    { date: 'Feb', score: 68 },
    { date: 'Mar', score: 75 },
    { date: 'Apr', score: 79 },
    { date: 'May', score: 74 },
    { date: 'Jun', score: 81 },
    { date: 'Jul', score: 85 },
    { date: 'Aug', score: 82 },
    { date: 'Sep', score: 80 },
    { date: 'Oct', score: 84 },
  ],
  sourceBreakdown: [
    { name: 'GPT-4o', value: 35, color: '#FFBF00' },
    { name: 'Claude', value: 28, color: '#D97706' },
    { name: 'Gemini', value: 20, color: '#92400E' },
    { name: 'Llama', value: 10, color: '#78716C' },
    { name: 'Mistral', value: 7, color: '#57534E' },
  ],
  status: 'completed',
};

export const mockAppleAnalysis: AnalysisResult = {
  id: 'analysis-002',
  brandName: 'Apple',
  timestamp: '2024-10-22T09:15:00Z',
  trustScore: 91,
  dimensions: {
    authority: 96,
    sentiment: 89,
    accuracy: 92,
    mentions: 98,
    recency: 90,
  },
  sources: [
    { model: 'GPT-4o', sentiment: 'Positive', association: 'Premium Design', confidence: 99 },
    { model: 'Claude 3.5 Sonnet', sentiment: 'Positive', association: 'Ecosystem Lock-in', confidence: 96 },
    { model: 'Gemini 1.5 Pro', sentiment: 'Positive', association: 'Privacy Leadership', confidence: 93 },
  ],
  sentimentTrend: [
    { date: 'Jan', score: 88 },
    { date: 'Feb', score: 87 },
    { date: 'Mar', score: 89 },
    { date: 'Apr', score: 90 },
    { date: 'May', score: 91 },
    { date: 'Jun', score: 89 },
    { date: 'Jul', score: 92 },
    { date: 'Aug', score: 91 },
    { date: 'Sep', score: 90 },
    { date: 'Oct', score: 91 },
  ],
  sourceBreakdown: [
    { name: 'GPT-4o', value: 40, color: '#FFBF00' },
    { name: 'Claude', value: 30, color: '#D97706' },
    { name: 'Gemini', value: 30, color: '#92400E' },
  ],
  status: 'completed',
};

export const pastBrews = [
  mockTeslaAnalysis,
  mockAppleAnalysis,
  {
    id: 'analysis-003',
    brandName: 'Nike',
    timestamp: '2024-10-20T16:45:00Z',
    trustScore: 79,
    status: 'completed' as const,
  },
  {
    id: 'analysis-004',
    brandName: 'Stripe',
    timestamp: '2024-10-18T11:20:00Z',
    trustScore: 88,
    status: 'completed' as const,
  },
];

export const pricingTiers: PricingTier[] = [
  {
    name: 'Solo Brew',
    price: '$29',
    period: '/month',
    description: 'For indie founders and solo marketers tracking their brand.',
    features: [
      '10 brand analyses per month',
      '3 LLM sources (GPT-4o, Claude, Gemini)',
      'Basic sentiment tracking',
      '30-day history',
      'CSV export',
    ],
  },
  {
    name: 'Growth Roast',
    price: '$99',
    period: '/month',
    description: 'For growing teams who need deeper competitive insights.',
    features: [
      '50 brand analyses per month',
      'All 5 LLM sources',
      'Advanced sentiment & trend analysis',
      '1-year history',
      'API access',
      'Competitor comparison',
      'Weekly digest emails',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise Roast',
    price: 'Custom',
    period: '',
    description: 'For enterprises requiring full AI visibility control.',
    features: [
      'Unlimited analyses',
      'All LLM sources + custom models',
      'Real-time monitoring',
      'Unlimited history',
      'Full API + webhooks',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
];
