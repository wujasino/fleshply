import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Eye, BarChart3, Shield, ChevronDown, HelpCircle, Mail, TrendingUp, ArrowRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Navbar } from '@/components/layout/Navbar';
import { useTranslation } from '@/lib/locale';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { CookiePanel } from '@/components/ui/cookie-banner-1';
import { NewsletterSignup } from '@/components/ui/newsletter-signup';
import { FloatingPathsBackground } from '@/components/ui/floating-paths';

/* ── Integration logos (text-based, gray) ─────────────────────────── */
const INTEGRATIONS = [
  { name: 'Slack', color: '#611f69' },
  { name: 'HubSpot', color: '#ff7a59' },
  { name: 'Zapier', color: '#ff4a00' },
  { name: 'Google Analytics', color: '#e37400' },
  { name: 'Semrush', color: '#ff642d' },
  { name: 'Notion', color: '#000' },
];

/* ── Social proof company names ───────────────────────────────────── */
const SOCIAL_PROOF_NAMES = ['Shopify Plus', 'Brainly', 'Booksy', 'inPost', 'Tidio', 'Packhelp'];

/* ── Before / After data ──────────────────────────────────────────── */
const BEFORE = { mentions: '1 / 10', sentiment: '34', recommend: '8%' };
const AFTER  = { mentions: '7 / 10', sentiment: '81', recommend: '63%' };

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Urgency strip ─────────────────────────────────────────── */}
      <div className="w-full bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center justify-center gap-3 text-center">
        <TrendingUp className="w-3.5 h-3.5 text-primary shrink-0" />
        <p className="text-xs text-foreground/80">
          {t('urgency_bar')}
        </p>
        <button
          onClick={() => document.getElementById('hero-input')?.scrollIntoView({ behavior: 'smooth' })}
          className="text-xs text-primary font-medium whitespace-nowrap hover:underline shrink-0"
        >
          {t('urgency_cta')}
        </button>
      </div>

      {/* ── Hero + Why (shared animated background) ───────────────── */}
      <FloatingPathsBackground position={1} className="relative">
        <section className="hero pt-28 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-3 py-1 text-xs badge rounded-lg mb-6 font-data uppercase tracking-wider">
                {t('hero_tag')}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-foreground mb-6 leading-[1.1]">
                {t('hero_heading_prefix')}
                <span className="bg-gradient-to-r from-[#f5a623] via-[#ffe066] to-[#f5a623] bg-[length:200%] bg-clip-text text-transparent animate-shimmer">
                  {t('hero_heading_highlight')}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                {t('hero_paragraph')}
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
                placeholder={t('placeholderExample')}
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
              {t('hero_no_card')}
            </motion.p>

            {/* ── Social proof strip ──────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-10 flex flex-col items-center gap-3"
            >
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground/50">
                {t('social_proof_label')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {SOCIAL_PROOF_NAMES.map((name) => (
                  <span key={name} className="text-sm font-medium text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors select-none">
                    {name}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* ── How it works ────────────────────────────────────── */}
            <section className="mt-16 max-w-4xl mx-auto">
              <h3 className="text-center text-sm text-muted-foreground mb-6">{t('howTitle')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex flex-col items-center text-center p-4">
                    <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-3 text-2xl font-display shadow-lg shadow-primary/20">
                      {n}
                    </div>
                    <div className="font-medium text-foreground">{t(`how_step${n}_title`)}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t(`how_step${n}_desc`)}</div>
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
              {t('tryDemo')}
            </motion.p>

            {/* scroll hint */}
            <motion.button
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={() => document.getElementById('why-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-12 mx-auto flex flex-col items-center gap-1.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <span className="text-[10px] uppercase tracking-[0.25em]">{t('whyTitle')}</span>
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
                {t('whyTitle')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-display text-foreground">
                {t('whyTitle')}
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
                  <h3 className="text-xl font-semibold text-foreground mb-3">{t('feature_1_title')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">{t('feature_1_desc')}</p>
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
                  <h3 className="text-xl font-semibold text-foreground mb-3">{t('feature_2_title')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t('feature_2_desc')}</p>
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
                  <h3 className="text-xl font-semibold text-foreground mb-3">{t('feature_3_title')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t('feature_3_desc')}</p>
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
                  <h3 className="text-xl font-semibold text-foreground mb-3">{t('feature_4_title')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">{t('feature_4_desc')}</p>
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
      </FloatingPathsBackground>

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
              {t('before_after_title')}
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              {t('before_after_subtitle')}
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
                  {t('before_label')}
                </span>
                <span className="text-xs text-muted-foreground">— baseline BitBrew scan</span>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">{t('before_stat_mentions')}</div>
                  <div className="text-3xl font-display text-red-400">{BEFORE.mentions}</div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[10%] rounded-full bg-red-400/60" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">{t('before_stat_sentiment')}</div>
                  <div className="text-3xl font-display text-red-400">{BEFORE.sentiment}<span className="text-base text-muted-foreground">/100</span></div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[34%] rounded-full bg-red-400/60" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">{t('before_stat_recommend')}</div>
                  <div className="text-3xl font-display text-red-400">{BEFORE.recommend}</div>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/20">
                  {t('after_label')}
                </span>
                <span className="text-xs text-muted-foreground">— 14 days of GEO fixes</span>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">{t('before_stat_mentions')}</div>
                  <div className="text-3xl font-display text-primary">{AFTER.mentions}</div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[70%] rounded-full bg-primary/70" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">{t('before_stat_sentiment')}</div>
                  <div className="text-3xl font-display text-primary">{AFTER.sentiment}<span className="text-base text-muted-foreground">/100</span></div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[81%] rounded-full bg-primary/70" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">{t('before_stat_recommend')}</div>
                  <div className="text-3xl font-display text-primary">{AFTER.recommend}</div>
                </div>
              </div>
              {/* glow */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
            </div>
          </motion.div>
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
            <h3 className="text-lg font-display text-foreground mb-1">{t('integrations_title')}</h3>
            <p className="text-sm text-muted-foreground mb-8">{t('integrations_subtitle')}</p>
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
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[hsl(var(--glass-border))] text-sm text-muted-foreground/50">
              + more via API
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA box ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 cta-box">
        <div className="max-w-2xl mx-auto text-center glass-card p-12">
          <h2 className="text-2xl font-display text-foreground mb-3">{t('startFirstBrew')}</h2>
          <p className="text-muted-foreground text-sm mb-8">{t('final_cta_subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => document.getElementById('hero-input')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t('final_cta_button')}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="btn-secondary px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t('viewPricing')}
            </button>
          </div>
          <p className="text-xs text-muted-foreground/50 mt-4">{t('noCard')}</p>
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
              {t('faq_title')}
            </h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-lg mx-auto">
              {t('faq_subtitle')}
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
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <AccordionItem
                  key={n}
                  value={`q${n}`}
                  className="border-0 border-b border-[hsl(var(--glass-border))] last:border-b-0 px-6"
                >
                  <AccordionTrigger className="text-left text-sm sm:text-base font-medium text-foreground hover:no-underline py-5 [&>svg]:text-primary">
                    {t(`faq_q${n}`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5 pr-6">
                    {t(`faq_a${n}`)}
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
              <p className="text-sm text-foreground font-medium">{t('faq_more_help')}</p>
            </div>
            <a
              href="mailto:kontakt@bitbrew.pl"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              {t('faq_contact')}
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

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-[hsl(var(--glass-border))] py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">{t('copyright')}</p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="/polityka-prywatnosci" className="hover:text-foreground transition-colors">{t('privacy')}</a>
            <a href="/regulamin" className="hover:text-foreground transition-colors">{t('terms')}</a>
            <a href="/regulamin-newslettera" className="hover:text-foreground transition-colors">{t('newsletter')}</a>
          </div>
        </div>
      </footer>

      <CookiePanel privacyHref="/polityka-prywatnosci" termsHref="/regulamin" />
    </div>
  );
};

export default Landing;
