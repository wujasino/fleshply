import { motion } from 'framer-motion';
import { Coffee, Clock, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/locale';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface Analysis {
  id: string;
  trust_score: number;
  brand_name: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  email?: string | null;
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  solo: 'Solo Brew',
  growth: 'Growth Roast',
  enterprise: 'Enterprise Roast',
};

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [avgScore, setAvgScore] = useState(0);
  const [guestCredits, setGuestCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string>('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'paused' | 'cancelled'>('active');
  const [subscriptionHistory, setSubscriptionHistory] = useState<Array<{ status: 'active' | 'paused' | 'cancelled'; label: string; timestamp: string }>>([]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  useEffect(() => {
    const storedStatus = localStorage.getItem('subscriptionStatus') as 'active' | 'paused' | 'cancelled' | null;
    if (storedStatus) setSubscriptionStatus(storedStatus);

    const storedHistory = localStorage.getItem('subscriptionHistory');
    if (storedHistory) {
      try {
        setSubscriptionHistory(JSON.parse(storedHistory));
      } catch {
        setSubscriptionHistory([]);
      }
    } else {
      const initialRecord = {
        status: 'active' as const,
        label: 'Subskrypcja aktywna od momentu rozpocz�cia',
        timestamp: new Date().toISOString(),
      };
      setSubscriptionHistory([initialRecord]);
      localStorage.setItem('subscriptionHistory', JSON.stringify([initialRecord]));
    }

    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        const key = 'guestCredits';
        let credits = Number(localStorage.getItem(key));
        if (!Number.isFinite(credits) || credits < 0) {
          credits = 3;
          localStorage.setItem(key, String(credits));
        }
        setGuestCredits(credits);
      }

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single();
        if (profileData?.plan) setPlan(profileData.plan);

        const { data } = await supabase
          .from('analyses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          const seen = new Set<string>();
          const unique = data.filter((a) => {
            const key = a.brand_name.trim().toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setAnalyses(unique);
          const avg = Math.round(unique.reduce((sum, a) => sum + a.trust_score, 0) / unique.length);
          setAvgScore(avg);
        }
      }
    };

    loadData();
  }, []);

  const subscriptionLabels = {
    active: 'Aktywna',
    paused: 'Wstrzymana',
    cancelled: 'Anulowana',
  } as const;

  const recordHistory = (status: 'active' | 'paused' | 'cancelled', label: string) => {
    setSubscriptionHistory((prev) => {
      const next = [{ status, label, timestamp: new Date().toISOString() }, ...prev].slice(0, 10);
      localStorage.setItem('subscriptionHistory', JSON.stringify(next));
      return next;
    });
  };

  const updateSubscriptionStatus = (status: 'active' | 'paused' | 'cancelled') => {
    if (status === subscriptionStatus) return;

    setSubscriptionStatus(status);
    localStorage.setItem('subscriptionStatus', status);

    if (status === 'paused') {
      recordHistory(status, 'Subskrypcja wstrzymana');
      toast('Subskrypcja zosta�a wstrzymana.');
      return;
    }

    if (status === 'cancelled') {
      recordHistory(status, 'Subskrypcja anulowana');
      toast('Subskrypcja zosta�a anulowana.');
      return;
    }

    recordHistory(status, 'Subskrypcja wznowiona');
    toast('Subskrypcja zosta�a wznowiona.');
  };

  const downloadSubscriptionHistory = () => {
    if (subscriptionHistory.length === 0) {
      toast('Brak historii do pobrania.');
      return;
    }

    let content: string;
    let mimeType: string;
    let fileName: string;

    if (exportFormat === 'json') {
      content = JSON.stringify(subscriptionHistory, null, 2);
      mimeType = 'application/json;charset=utf-8;';
      fileName = 'historia-subskrypcji.json';
    } else {
      const headers = ['Data', 'Status', 'Opis'];
      const rows = subscriptionHistory.map((item) => [
        new Date(item.timestamp).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }),
        subscriptionLabels[item.status],
        item.label,
      ]);
      content = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      mimeType = 'text/csv;charset=utf-8;';
      fileName = 'historia-subskrypcji.csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast(`Historia subskrypcji zosta�a pobrana jako ${exportFormat.toUpperCase()}.`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Zarz�dzanie subskrypcj�</p>
              <h2 className="text-2xl font-display text-foreground mt-2">Status subskrypcji: {subscriptionLabels[subscriptionStatus]}</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {subscriptionStatus === 'active' && (
                <>
                  <Button variant="outline" onClick={() => updateSubscriptionStatus('paused')}>
                    Wstrzymaj
                  </Button>
                  <Button variant="destructive" onClick={() => updateSubscriptionStatus('cancelled')}>
                    Anuluj
                  </Button>
                </>
              )}
              {subscriptionStatus === 'paused' && (
                <>
                  <Button variant="default" onClick={() => updateSubscriptionStatus('active')}>
                    Wzn�w
                  </Button>
                  <Button variant="destructive" onClick={() => updateSubscriptionStatus('cancelled')}>
                    Anuluj
                  </Button>
                </>
              )}
              {subscriptionStatus === 'cancelled' && (
                <Button variant="default" onClick={() => updateSubscriptionStatus('active')}>
                  Wzn�w
                </Button>
              )}
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Mo�esz w ka�dej chwili wstrzyma� swoje p�atno�ci lub anulowa� subskrypcj�. Po wstrzymaniu kliknij Wzn�w, by przywr�ci� aktywny status.
          </p>

          <div className="mt-8 bg-slate-950/10 rounded-2xl p-4 border border-[hsl(var(--glass-border))]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h3 className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Historia subskrypcji</h3>
                <p className="text-xs text-muted-foreground mt-2">Wybierz format pliku i pobierz pe�n� histori�.</p>
              </div>
              <div className="flex items-center gap-3">
                <label htmlFor="export-format" className="text-sm text-muted-foreground">
                  Format eksportu:
                </label>
                <select
                  id="export-format"
                  value={exportFormat}
                  onChange={(event) => setExportFormat(event.target.value as 'csv' | 'json')}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
                <Button variant="secondary" onClick={downloadSubscriptionHistory}>
                  Pobierz histori�
                </Button>
              </div>
            </div>

            {subscriptionHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">Brak zapisanej historii subskrypcji.</p>
            ) : (
              <div className="space-y-3">
                {subscriptionHistory.map((item) => (
                  <div key={item.timestamp} className="rounded-2xl bg-background/80 p-3 border border-[hsl(var(--glass-border))]">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-foreground">{item.label}</span>
                      <span className="text-[11px] text-muted-foreground uppercase tracking-[0.2em]">{subscriptionLabels[item.status]}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      {new Date(item.timestamp).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
            <div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Coffee className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-display text-foreground">{user?.email || '�adowanie...'}</h1>
                  <p className="text-sm text-muted-foreground">BitBrew User</p>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Status subskrypcji: <span className="text-foreground font-medium">{subscriptionLabels[subscriptionStatus]}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Plan: <span className="text-foreground font-medium">{user ? (PLAN_LABELS[plan] ?? 'Free') : `${guestCredits ?? 0} kredyt�w`}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[hsl(var(--glass-border))]">
            <div className="text-center">
              <div className="text-2xl font-display text-foreground">{analyses.length}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('total_brews')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-display text-primary">{avgScore || '�'}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('avg_score')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-display text-foreground">
                {user ? (PLAN_LABELS[plan] ?? 'Free') : (guestCredits ?? 0)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {user ? t('plan_label') : t('credits_left')}
              </div>
            </div>
          </div>
        </motion.div>

        <h2 className="text-lg font-display text-foreground mb-4">{t('past_brews')}</h2>
        <div className="space-y-3">
          {analyses.length === 0 && (
            <p className="text-muted-foreground text-sm">Brak analiz � wpisz nazw� marki na stronie g��wnej.</p>
          )}
          {analyses.map((brew, i) => (
            <motion.div
              key={brew.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/dashboard?id=${encodeURIComponent(brew.id)}`)}
              className="glass-card-hover p-5 cursor-pointer flex items-center justify-between hover:!border-primary/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">{brew.brand_name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(brew.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-display text-primary">{brew.trust_score}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
