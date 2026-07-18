import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Eye, BarChart3, Shield, ChevronDown, HelpCircle, Mail, TrendingUp, ArrowRight, Bot, Globe, Repeat, Star, Quote, ShieldCheck, Clock, Search, PenLine, Share2, Sparkles, Check, Layers, MessageSquare, X } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BrandScanInput } from '@/components/BrandScanInput';
import { ScanResultPreview } from '@/components/ScanResultPreview';
import { CookiePanel } from '@/components/ui/cookie-banner-1';
import { NewsletterSignup } from '@/components/ui/newsletter-signup';
import { GradientMeshBg } from '@/components/ui/gradient-mesh-bg';
import { ContactForm } from '@/components/ui/contact-form';
import { Marquee } from '@/components/ui/marquee';
import { FAQ_EN } from '@/lib/faq';

/* ── Languages we analyze in (native names) ───────────────────────── */
const LANGUAGES_A = [
  'English', 'Polski', 'Deutsch', 'Français', 'Español', 'Italiano', 'Português',
  'Nederlands', 'Svenska', 'Norsk', 'Suomi', 'Dansk', 'Čeština', 'Română', 'Magyar',
];
const LANGUAGES_B = [
  '中文', '日本語', '한국어', 'Русский', 'Українська', 'العربية', 'עברית', 'हिन्दी',
  'Türkçe', 'Ελληνικά', 'Tiếng Việt', 'ไทย', 'Bahasa Indonesia', 'Slovenčina', 'Hrvatski',
];

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

