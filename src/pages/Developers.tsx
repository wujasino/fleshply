import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key, Webhook, Copy, Trash2, Plus, Check, ExternalLink, Eye, EyeOff,
  CircleCheck, CircleX, Loader2, BookOpen, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

// ── Types ───────────────────────────────────────────────────────
type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  secret: string;
  createdAt: string;
  lastUsed: string | null;
};
type WebhookEvent = 'analysis.completed' | 'analysis.failed' | 'sentiment.dropped' | 'score.changed';
type Webhook = {
  id: string;
  url: string;
  events: WebhookEvent[];
  active: boolean;
  createdAt: string;
};
type Delivery = {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  status: number;
  ok: boolean;
  at: string;
};

const ALL_EVENTS: { id: WebhookEvent; label: string; desc: string }[] = [
  { id: 'analysis.completed', label: 'analysis.completed', desc: 'Sent when a brand analysis is completed' },
  { id: 'analysis.failed',    label: 'analysis.failed',    desc: 'Sent when an analysis fails' },
  { id: 'sentiment.dropped',  label: 'sentiment.dropped',  desc: 'Sent when AI sentiment drops below threshold' },
  { id: 'score.changed',      label: 'score.changed',      desc: 'Sent when the visibility score changes by ≥5 pts' },
];

// ── localStorage stubs ──────────────────────────────────────────
const keyOf = (uid: string, t: 'keys' | 'hooks' | 'deliveries') => `bb_dev_${t}_${uid}`;

const load = <T,>(uid: string, t: 'keys' | 'hooks' | 'deliveries'): T[] => {
  try { return JSON.parse(localStorage.getItem(keyOf(uid, t)) || '[]'); } catch { return []; }
};
const save = <T,>(uid: string, t: 'keys' | 'hooks' | 'deliveries', v: T[]) =>
  localStorage.setItem(keyOf(uid, t), JSON.stringify(v));

const genSecret = () => {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
};

// ── Tabs ────────────────────────────────────────────────────────
type Tab = 'keys' | 'webhooks';

