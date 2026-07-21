/* Shared FAQ content — surfaced on the landing page and the app home. */
export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_EN: FaqItem[] = [
  {
    q: 'What does Presora actually do?',
    a: 'Presora fires structured prompts at foundation models — GPT-4o, Claude, Gemini, Perplexity, Mistral and more — then scores your brand across 5 dimensions: authority, sentiment, accuracy, mention rate, and recency. Result: one visibility score, model-by-model breakdown, and a ranked list of actionable improvements.',
  },
  {
    q: 'Which AI models do you query?',
    a: 'Free plan uses GPT-4o. Solo adds Claude 3.5 and Gemini 1.5 Pro. Growth unlocks all 6 production models including Perplexity, Mistral-large, and Llama 3.1. Enterprise can add private fine-tuned or on-premise models.',
  },
  {
    q: 'How long does an analysis take?',
    a: 'Typically 8–15 seconds end-to-end. All models are queried in parallel, responses are normalized by our scoring pipeline, and your score is streamed back in real time. You can watch the live model map during the brew.',
  },
  {
    q: 'How accurate is the visibility score?',
    a: 'The score is a weighted average across 5 dimensions calibrated against 200+ benchmark brands. Each dimension aggregates multiple model outputs with per-response confidence weights, so one noisy result cannot move the needle.',
  },
  {
    q: 'Can I track competitors?',
    a: 'Yes — Growth and Enterprise plans include side-by-side competitor analysis across the same prompt set and scoring dimensions. Add up to 10 brands and run them on the same automated schedule as your own.',
  },
  {
    q: 'Do you offer an API and webhooks?',
    a: 'Yes. Generate API keys from the Developers panel and integrate via REST. Webhooks deliver events (analysis.completed, sentiment.dropped, score.changed) to your endpoint in real time. Full OpenAPI spec in the docs.',
  },
  {
    q: 'How is my data handled?',
    a: 'Brand context you upload stays in your private workspace. We never train models on your data and never share inputs beyond the AI providers required to run an analysis. SOC 2 aligned, full GDPR compliance.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes — no contracts, no lock-in. Cancel in one click from Settings and your access continues until the end of the billing period.',
  },
];