/* ── Testimonials ─────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote: 'We discovered ChatGPT was recommending our competitor for our own category. Two weeks after acting on Perceply’s recommendations, we were the top answer.',
    name: 'Sarah Lindqvist',
    role: 'Head of Growth, Northwind SaaS',
    initials: 'SL',
  },
  {
    quote: 'Finally a number I can put in front of the board. Our AI visibility score went from 41 to 78 in a quarter — and I can prove exactly what moved it.',
    name: 'Marcus Bishop',
    role: 'CMO, Vellum Commerce',
    initials: 'MB',
  },
  {
    quote: 'We run AI audits for 12 client brands from one dashboard. The white-label reports alone paid for the whole subscription in the first month.',
    name: 'Priya Nandakumar',
    role: 'Founder, Halo Digital Agency',
    initials: 'PN',
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs badge rounded-lg mb-6 font-data uppercase tracking-wider">
                <Search className="w-3 h-3" /> For brands that want to be found
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-foreground mb-6 leading-[1.1]">
                Be the brand{' '}
                <span className="bg-gradient-to-r from-[#f5a623] via-[#ffe066] to-[#f5a623] bg-[length:200%] bg-clip-text text-transparent animate-shimmer">
                  AI recommends
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                When your customers ask ChatGPT, Claude or Gemini for a recommendation, does your brand come up? Perceply shows how AI tells your story — and gives you a plain-English plan of exactly what to publish to get recommended.
              </p>
            </motion.div>

            <motion.div
              id="hero-input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-xl mx-auto"
            >
              <BrandScanInput
                placeholder="e.g. Tesla, Apple, Nike…"
                suggestions={['Tesla', 'Apple', 'Nike']}
                onSubmit={(brand) => navigate(`/brand-visibility?brand=${encodeURIComponent(brand)}`)}
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

            {/* ── Social proof bar ────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-4"
            >
              {/* Avatar stack */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {['#f5a623', '#7c3aed', '#059669', '#0ea5e9', '#e11d48'].map((c, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-semibold text-white shadow-sm"
                      style={{ backgroundColor: c }}
                    >
                      {['NW', 'VC', 'HD', 'AX', 'Qb'][i]}
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-foreground leading-tight">2,400+ brands</div>
                  <div className="text-[11px] text-muted-foreground leading-tight">analyzed this month</div>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-9 bg-[hsl(var(--glass-border))]" />

              {/* Rating */}
              <div className="flex items-center gap-2.5">
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-foreground leading-tight">4.9 / 5 rating</div>
                  <div className="text-[11px] text-muted-foreground leading-tight">from 180+ marketing teams</div>
                </div>
              </div>
            </motion.div>


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

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => document.getElementById('sample-report')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-xs text-muted-foreground/70 hover:text-primary transition-colors mt-4 underline underline-offset-4 decoration-dotted"
            >
              See what results you get →
            </motion.button>

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

        {/* ── Manifest: dlaczego to robimy ──────────────────────────── */}
        <section id="manifest" className="py-24 px-4 scroll-mt-24">
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
              <span className="inline-block px-3 py-1 text-xs badge rounded-lg mb-5 font-data uppercase tracking-wider">
                Manifesto — why we do this
              </span>
              <h2 className="text-3xl sm:text-4xl font-display text-foreground leading-[1.15] mb-6">
                AI answers the way it was taught to see the world.{' '}
                <span className="text-primary">And that world is uneven.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Big, English-language brands have years of content, thousands of mentions, and a place in every model's training data. Smaller brands — especially outside the US and UK — often have no voice at all in AI answers. Even when they're the best choice for the customer.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-7">
                <h3 className="text-lg font-semibold text-foreground mb-3">The problem</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  When someone asks AI for a product or service recommendation, the model answers with what it “knows” best — and it knows best whatever there was most of in its training data. Usually: big brands, lots of English content, lots of links from Western media.
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  It's not a conspiracy or malice. It's statistics. But the result is the same: a recommendation you never got, because the model didn't know you existed.
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass-card p-7">
                <h3 className="text-lg font-semibold text-foreground mb-3">What's changing</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Search showed ten links and let the customer choose. AI gives one answer and moves on.
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  When ten results collapse into one recommendation, “being on page two” stops existing. You're in the answer, or you're nowhere.
                </p>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
              <h3 className="text-xs font-data uppercase tracking-wider text-muted-foreground mb-5">What we believe</h3>
              <div className="space-y-3">
                {[
                  ['AI visibility isn\'t SEO 2.0.', 'It\'s a different game, with different rules — and tools built for the old model won\'t measure it.'],
                  ['You can\'t improve what you can\'t see.', 'Before anyone sells you “AI optimization”, you need to know how you look today — raw, without a pretty chart on top.'],
                  ['Data without proof is marketing, not measurement.', 'That\'s why every number here can be broken down to the raw model response.'],
                  ['A smaller brand isn\'t a worse brand.', 'It\'s a brand the model doesn\'t know yet. Those two get confused constantly — and that\'s the problem that brought us here.'],
                  ['We say it straight, even when it\'s uncomfortable.', 'If your brand is invisible, we\'ll say so on the first screen, not in a footnote.'],
                ].map(([lead, rest]) => (
                  <div key={lead} className="rounded-xl border-l-2 border-primary/50 bg-card/40 pl-4 pr-4 py-3">
                    <p className="text-sm leading-relaxed">
                      <span className="font-semibold text-foreground">{lead}</span>{' '}
                      <span className="text-muted-foreground">{rest}</span>
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl border border-[hsl(var(--glass-border))] bg-card/40 p-7 mb-10">
              <h3 className="text-xs font-data uppercase tracking-wider text-muted-foreground mb-3">Who's behind this</h3>
              <p className="text-base text-foreground/90 leading-relaxed">
                Perceply isn't built inside a corporation with a Series A round. It's built solo, after hours, with decisions made in the open. We show our methodology because we'd want to see it ourselves before paying for anything.
              </p>
            </motion.div>

            <div className="text-center">
              <button
                onClick={() => document.getElementById('hero-input')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                See how AI sees your brand
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ── Metodologia: jak to liczymy ───────────────────────────── */}
        <section id="methodology" className="py-24 px-4 scroll-mt-24 border-t border-[hsl(var(--glass-border))]">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <span className="inline-block px-3 py-1 text-xs badge rounded-lg mb-4 font-data uppercase tracking-wider">
                Methodology — how we measure it
              </span>
              <h2 className="text-3xl sm:text-4xl font-display text-foreground leading-[1.15] mb-4 max-w-3xl mx-auto">
                No black box. You see every query, every answer, every number.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Other tools show you a score. We show you the proof. Every metric in Perceply traces straight back to the queries that produced it — check for yourself instead of taking our word for it.
              </p>
            </motion.div>

            {/* Blok 1 — 3 kroki */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {[
                { title: 'We build queries like a real user', desc: 'We don\'t ask AI “what do you think of brand X”. We recreate the natural questions your customer asks when looking for a solution in your category — from your angle and your competitors\'.' },
                { title: 'We ask them in ChatGPT, Claude and Gemini', desc: 'The same queries, repeatedly, at regular intervals — to capture the real picture, not a random one-shot result.' },
                { title: 'We show you the raw answers, not just a number', desc: 'Every metric in the dashboard expands so you can see exactly what the model answered and why your brand showed up in it — or didn\'t.' },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6 flex flex-col gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-display shadow-lg shadow-primary/20 shrink-0">
                    {i + 1}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground leading-snug">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Blok 2 + Blok 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-7">
                <h3 className="text-lg font-semibold text-foreground mb-4">What you actually see</h3>
                <ul className="space-y-2.5">
                  {[
                    'The full text of every test query',
                    'The raw model answer, without our interpretation',
                    'Where your brand appears in the answer, and the context it appears in',
                    'The difference between a mention and a cited source',
                    'The history of changes over time — not just a single-day snapshot',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/90">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass-card p-7">
                <h3 className="text-lg font-semibold text-foreground mb-4">What we don't do</h3>
                <ul className="space-y-3.5">
                  {[
                    ['We don\'t guess.', 'If the model didn\'t name your brand, we say so plainly instead of hunting for a “partial match”.'],
                    ['We don\'t average into one magic number.', 'Visibility in ChatGPT and in Gemini are two different things, and we show them separately.'],
                    ['We don\'t promise AI ranking.', 'No one can do that honestly today. We measure the state and show the changes — the decisions are yours.'],
                  ].map(([lead, rest]) => (
                    <li key={lead} className="flex items-start gap-2.5 text-sm">
                      <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span><span className="font-semibold text-foreground">{lead}</span>{' '}<span className="text-muted-foreground">{rest}</span></span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Blok 4 — dlaczego to ważne */}
            <motion.blockquote
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-l-2 border-primary pl-5 py-1 mb-10 max-w-2xl mx-auto"
            >
              <p className="text-lg text-foreground/90 leading-relaxed italic">
                A visibility score without proof is just a number you have to trust. We'd rather you didn't have to — see the source of every metric with your own eyes.
              </p>
            </motion.blockquote>

            <div className="text-center">
              <button
                onClick={() => document.getElementById('sample-report')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                See a sample report
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ── Sample report: what you get after a scan ──────────────── */}
        <section id="sample-report" className="py-20 px-4 scroll-mt-24">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <span className="inline-block px-3 py-1 text-xs badge rounded-lg mb-4 font-data uppercase tracking-wider">
                What you get
              </span>
              <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-3">
                Your report, seconds after scanning
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                One visibility score, a breakdown across five signals, how each AI model talks about you, and the single highest-impact action to take next.
              </p>
            </motion.div>

            <ScanResultPreview />
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
              Before and after Perceply
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
                <span className="text-xs text-muted-foreground">— baseline Perceply scan</span>
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

      {/* ── Action, not just a report ─────────────────────────────── */}
      <section className="py-24 px-4 border-t border-[hsl(var(--glass-border))]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs badge rounded-lg mb-4 font-data uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Action, not just a report
            </span>
            <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-3">
              Most tools tell you you're invisible.<br />
              <span className="text-primary">We tell you what to publish.</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Every scan ends with a prioritized, plain-English action plan — the exact content, pages and mentions that move AI models to recommend you. No dashboards to decode.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left: the problem framed simply */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 flex flex-col justify-center gap-5"
            >
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="w-4 h-4 text-primary" />
                A customer asks AI:
              </div>
              <p className="text-xl font-display text-foreground leading-snug">
                “What are the best {' '}
                <span className="text-primary">project management tools</span>{' '}
                for small teams?”
              </p>
              <div className="rounded-xl border border-[hsl(var(--glass-border))] bg-muted/20 p-4 text-sm text-muted-foreground leading-relaxed">
                AI names 5 competitors. Your brand isn't one of them.
                <span className="block mt-2 text-foreground/80">Perceply finds out <span className="text-primary font-medium">why</span> — and hands you the fix.</span>
              </div>
            </motion.div>

            {/* Right: the auto-generated action plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8 flex flex-col gap-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-data uppercase tracking-wider text-muted-foreground">Your action plan</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/15 text-primary border border-primary/20">Auto-generated</span>
              </div>
              {[
                { icon: PenLine, impact: 'High impact', title: 'Publish a comparison page', desc: 'Create a “vs. alternatives” page — AI models cite these when recommending tools.' },
                { icon: Globe, impact: 'High impact', title: 'Get listed in 3 category roundups', desc: 'You’re missing from the “best-of” articles AI reads. We name which ones.' },
                { icon: MessageSquare, impact: 'Medium', title: 'Seed 2 review mentions', desc: 'Reddit & G2 threads shape how AI describes your reliability.' },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-[hsl(var(--glass-border))] bg-card/40 p-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <a.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-foreground">{a.title}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide bg-primary/10 text-primary/80 shrink-0">{a.impact}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
                  </div>
                </div>
              ))}
              <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Hybrid: AI + SEO + earned media ───────────────────────── */}
      <section className="py-24 px-4 border-t border-[hsl(var(--glass-border))]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs badge rounded-lg mb-4 font-data uppercase tracking-wider">
              <Layers className="w-3 h-3" /> One channel, three levers
            </span>
            <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-3">
              AI visibility isn't a silo
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              The same signals that win you Google rankings and earned media are what teach AI to recommend you. Perceply connects all three — so one plan moves everything.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Bot,
                title: 'AI visibility',
                desc: 'How ChatGPT, Claude & Gemini describe, rank and recommend your brand in real answers.',
                tags: ['Mention rate', 'Sentiment', 'Recommendations'],
              },
              {
                icon: Search,
                title: 'Classic SEO',
                desc: 'The pages and structured content AI crawls to form its opinion — the same content that ranks on Google.',
                tags: ['Comparison pages', 'Category terms', 'Schema'],
              },
              {
                icon: Share2,
                title: 'Social & earned media',
                desc: 'Reviews, roundups and community threads that shape how AI talks about your reputation.',
                tags: ['Reddit & G2', 'Roundups', 'PR mentions'],
              },
            ].map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-7 flex flex-col gap-4"
              >
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                  {p.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted/60 text-muted-foreground border border-[hsl(var(--glass-border))]">
                      <Check className="w-3 h-3 text-primary" /> {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
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
              Who uses Perceply?
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Built for the people who own the brand story — not just SEO specialists. If you care how AI describes your reputation and recommends your products, this is for you.
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

      {/* ── Languages marquee ─────────────────────────────────────── */}
      <section className="py-16 border-t border-[hsl(var(--glass-border))] overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs badge rounded-lg mb-4 font-data uppercase tracking-wider">
              <Globe className="w-3 h-3" /> Any language
            </span>
            <h3 className="text-2xl sm:text-3xl font-display text-foreground mb-2">
              We analyze your brand in your customers' language
            </h3>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              AI answers people in the language they ask in. Perceply scans your visibility across 30+ languages — not just English.
            </p>
          </motion.div>
        </div>

        <div className="space-y-3">
          <Marquee items={LANGUAGES_A} duration={45} />
          <Marquee items={LANGUAGES_B} duration={50} reverse />
        </div>
      </section>

      {/* ── Global standards strip ────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-[hsl(var(--glass-border))]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Globe,
                title: 'GEO-first approach',
                desc: 'Built around Generative Engine Optimization — the emerging standard for AI-era brand visibility.',
              },
              {
                icon: Bot,
                title: '3 leading AI models',
                desc: 'Coverage across ChatGPT, Claude and Gemini — the assistants your customers ask for recommendations.',
              },
              {
                icon: Repeat,
                title: 'Track over time',
                desc: 'Repeatable monthly audits show whether your optimization work actually moves the needle.',
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
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
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
              Perceply vs. other tools
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Traditional tools monitor social media and search engines. Perceply monitors what AI says about your brand.
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
                        <span className="font-bold text-primary">Perceply</span>
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
              SEMrush and Brandwatch are great tools for traditional monitoring — Perceply complements them with the AI channel.
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

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-[hsl(var(--glass-border))]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-3 py-1 text-xs badge rounded-lg mb-4 font-data uppercase tracking-wider">
              Loved by marketers
            </span>
            <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-3">
              Teams that stopped guessing
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Growth leads, brand managers and agencies use Perceply to win the AI recommendation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-7 flex flex-col gap-5"
              >
                <Quote className="w-7 h-7 text-primary/40" />
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed flex-1">“{t.quote}”</p>
                <div className="flex items-center gap-3 pt-2 border-t border-[hsl(var(--glass-border))]">
                  <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">{t.name}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{t.role}</p>
                  </div>
                </div>
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

          {/* Risk-reversal guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-xs text-muted-foreground">
            {[
              { icon: ShieldCheck, label: '14-day money-back guarantee' },
              { icon: Clock, label: 'Cancel anytime, one click' },
              { icon: Zap, label: 'Results in under 15 seconds' },
            ].map((g) => (
              <span key={g.label} className="inline-flex items-center gap-1.5">
                <g.icon className="w-3.5 h-3.5 text-primary" />
                {g.label}
              </span>
            ))}
          </div>

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
              href="mailto:kontakt@perceply.pl"
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
