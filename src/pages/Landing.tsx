import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Eye, BarChart3, Shield, ChevronDown, HelpCircle, Mail, TrendingUp, ArrowRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { CookiePanel } from '@/components/ui/cookie-banner-1';
import { NewsletterSignup } from '@/components/ui/newsletter-signup';
import { GradientMeshBg } from '@/components/ui/gradient-mesh-bg';
import { ContactForm } from '@/components/ui/contact-form';

/* ── Integration logos (text-based, gray) ─────────────────────────── */
const INTEGRATIONS = [
  { name: 'Slack', color: '#611f69' },
  { name: 'HubSpot', color: '#ff7a59' },
  { name: 'Zapier', color: '#ff4a00' },
  { name: 'Google Analytics', color: '#e37400' },
  { name: 'Semrush', color: '#ff642d' },
  { name: 'Notion', color: '#000' },
];

/* ── Before / After data ──────────────────────────────────────────── */
const BEFORE = { mentions: '1 / 10', sentiment: '34', recommend: '8%' };
const AFTER  = { mentions: '7 / 10', sentiment: '81', recommend: '63%' };

const FAQ_EN = [
  {
    q: 'What does BitBrew actually do?',
    a: 'BitBrew fires structured prompts at foundation models — GPT-4o, Claude, Gemini, Perplexity, Mistral and more — then scores your brand across 5 dimensions: authority, sentiment, accuracy, mention rate, and recency. Result: one visibility score, model-by-model breakdown, and a ranked list of actionable improvements.',
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

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Urgency strip ─────────────────────────────────────────── */}
      <div className="w-full bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center justify-center gap-3 text-center">
        <TrendingUp className="w-3.5 h-3.5 text-primary shrink-0" />
        <p className="text-xs text-foreground/80">
          AI models are already shaping brand reputations. Is yours represented accurately?
        </p>
        <button
          onClick={() => document.getElementById('hero-input')?.scrollIntoView({ behavior: 'smooth' })}
          className="text-xs text-primary font-medium whitespace-nowrap hover:underline shrink-0"
        >
          Check now →
        </button>
      </div>

      {/* ── Hero + Why (shared animated background) ───────────────── */}
      <GradientMeshBg className="relative">
        <section className="hero pt-28 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-3 py-1 text-xs badge rounded-lg mb-6 font-data uppercase tracking-wider">
                AI Visibility Intelligence
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-foreground mb-6 leading-[1.1]">
                How does AI describe{' '}
                <span className="bg-gradient-to-r from-[#f5a623] via-[#ffe066] to-[#f5a623] bg-[length:200%] bg-clip-text text-transparent animate-shimmer">
                  your brand?
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                BitBrew analyzes how ChatGPT, Claude, Gemini and other AI models perceive your brand — and shows you what to improve.
              </p>
            </motion.div>

            <motion.div
              id="hero-input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-xl mx-auto"
            >
              <PromptInputBox
                isLoading={false}
                placeholder="e.g. Tesla, Apple, Nike…"
                onSend={(message) => {
                  if (message.trim()) {
                    navigate(`/dashboard?brand=${encodeURIComponent(message.trim())}`);
                  }
                }}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs text-muted-foreground/70 mt-3"
            >
              Free analysis. No credit card required.
            </motion.p>


            {/* ── How it works ────────────────────────────────────── */}
            <section className="mt-16 max-w-4xl mx-auto">
              <h3 className="text-center text-sm text-muted-foreground mb-6">How it works</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { title: 'Enter your brand', desc: 'Type a brand name or URL — any niche, any language.' },
                  { title: 'Models are queried', desc: 'GPT-4o, Claude, Gemini and more receive structured prompts in parallel.' },
                  { title: 'Get your score', desc: 'Receive a visibility score, per-model breakdown, and ranked action items.' },
                ].map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center p-4">
                    <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-3 text-2xl font-display shadow-lg shadow-primary/20">
                      {idx + 1}
                    </div>
                    <div className="font-medium text-foreground">{step.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{step.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-muted-foreground/50 mt-4"
            >
              See a demo
            </motion.p>

            {/* scroll hint */}
            <motion.button
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={() => document.getElementById('why-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-12 mx-auto flex flex-col items-center gap-1.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <span className="text-[10px] uppercase tracking-[0.25em]">Learn more</span>
              <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.button>
          </div>
        </section>

        {/* ── Features bento ──────────────────────────────────────── */}
        <section id="why-section" className="py-24 px-4 relative">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <span className="inline-block px-3 py-1 text-xs badge rounded-lg mb-4 font-data uppercase tracking-wider">
                Why it matters
              </span>
              <h2 className="text-3xl sm:text-4xl font-display text-foreground">
                Why it matters
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[minmax(160px,auto)]">
              {/* Large card — feature 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="md:col-span-7 glass-card-hover rounded-2xl border border-[hsl(var(--glass-border))] p-8 flex flex-col justify-between bg-card/60 backdrop-blur-sm shadow-lg shadow-primary/5"
              >
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-5">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Real-time AI analysis</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">We query multiple AI models simultaneously to see how they describe your brand.</p>
                </div>
                <div className="mt-6 flex gap-2">
                  {['GPT-4o', 'Claude', 'Gemini'].map((m) => (
                    <span key={m} className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">{m}</span>
                  ))}
                </div>
              </motion.div>

              {/* Small card — feature 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="md:col-span-5 glass-card-hover rounded-2xl border border-[hsl(var(--glass-border))] p-8 flex flex-col justify-between bg-card/60 backdrop-blur-sm shadow-lg shadow-primary/5"
              >
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-5">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Sentiment tracking</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Track how positive, negative or neutral AI models are about your brand over time.</p>
                </div>
                <div className="mt-6 flex items-end gap-1 h-10 opacity-60">
                  {[3, 5, 4, 7, 6, 8, 7, 9, 8, 10].map((v, i) => (
                    <div key={i} className="flex-1 rounded-sm bg-primary/50" style={{ height: `${v * 10}%` }} />
                  ))}
                </div>
              </motion.div>

              {/* Small card — feature 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="md:col-span-5 glass-card-hover rounded-2xl border border-[hsl(var(--glass-border))] p-8 flex flex-col justify-between bg-card/60 backdrop-blur-sm shadow-lg shadow-primary/5"
              >
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-5">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Competitor comparison</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">See how your brand stacks up against competitors in AI model responses.</p>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <div className="text-3xl font-display text-primary">94<span className="text-base text-muted-foreground">/100</span></div>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-primary/60 to-primary" />
                  </div>
                </div>
              </motion.div>

              {/* Large card — feature 4 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="md:col-span-7 glass-card-hover rounded-2xl border border-[hsl(var(--glass-border))] p-8 flex flex-col justify-between bg-card/60 backdrop-blur-sm shadow-lg shadow-primary/5"
              >
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-5">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Brand knowledge base</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">Feed AI models accurate information about your brand to improve their responses.</p>
                </div>
                <div className="mt-6 space-y-2">
                  {[['Your brand', 78], ['Competitor A', 52], ['Competitor B', 61]].map(([label, val]) => (
                    <div key={label as string} className="flex items-center gap-3 text-xs">
                      <span className="w-24 text-muted-foreground shrink-0">{label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary/70" style={{ width: `${val}%` }} />
                      </div>
                      <span className="text-muted-foreground w-6 text-right">{val}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </GradientMeshBg>

      {/* ── Before / After case study ─────────────────────────────── */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 text-xs badge rounded-lg mb-4 font-data uppercase tracking-wider">
              Case study
            </span>
            <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-3">
              Before and after BitBrew
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              See the difference brand optimization makes in AI model responses.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Before */}
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
                  Before
                </span>
                <span className="text-xs text-muted-foreground">— baseline BitBrew scan</span>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">AI mentions</div>
                  <div className="text-3xl font-display text-red-400">{BEFORE.mentions}</div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[10%] rounded-full bg-red-400/60" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Positive sentiment</div>
                  <div className="text-3xl font-display text-red-400">{BEFORE.sentiment}<span className="text-base text-muted-foreground">/100</span></div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[34%] rounded-full bg-red-400/60" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Recommendations</div>
                  <div className="text-3xl font-display text-red-400">{BEFORE.recommend}</div>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20">
                  After
                </span>
                <span className="text-xs text-muted-foreground">— 14 days of GEO fixes</span>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">AI mentions</div>
                  <div className="text-3xl font-display text-primary">{AFTER.mentions}</div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[70%] rounded-full bg-primary/70" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Positive sentiment</div>
                  <div className="text-3xl font-display text-primary">{AFTER.sentiment}<span className="text-base text-muted-foreground">/100</span></div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[81%] rounded-full bg-primary/70" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Recommendations</div>
                  <div className="text-3xl font-display text-primary">{AFTER.recommend}</div>
                </div>
              </div>
              {/* glow */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Who is it for ─────────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-[hsl(var(--glass-border))]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs badge rounded-lg mb-4 font-data uppercase tracking-wider">
              Who is it for?
            </span>
            <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-3">
              Who uses BitBrew?
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              From startups to large brands — if you care how AI describes your company, BitBrew gives you the full picture.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                emoji: '🚀',
                title: 'Startups & Founders',
                desc: 'Building your brand from scratch and want to know if AI mentions you at all — and what it says. Find out before your customers ask ChatGPT.',
                tags: ['Brand awareness', 'Early traction', 'Competitor gap'],
                color: 'from-violet-500/10 to-transparent',
                border: 'border-violet-500/20',
              },
              {
                emoji: '📊',
                title: 'Brand Managers',
                desc: 'Already tracking brand in traditional media? Time to add the AI channel. Report to leadership how the brand performs in language models.',
                tags: ['Sentiment tracking', 'Weekly digest', 'CSV export'],
                color: 'from-primary/10 to-transparent',
                border: 'border-primary/20',
                featured: true,
              },
              {
                emoji: '🏢',
                title: 'Marketing Agencies',
                desc: 'Offer clients a new service: AI visibility audit. Generate white-label reports and compare client brands against competitors.',
                tags: ['Multi-brand', 'API access', 'Competitor compare'],
                color: 'from-emerald-500/10 to-transparent',
                border: 'border-emerald-500/20',
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative glass-card p-7 flex flex-col gap-4 bg-gradient-to-b ${card.color} border ${card.border} ${card.featured ? 'ring-1 ring-primary/30' : ''}`}
              >
                {card.featured && (
                  <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                    Most popular
                  </span>
                )}
                <div className="text-3xl">{card.emoji}</div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {card.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted/60 text-muted-foreground border border-[hsl(var(--glass-border))]">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations ──────────────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-[hsl(var(--glass-border))]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-display text-foreground mb-1">Powered by leading AI models</h3>
            <p className="text-sm text-muted-foreground mb-8">We analyze your brand across the AI models your customers actually use.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {INTEGRATIONS.map((intg) => (
              <div
                key={intg.name}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[hsl(var(--glass-border))] bg-card/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: intg.color, opacity: 0.7 }}
                />
                {intg.name}
              </div>
            ))}
            <Link
              to="/developers"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-primary/30 text-sm text-primary/60 hover:text-primary hover:border-primary/60 transition-colors"
            >
              + more via API →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Comparison table ──────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-[hsl(var(--glass-border))]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs badge rounded-lg mb-4 font-data uppercase tracking-wider">
              Comparison
            </span>
            <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-3">
              BitBrew vs. other tools
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Traditional tools monitor social media and search engines. BitBrew monitors what AI says about your brand.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <div className="overflow-x-auto rounded-2xl border border-[hsl(var(--glass-border))]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--glass-border))]">
                    <th className="text-left px-6 py-4 text-muted-foreground font-medium text-xs uppercase tracking-wider w-[35%]">Feature</th>
                    <th className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs text-muted-foreground/50">SEMrush / Brandwatch</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center bg-primary/5 border-x border-primary/20">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-primary">BitBrew</span>
                        <span className="text-[10px] text-primary/60 font-normal">AI-native</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Social media mention monitoring',     others: true,  bb: false },
                    { feature: 'SEO / search engine ranking',         others: true,  bb: false },
                    { feature: 'Visibility in ChatGPT / GPT-4o',     others: false, bb: true  },
                    { feature: 'Visibility in Claude (Anthropic)',    others: false, bb: true  },
                    { feature: 'Visibility in Gemini (Google)',       others: false, bb: true  },
                    { feature: 'AI Visibility Score (0–100)',         others: false, bb: true  },
                    { feature: 'AI sentiment analysis',               others: false, bb: true  },
                    { feature: 'Competitor comparison in AI',         others: false, bb: true  },
                    { feature: 'GEO recommendations',                 others: false, bb: true  },
                    { feature: 'Starting price',                      others: '$99+/mo', bb: 'Free' },
                  ].map((row, i) => (
                    <tr key={i} className={`border-b border-[hsl(var(--glass-border))] last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                      <td className="px-6 py-3.5 text-sm text-foreground">{row.feature}</td>
                      <td className="px-6 py-3.5 text-center">
                        {typeof row.others === 'boolean' ? (
                          row.others
                            ? <span className="text-emerald-400 text-base">✓</span>
                            : <span className="text-muted-foreground/30 text-base">—</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">{row.others}</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-center bg-primary/5 border-x border-primary/20">
                        {typeof row.bb === 'boolean' ? (
                          row.bb
                            ? <span className="text-primary text-base font-bold">✓</span>
                            : <span className="text-muted-foreground/30 text-base">—</span>
                        ) : (
                          <span className="text-sm font-semibold text-primary">{row.bb}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-xs text-muted-foreground/40 mt-4">
              SEMrush and Brandwatch are great tools for traditional monitoring — BitBrew complements them with the AI channel.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Why subscribe ─────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 text-xs badge rounded-lg mb-4 font-data uppercase tracking-wider">
              Why monitoring?
            </span>
            <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-3">
              A one-time scan is a curiosity.<br />
              <span className="text-primary">Monitoring is an advantage.</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              AI models update their knowledge regularly. Your brand may be visible today, and tomorrow a competitor takes over. A subscription ensures you find out first.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: '📡',
                title: 'Monitoring over time',
                desc: 'Automatic scans every week. You will know when AI changes its mind about your brand — before your customer does.',
              },
              {
                icon: '⚔️',
                title: 'Competitor tracking',
                desc: 'Compare how ChatGPT, Claude and Gemini recommend you vs competitors. See exactly where you are losing ground.',
              },
              {
                icon: '🚨',
                title: 'Change alerts',
                desc: 'Instant notification when AI starts misrepresenting your brand or stops recommending you.',
              },
              {
                icon: '📋',
                title: 'Actionable recommendations',
                desc: 'Not just a score — you get a list of actions: what to change in your content so AI recommends you more often.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-6 flex flex-col gap-3"
              >
                <span className="text-2xl">{item.icon}</span>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA box ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 cta-box">
        <div className="max-w-2xl mx-auto text-center glass-card p-12">
          <h2 className="text-2xl font-display text-foreground mb-3">Run your first analysis</h2>
          <p className="text-muted-foreground text-sm mb-8">Start monitoring your AI brand presence today — free, no card required.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => document.getElementById('hero-input')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground/50 mt-4">No credit card required</p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8 pt-8 border-t border-[hsl(var(--glass-border))]">
            {[
              { icon: '🔒', label: 'SSL / TLS', sub: 'Encrypted connection' },
              { icon: '🇪🇺', label: 'GDPR Ready', sub: 'EU-compliant data' },
              { icon: '💳', label: 'Secure payments', sub: 'SSL-encrypted checkout' },
              { icon: '🔐', label: '2FA', sub: 'Account protection' },
            ].map(badge => (
              <div key={badge.label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[hsl(var(--glass-border))] bg-card/40">
                <span className="text-lg">{badge.icon}</span>
                <div className="text-left">
                  <p className="text-xs font-semibold text-foreground">{badge.label}</p>
                  <p className="text-[10px] text-muted-foreground">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────────────── */}
      <section id="contact" className="py-24 px-4 border-t border-[hsl(var(--glass-border))]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 text-xs badge rounded-lg mb-4 font-data uppercase tracking-wider">
              Contact
            </span>
            <h2 className="text-3xl sm:text-4xl font-display text-foreground">
              Get in touch
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <ContactForm />
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs badge rounded-lg mb-4 font-data uppercase tracking-wider">
              <HelpCircle className="w-3 h-3" /> FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-display text-foreground">
              Frequently asked questions
            </h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-lg mx-auto">
              Everything you need to know before your first brew.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-[hsl(var(--glass-border))] bg-card/40 backdrop-blur-xl divide-y divide-[hsl(var(--glass-border))] overflow-hidden"
          >
            <Accordion type="single" collapsible className="w-full">
              {FAQ_EN.map((item, idx) => (
                <AccordionItem
                  key={idx}
                  value={`q${idx + 1}`}
                  className="border-0 border-b border-[hsl(var(--glass-border))] last:border-b-0 px-6"
                >
                  <AccordionTrigger className="text-left text-sm sm:text-base font-medium text-foreground hover:no-underline py-5 [&>svg]:text-primary">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5 pr-6">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-foreground font-medium">Still have questions?</p>
            </div>
            <a
              href="mailto:kontakt@bitbrew.pl"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Contact us
              <Mail className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────────────────────── */}
      <section className="py-8 px-4">
        <div className="max-w-xl mx-auto">
          <NewsletterSignup
            onSubmit={async (email) => {
              await fetch('/.netlify/functions/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
              });
            }}
          />
        </div>
      </section>

      <Footer />

      <CookiePanel privacyHref="/polityka-prywatnosci" termsHref="/regulamin" />
    </div>
  );
};

export default Landing;
