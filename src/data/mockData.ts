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
    { name: 'GPT-4o', value: 35, color: '#8B79F6' },
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
    { name: 'GPT-4o', value: 40, color: '#8B79F6' },
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
    name: 'Free',
    price: 'Free',
    periodKey: 'tier_period_empty',
    descriptionKey: 'tier_free_desc',
    featureKeys: [
      'tier_free_feat_1',
      'tier_free_feat_2',
      'tier_free_feat_3',
    ],
  },
  {
    name: 'Solo Brew',
    price: '99 zł',
    monthlyPrice: '99 zł',
    yearlyPrice: '950 zł',
    periodKey: 'tier_period_month',
    descriptionKey: 'tier_solo_desc',
    featureKeys: [
      'tier_solo_feat_1',
      'tier_solo_feat_2',
      'tier_solo_feat_3',
      'tier_solo_feat_4',
      'tier_solo_feat_5',
    ],
  },
  {
    name: 'Growth',
    price: '249 zł',
    monthlyPrice: '249 zł',
    yearlyPrice: '2 350 zł',
    periodKey: 'tier_period_month',
    descriptionKey: 'tier_growth_desc',
    featureKeys: [
      'tier_growth_feat_1',
      'tier_growth_feat_2',
      'tier_growth_feat_3',
      'tier_growth_feat_4',
      'tier_growth_feat_5',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise Suite',
    price: 'Indywidualna wycena',
    monthlyPrice: 'Indywidualna wycena',
    yearlyPrice: 'Indywidualna wycena',
    periodKey: 'tier_period_empty',
    descriptionKey: 'tier_ent_desc',
    featureKeys: [
      'tier_ent_feat_1',
      'tier_ent_feat_2',
      'tier_ent_feat_3',
      'tier_ent_feat_4',
      'tier_ent_feat_5',
    ],
  },
];
