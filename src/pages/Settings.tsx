import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Bell, Shield, Trash2, Moon, Globe, ChevronRight, Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '@/lib/locale';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Tab = 'account' | 'appearance' | 'notifications' | 'privacy' | 'danger';

const tabs: { id: Tab; labelKey: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'account',       labelKey: 'settings_tab_account',       icon: User },
  { id: 'appearance',    labelKey: 'settings_tab_appearance',    icon: Moon },
  { id: 'notifications', labelKey: 'settings_tab_notifications', icon: Bell },
  { id: 'privacy',       labelKey: 'settings_tab_privacy',       icon: Shield },
  { id: 'danger',        labelKey: 'settings_tab_danger',        icon: Trash2 },
];

export default function Settings() {
  const navigate = useNavigate();
  const { t, locale, setLocale } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [notifBrewComplete, setNotifBrewComplete] = useState(true);
  const [notifNewsletter, setNotifNewsletter] = useState(false);
  const [notifMarketing, setNotifMarketing] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate('/login'); return; }
      setEmail(user.email ?? '');
      setDisplayName(user.user_metadata?.full_name ?? '');
      setAvatarUrl(user.user_metadata?.avatar_url ?? null);
    });
  }, [navigate]);

  const initials = email ? email[0].toUpperCase() : '?';

  const handleSave = async () => {
    setSaving(true);
    await supabase.auth.updateUser({ data: { full_name: displayName } });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteAccount = async () => {
    if (!confirm(t('settings_delete_confirm'))) return;
    await supabase.auth.signOut();
    navigate('/');
  };

  const close = () => navigate(-1);

  return (
    <AnimatePresence>
      <motion.div
        key="settings-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={close}
        />

        {/* Panel */}
        <motion.div
          className="relative z-10 w-full max-w-3xl max-h-[85vh] flex overflow-hidden rounded-2xl border border-[hsl(var(--glass-border))] bg-background/95 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* Sidebar */}
          <aside className="w-52 shrink-0 border-r border-[hsl(var(--glass-border))] bg-muted/30 flex flex-col p-3 gap-0.5">
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {t('settings')}
            </p>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {t(tab.labelKey)}
                {activeTab === tab.id && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            ))}
          </aside>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--glass-border))]">
              <h2 className="text-base font-semibold text-foreground">
                {t(tabs.find(t => t.id === activeTab)?.labelKey ?? 'settings')}
              </h2>
              <button
                onClick={close}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* ── ACCOUNT ── */}
              {activeTab === 'account' && (
                <>
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={avatarUrl ?? undefined} />
                      <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t('settings_avatar_hint')}</p>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">
                        {t('settings_display_name')}
                      </label>
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={t('settings_display_name_placeholder')}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground block mb-1.5">
                        {t('email')}
                      </label>
                      <Input value={email} disabled className="opacity-60" />
                      <p className="text-xs text-muted-foreground mt-1">{t('settings_email_hint')}</p>
                    </div>
                  </div>

                  <Button onClick={handleSave} disabled={saving} size="sm">
                    {saved ? '✓ Zapisano' : saving ? t('settings_saving') : (
                      <><Save className="w-3.5 h-3.5 mr-1.5" />{t('settings_save')}</>
                    )}
                  </Button>
                </>
              )}

              {/* ── APPEARANCE ── */}
              {activeTab === 'appearance' && (
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-3">
                      <Globe className="inline w-4 h-4 mr-1.5 text-primary" />
                      {t('settings_language')}
                    </label>
                    <div className="flex gap-2">
                      {(['pl', 'en'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setLocale(lang)}
                          className={cn(
                            'px-4 py-2 rounded-lg text-sm border transition-colors',
                            locale === lang
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-input text-muted-foreground hover:text-foreground hover:bg-accent'
                          )}
                        >
                          {lang === 'pl' ? '🇵🇱 Polski' : '🇬🇧 English'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">
                      <Moon className="inline w-4 h-4 mr-1.5 text-primary" />
                      {t('settings_theme')}
                    </label>
                    <p className="text-xs text-muted-foreground mb-3">{t('settings_theme_hint')}</p>
                    <div className="flex gap-2">
                      {['dark', 'light', 'system'].map((theme) => (
                        <button
                          key={theme}
                          className="px-4 py-2 rounded-lg text-sm border border-input text-muted-foreground hover:text-foreground hover:bg-accent transition-colors capitalize"
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  {[
                    { label: t('settings_notif_brew'), desc: t('settings_notif_brew_desc'), value: notifBrewComplete, set: setNotifBrewComplete },
                    { label: t('settings_notif_newsletter'), desc: t('settings_notif_newsletter_desc'), value: notifNewsletter, set: setNotifNewsletter },
                    { label: t('settings_notif_marketing'), desc: t('settings_notif_marketing_desc'), value: notifMarketing, set: setNotifMarketing },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-4 p-4 rounded-xl border border-[hsl(var(--glass-border))] bg-muted/20">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => item.set(!item.value)}
                        className={cn(
                          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                          item.value ? 'bg-primary' : 'bg-muted'
                        )}
                      >
                        <span
                          className={cn(
                            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform',
                            item.value ? 'translate-x-4' : 'translate-x-0'
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ── PRIVACY ── */}
              {activeTab === 'privacy' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{t('settings_privacy_desc')}</p>
                  <div className="flex flex-col gap-2">
                    <a
                      href="/polityka-prywatnosci"
                      target="_blank"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Shield className="w-4 h-4" /> {t('privacy')}
                    </a>
                    <a
                      href="/regulamin"
                      target="_blank"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Shield className="w-4 h-4" /> {t('terms')}
                    </a>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="p-4 rounded-xl border border-[hsl(var(--glass-border))] bg-muted/20">
                    <p className="text-sm font-medium text-foreground mb-1">{t('settings_data_export')}</p>
                    <p className="text-xs text-muted-foreground mb-3">{t('settings_data_export_desc')}</p>
                    <Button variant="outline" size="sm">
                      {t('settings_data_export_btn')}
                    </Button>
                  </div>
                </div>
              )}

              {/* ── DANGER ── */}
              {activeTab === 'danger' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                    <p className="text-sm font-semibold text-foreground mb-1">{t('settings_delete_account')}</p>
                    <p className="text-xs text-muted-foreground mb-4">{t('settings_delete_desc')}</p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAccount}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      {t('settings_delete_account')}
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