const Developers = () => {
  useTranslation();
  const [tab, setTab] = useState<Tab>('keys');
  const [userId, setUserId] = useState<string | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [hooks, setHooks] = useState<Webhook[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      setKeys(load<ApiKey>(user.id, 'keys'));
      setHooks(load<Webhook>(user.id, 'hooks'));
      setDeliveries(load<Delivery>(user.id, 'deliveries'));
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-6 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[10px] uppercase tracking-[0.2em] text-primary font-data">
                Developers
              </span>
            </div>
            <h1 className="text-3xl font-display text-foreground">API & Webhooks</h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              Integrate BitBrew with your own stack. Manage API keys and webhooks.
            </p>
          </div>
          <Link
            to="/docs/api"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline self-start"
          >
            <BookOpen className="w-4 h-4" />
            Dokumentacja API
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[hsl(var(--glass-border))]">
          {([
            { id: 'keys',     label: 'Klucze API',  icon: Key },
            { id: 'webhooks', label: 'Webhooki',    icon: Webhook },
          ] as { id: Tab; label: string; icon: typeof Key }[]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-[1px] transition-colors',
                tab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {userId && tab === 'keys' && (
          <KeysSection userId={userId} keys={keys} setKeys={(k) => { setKeys(k); save(userId, 'keys', k); }} />
        )}
        {userId && tab === 'webhooks' && (
          <WebhooksSection
            userId={userId}
            hooks={hooks}
            setHooks={(h) => { setHooks(h); save(userId, 'hooks', h); }}
            deliveries={deliveries}
            setDeliveries={(d) => { setDeliveries(d); save(userId, 'deliveries', d); }}
          />
        )}
      </div>
    </div>
  );
};

// ── Keys section ────────────────────────────────────────────────
const KeysSection = ({ userId, keys, setKeys }: { userId: string; keys: ApiKey[]; setKeys: (k: ApiKey[]) => void }) => {
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newSecret, setNewSecret] = useState<{ id: string; secret: string } | null>(null);

  const create = () => {
    if (!name.trim()) return;
    setCreating(true);
    const secret = genSecret();
    const key: ApiKey = {
      id: crypto.randomUUID(),
      name: name.trim(),
      prefix: `bb_${secret.slice(0, 6)}`,
      secret: `bb_${secret}`,
      createdAt: new Date().toISOString(),
      lastUsed: null,
    };
    setKeys([key, ...keys]);
    setNewSecret({ id: key.id, secret: key.secret });
    setName('');
    setCreating(false);
  };

  const revoke = (id: string) => {
    if (!confirm('Revoke this key? Apps using it will stop working.')) return;
    setKeys(keys.filter(k => k.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* Create form */}
      <div className="rounded-2xl border border-[hsl(var(--glass-border))] bg-card/40 backdrop-blur-xl p-5">
        <h3 className="text-sm font-medium text-foreground mb-1">Generate new key</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Name the key so you can easily tell it apart (e.g. "Production", "Slack Backend").
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name"
            className="flex-1"
          />
          <Button onClick={create} disabled={!name.trim() || creating} className="gap-2">
            <Plus className="w-4 h-4" />
            Generate key
          </Button>
        </div>
      </div>

      {/* Newly created secret reveal */}
      <AnimatePresence>
        {newSecret && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-primary/40 bg-primary/5 p-5"
          >
            <div className="flex items-start gap-3">
              <CircleCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Key generated</p>
                <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                  Copy it now — for security we will only show it once.
                </p>
                <SecretCopyBox secret={newSecret.secret} />
                <button
                  onClick={() => setNewSecret(null)}
                  className="text-xs text-muted-foreground hover:text-foreground mt-3"
                >
                  I've saved the key, close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keys list */}
      <div className="rounded-2xl border border-[hsl(var(--glass-border))] bg-card/40 backdrop-blur-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[hsl(var(--glass-border))] flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Your keys ({keys.length})
          </p>
        </div>
        {keys.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Key className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No API keys. Generate your first one.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[hsl(var(--glass-border))]">
            {keys.map((k) => (
              <li key={k.id} className="px-5 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{k.name}</span>
                    <code className="text-xs font-data px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {k.prefix}…
                    </code>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Created {new Date(k.createdAt).toLocaleDateString()} ·{' '}
                    {k.lastUsed ? `Last used ${new Date(k.lastUsed).toLocaleDateString()}` : 'Never used'}
                  </p>
                </div>
                <button
                  onClick={() => revoke(k.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Delete key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Keys are used to authorize HTTP requests. Send them in the{' '}
        <code className="font-data text-foreground bg-muted px-1.5 py-0.5 rounded">Authorization: Bearer …</code>
      </p>
    </div>
  );
};

const SecretCopyBox = ({ secret }: { secret: string }) => {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(true);
  const copy = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="flex items-center gap-2 bg-background border border-[hsl(var(--glass-border))] rounded-lg p-2">
      <code className="flex-1 text-xs font-data text-foreground/90 truncate">
        {visible ? secret : '•'.repeat(secret.length)}
      </code>
      <button onClick={() => setVisible(v => !v)} className="p-1.5 text-muted-foreground hover:text-foreground">
        {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
      <button onClick={copy} className="p-1.5 text-muted-foreground hover:text-foreground">
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};

// ── Webhooks section ────────────────────────────────────────────
const WebhooksSection = ({ userId, hooks, setHooks, deliveries, setDeliveries }: {
  userId: string;
  hooks: Webhook[];
  setHooks: (h: Webhook[]) => void;
  deliveries: Delivery[];
  setDeliveries: (d: Delivery[]) => void;
}) => {
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<WebhookEvent[]>(['analysis.completed']);
  const [testing, setTesting] = useState<string | null>(null);

  const toggleEvent = (e: WebhookEvent) =>
    setEvents(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);

  const isValidUrl = useMemo(() => {
    try { new URL(url); return url.startsWith('https://'); } catch { return false; }
  }, [url]);

  const create = () => {
    if (!isValidUrl || events.length === 0) return;
    const hook: Webhook = {
      id: crypto.randomUUID(),
      url,
      events,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setHooks([hook, ...hooks]);
    setUrl('');
    setEvents(['analysis.completed']);
  };

  const toggleActive = (id: string) =>
    setHooks(hooks.map(h => h.id === id ? { ...h, active: !h.active } : h));

  const remove = (id: string) => {
    if (!confirm('Delete this webhook?')) return;
    setHooks(hooks.filter(h => h.id !== id));
  };

  const test = async (hook: Webhook) => {
    setTesting(hook.id);
    // Simulate sending a test event
    await new Promise(r => setTimeout(r, 900));
    const ok = Math.random() > 0.15;
    const status = ok ? 200 : 500;
    const delivery: Delivery = {
      id: crypto.randomUUID(),
      webhookId: hook.id,
      event: hook.events[0],
      status,
      ok,
      at: new Date().toISOString(),
    };
    setDeliveries([delivery, ...deliveries].slice(0, 25));
    setTesting(null);
  };

  return (
    <div className="space-y-5">
      {/* Create form */}
      <div className="rounded-2xl border border-[hsl(var(--glass-border))] bg-card/40 backdrop-blur-xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-1">Add webhook</h3>
          <p className="text-xs text-muted-foreground">
            We send a POST with JSON to the given URL when the selected event occurs.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Endpoint URL</Label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-domain.com/webhooks/bitbrew"
            className={cn(
              url && !isValidUrl && 'border-red-500/60'
            )}
          />
          {url && !isValidUrl && (
            <p className="text-[11px] text-red-400">A valid HTTPS URL is required</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Events</Label>
          <div className="grid sm:grid-cols-2 gap-2">
            {ALL_EVENTS.map(ev => {
              const checked = events.includes(ev.id);
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => toggleEvent(ev.id)}
                  className={cn(
                    'text-left p-3 rounded-xl border transition-colors',
                    checked
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-[hsl(var(--glass-border))] bg-muted/20 hover:bg-muted/40'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-3.5 h-3.5 rounded border flex items-center justify-center',
                      checked ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                    )}>
                      {checked && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                    </div>
                    <code className="text-xs font-data text-foreground">{ev.label}</code>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 ml-5.5">{ev.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <Button onClick={create} disabled={!isValidUrl || events.length === 0} className="gap-2">
          <Plus className="w-4 h-4" />
          Add webhook
        </Button>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-[hsl(var(--glass-border))] bg-card/40 backdrop-blur-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[hsl(var(--glass-border))]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Your webhooks ({hooks.length})
          </p>
        </div>
        {hooks.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Webhook className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No webhooks. Add your first one above.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[hsl(var(--glass-border))]">
            {hooks.map((h) => (
              <li key={h.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      'inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded',
                      h.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'
                    )}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', h.active ? 'bg-emerald-400' : 'bg-muted-foreground')} />
                      {h.active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <code className="text-xs font-data text-foreground/90 break-all">{h.url}</code>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {h.events.map(ev => (
                      <span key={ev} className="text-[10px] font-data px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => test(h)} disabled={testing === h.id} className="gap-1.5">
                    {testing === h.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                    Test
                  </Button>
                  <button
                    onClick={() => toggleActive(h.id)}
                    className="px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {h.active ? 'Pause' : 'Resume'}
                  </button>
                  <button onClick={() => remove(h.id)} className="p-2 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Deliveries */}
      <div className="rounded-2xl border border-[hsl(var(--glass-border))] bg-card/40 backdrop-blur-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[hsl(var(--glass-border))]">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Recent deliveries
          </p>
        </div>
        {deliveries.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No deliveries yet. Click "Test" on a webhook to send a sample event.
          </div>
        ) : (
          <ul className="divide-y divide-[hsl(var(--glass-border))]">
            {deliveries.map(d => {
              const hook = hooks.find(h => h.id === d.webhookId);
              return (
                <li key={d.id} className="px-5 py-3 flex items-center gap-3 text-sm">
                  {d.ok
                    ? <CircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    : <CircleX className="w-4 h-4 text-red-400 shrink-0" />}
                  <code className="text-xs font-data text-foreground">{d.event}</code>
                  <span className="text-xs text-muted-foreground truncate flex-1">{hook?.url ?? '—'}</span>
                  <span className={cn(
                    'text-xs font-data font-medium',
                    d.ok ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    HTTP {d.status}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(d.at).toLocaleTimeString()}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Developers;
