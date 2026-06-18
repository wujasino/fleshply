import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/locale';

type Status = 'idle' | 'sending' | 'success' | 'error';

export function ContactForm() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setStatus('success');
      setName(''); setEmail(''); setSubject(''); setMessage('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Błąd wysyłki. Spróbuj ponownie.');
      setStatus('error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
      {/* Left — info */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-display text-foreground mb-2">
            {t('contact_heading') || 'Napisz do nas'}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('contact_subheading') || 'Masz pytanie o produkt, chcesz omówić plan Enterprise lub po prostu chcesz się przywitać? Odpisujemy w ciągu 24 godzin.'}
          </p>
        </div>

        <div className="space-y-4">
          {[
            { icon: '📧', label: 'Email', value: 'kontakt@bitbrew.pl', href: 'mailto:kontakt@bitbrew.pl' },
            { icon: '⚡', label: t('contact_response_time') || 'Czas odpowiedzi', value: '< 24h', href: null },
            { icon: '🌍', label: t('contact_languages') || 'Języki', value: 'PL / EN', href: null },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="glass-card p-6 rounded-2xl">
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-4 py-10 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              </div>
              <div>
                <h4 className="font-display text-foreground text-lg">
                  {t('contact_success_title') || 'Wiadomość wysłana!'}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('contact_success_desc') || 'Odezwiemy się w ciągu 24 godzin.'}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStatus('idle')}>
                {t('contact_send_another') || 'Wyślij kolejną'}
              </Button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('contact_name') || 'Imię i nazwisko'} *
                  </Label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jan Kowalski"
                    required
                    minLength={2}
                    maxLength={120}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('email')} *
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="jan@firma.pl"
                    required
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('contact_subject') || 'Temat'}
                </Label>
                <Input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder={t('contact_subject_placeholder') || 'Pytanie o plan Enterprise...'}
                  maxLength={200}
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('contact_message') || 'Wiadomość'} *
                </Label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={t('contact_message_placeholder') || 'Opisz swoje pytanie lub potrzeby...'}
                  required
                  minLength={10}
                  maxLength={4000}
                  rows={5}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
                <p className="text-[10px] text-muted-foreground/50 text-right">{message.length}/4000</p>
              </div>

              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
                >
                  {errorMsg}
                </motion.p>
              )}

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('contact_sending') || 'Wysyłanie...'}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {t('contact_send') || 'Wyślij wiadomość'}
                  </>
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
