import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import {
  Bot, Send, Loader2, Target, Users, CalendarClock, Bell, Sparkles, Check, ArrowRight,
  MessageSquare, Box,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

// Pulls in three.js — only fetched once the user actually opens Preview, not on every Automations visit.
const AutomationGraph3D = lazy(() =>
  import('@/components/automations/AutomationGraph3D').then(m => ({ default: m.AutomationGraph3D }))
);

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface PendingAction {
  name: string;
  input: Record<string, unknown>;
  label: string;
}

interface MonitorConfig {
  brand: string | null;
  competitors: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  models: string[];
  alert_metric: string | null;
  alert_threshold: number | null;
  enabled: boolean;
}

const SUGGESTIONS = [
  'Monitor Nike, and track Adidas and Puma weekly',
  'Alert me when my sentiment drops below 60',
  'Only query ChatGPT and Claude',
];

/* Live snapshot of the saved monitoring config. */
const ConfigCard = ({ config }: { config: MonitorConfig }) => {
  const hasAnything = config.brand || config.competitors.length || config.alert_metric;
  if (!hasAnything) return null;
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3 text-sm">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Check className="w-3 h-3 text-primary" /> Saved monitoring
      </div>
      {config.brand && (
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-foreground font-medium">{config.brand}</span>
        </div>
      )}
      {config.competitors.length > 0 && (
        <div className="flex items-start gap-2">
          <Users className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex flex-wrap gap-1.5">
            {config.competitors.map(c => (
              <span key={c} className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs">{c}</span>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <CalendarClock className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-foreground capitalize">{config.frequency} scan</span>
        <span className="text-muted-foreground text-xs">· {config.models.join(', ')}</span>
      </div>
      {config.alert_metric && (
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-foreground">Alert if {config.alert_metric} &lt; {config.alert_threshold}</span>
        </div>
      )}
    </div>
  );
};

/* Proposed changes awaiting confirmation before anything is saved. */
const ProposalCard = ({
  pending, onApply, onDiscard, applying,
}: {
  pending: PendingAction[];
  onApply: () => void;
  onDiscard: () => void;
  applying: boolean;
}) => (
  <div className="rounded-xl border border-primary/30 bg-primary/[0.07] p-4 space-y-3">
    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
      <Sparkles className="w-3 h-3" /> Proposed changes · review before saving
    </div>
    <ul className="space-y-1.5">
      {pending.map((a, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
          <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>{a.label}</span>
        </li>
      ))}
    </ul>
    <div className="flex items-center gap-2 pt-1">
      <button
        onClick={onApply}
        disabled={applying}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {applying
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          : <><Check className="w-4 h-4" /> Apply changes</>}
      </button>
      <button
        onClick={onDiscard}
        disabled={applying}
        className="rounded-lg border border-border text-sm text-muted-foreground px-4 py-2 hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-50"
      >
        Discard
      </button>
    </div>
  </div>
);

const Automations = () => {
  const [view, setView] = useState<'chat' | 'preview'>('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [config, setConfig] = useState<MonitorConfig | null>(null);
  const [pending, setPending] = useState<PendingAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load the current saved config once on mount.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase
        .from('brand_monitors')
        .select('brand, competitors, frequency, models, alert_metric, alert_threshold, enabled')
        .eq('user_id', session.user.id)
        .maybeSingle()
        .then(({ data }) => { if (data) setConfig(data as MonitorConfig); });
    });
  }, []);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || loading) return;
    setInput('');
    setError('');
    setPending([]); // a new instruction supersedes any un-applied proposal

    const history: Message[] = [...messages, { role: 'user', text }];
    setMessages(history);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please sign in to configure monitoring.');

      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');

      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      if (data.config) setConfig(data.config);
      if (Array.isArray(data.pending)) setPending(data.pending);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const applyPending = async () => {
    if (!pending.length || applying) return;
    setApplying(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please sign in to save.');

      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ apply: pending }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save.');

      if (data.config) setConfig(data.config);
      setPending([]);
      setMessages(prev => [...prev, { role: 'assistant', text: '✓ Saved. Your monitoring is set — you can change it any time.' }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setApplying(false);
    }
  };

  const discardPending = () => {
    setPending([]);
    setMessages(prev => [...prev, { role: 'assistant', text: 'No problem — I discarded that proposal. Nothing was changed.' }]);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, pending]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col min-h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-display text-foreground leading-tight">Automations</h1>
            <p className="text-xs text-muted-foreground">Set up monitoring by chat — no forms</p>
          </div>
        </div>
      </div>

      {/* Chat / Preview toggle */}
      <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-muted/40 w-fit mb-6">
        {(['chat', 'preview'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              'relative flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              view === v
                ? 'bg-background text-foreground shadow-sm border border-input'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {v === 'chat' ? <MessageSquare className="w-3.5 h-3.5" /> : <Box className="w-3.5 h-3.5" />}
            {v === 'chat' ? 'Chat' : 'Preview'}
          </button>
        ))}
      </div>

      {view === 'preview' ? (
        <Suspense fallback={<div className="h-[420px] rounded-xl border border-border bg-card/30 animate-pulse" />}>
          <AutomationGraph3D config={config} />
        </Suspense>
      ) : (
        <>
          {config && <div className="mb-4"><ConfigCard config={config} /></div>}

          {/* Conversation */}
          <div className="flex-1 space-y-3">
            {messages.length === 0 && (
              <div className="rounded-xl border border-border bg-card/40 p-5 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Tell me what to monitor and I'll set it up — you review and confirm before anything saves. Try:
                </p>
                <div className="space-y-2">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="w-full text-left text-sm rounded-lg border border-border bg-background px-3 py-2.5 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                    >
                      “{s}”
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm whitespace-pre-wrap',
                    m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {pending.length > 0 && !loading && (
              <ProposalCard pending={pending} onApply={applyPending} onDiscard={discardPending} applying={applying} />
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm bg-muted text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Thinking…
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5">
                {error}
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="sticky bottom-0 pt-4 bg-gradient-to-t from-background via-background to-transparent">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-1.5 shadow-sm">
              <input
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground px-3 py-2 focus:outline-none disabled:opacity-50"
                placeholder="e.g. track Tesla and Rivian daily"
                value={input}
                disabled={loading}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Automations;
