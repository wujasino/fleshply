import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Zap, Eye, BarChart3, Shield, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { useTranslation } from '@/lib/locale';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { CookiePanel } from '@/components/ui/cookie-banner-1';
import { NewsletterSignup } from '@/components/ui/newsletter-signup';
import { FloatingPathsBackground } from '@/components/ui/floating-paths';

const features = [
  {
    icon: Eye,
    title: 'AI Visibility Audit',
    description: 'See exactly how GPT-4, Claude, and Gemini describe your brand to millions of users.',
  },
  {
    icon: BarChart3,
    title: 'Sentiment Tracking',
    description: 'Monitor how AI perception of your brand shifts over time across all major models.',
  },
  {
    icon: Shield,
    title: 'Source Fidelity',
    description: 'Verify the accuracy of AI-generated claims about your brand with confidence scores.',
  },
  {
    icon: Zap,
    title: 'Competitive Intelligence',
    description: 'Compare your AI visibility against competitors across every foundation model.',
  },
];

const Landing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard?brand=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <FloatingPathsBackground position={1} className="hero pt-32 pb-20 px-4">
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl mx-auto"
          >
            <PromptInputBox
              isLoading={false}
              placeholder={t('placeholderExample')}
              onSend={(message, files) => {
                if (message.trim()) {
                  navigate(`/dashboard?brand=${encodeURIComponent(message.trim())}`);
                }
              }}
            />
          </motion.div>

          <div className="max-w-xl mx-auto mt-4 flex items-center justify-center">
            <div className="text-xs text-muted-foreground/80">
              Pierwsze 3 analizy za darmo — bez karty kredytowej
            </div>
          </div>

          {/* How it works */}
          <section className="mt-12 max-w-4xl mx-auto">
            <h3 className="text-center text-sm text-muted-foreground mb-6">{t('howTitle')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-3 text-2xl font-display shadow-lg shadow-primary/20">
                  1
                </div>
                <div className="font-medium text-foreground">{t('how_step1_title')}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('how_step1_desc')}</div>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-3 text-2xl font-display shadow-lg shadow-primary/20">
                  2
                </div>
                <div className="font-medium text-foreground">{t('how_step2_title')}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('how_step2_desc')}</div>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-3 text-2xl font-display shadow-lg shadow-primary/20">
                  3
                </div>
                <div className="font-medium text-foreground">{t('how_step3_title')}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('how_step3_desc')}</div>
              </div>
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
        </div>
      </FloatingPathsBackground>

      {/* Features */}
      <FloatingPathsBackground position={0.5} className="py-24 px-4 bg-background">
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

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[minmax(160px,auto)]">
            {/* Large card — col 1-7 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
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
                  <span key={m} className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {m}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Small card — col 8-12 */}
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
              {/* Mini sparkline decoration */}
              <div className="mt-6 flex items-end gap-1 h-10 opacity-60">
                {[3, 5, 4, 7, 6, 8, 7, 9, 8, 10].map((v, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-primary/50"
                    style={{ height: `${v * 10}%` }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Small card — col 1-5 */}
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
              {/* Score decoration */}
              <div className="mt-6 flex items-center gap-3">
                <div className="text-3xl font-display text-primary">94<span className="text-base text-muted-foreground">/100</span></div>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-primary/60 to-primary" />
                </div>
              </div>
            </motion.div>

            {/* Large card — col 6-12 */}
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
              {/* Competitor bars decoration */}
              <div className="mt-6 space-y-2">
                {[['Twoja marka', 78], ['Konkurent A', 52], ['Konkurent B', 61]].map(([label, val]) => (
                  <div key={label as string} className="flex items-center gap-3 text-xs">
                    <span className="w-24 text-muted-foreground shrink-0">{label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${val}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground w-6 text-right">{val}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </FloatingPathsBackground>

      {/* CTA */}
      <section className="py-20 px-4 cta-box">
        <div className="max-w-2xl mx-auto text-center glass-card p-12">
          <h2 className="text-2xl font-display text-foreground mb-3">{t('startFirstBrew')}</h2>
          <p className="text-muted-foreground text-sm mb-6">{t('noCard')}</p>
          <button
            onClick={() => navigate('/pricing')}
            className="btn-secondary px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t('viewPricing')}
          </button>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-8 px-4">
        <div className="max-w-xl mx-auto">
          <NewsletterSignup
            onSubmit={async (email) => {
              await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
              });
            }}
          />
        </div>
      </section>

      {/* Footer */}
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
      <CookiePanel
        privacyHref="/polityka-prywatnosci"
        termsHref="/regulamin"
      />
    </div>
  );
};

export default Landing;
