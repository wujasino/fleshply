import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Zap, Eye, BarChart3, Shield, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useTranslation } from '@/lib/locale';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { CookiePanel } from '@/components/ui/cookie-banner-1';

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
      <section className="hero pt-32 pb-20 px-4">
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
      </section>



      {/* Features */}
      <section className="py-20 px-4 bg-[#0e0e0e]">
        <div className="max-w-6xl mx-auto glass-card p-8 rounded-[2rem] border-[hsl(var(--glass-border))]">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-display text-center text-foreground mb-12"
          >
            {t('whyTitle')}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-hover card p-6 border border-[hsl(var(--glass-border))] shadow-lg shadow-primary/10"
              >
                <feature.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-base font-medium text-foreground mb-2">{t(`feature_${i + 1}_title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(`feature_${i + 1}_desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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

      {/* Newsletter banner (moved under CTA) */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Newsletter</p>
            <h3 className="text-lg font-display text-foreground mt-1">Bądź na bieżąco — subskrybuj nasz newsletter</h3>
            <p className="text-sm text-muted-foreground mt-1">Otrzymuj nowości, promocje i cotygodniowe podsumowania.</p>
          </div>
          <div>
            <Button
              id="landing-newsletter-btn"
              onClick={() => {
                const was = localStorage.getItem('newsletterSubscribed') === 'true';
                if (!was) {
                  localStorage.setItem('newsletterSubscribed', 'true');
                  toast.success('Zapisano do newslettera.');
                } else {
                  toast('Już zapisano.');
                }
              }}
            >
              Zapisz się
            </Button>
          </div>
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
