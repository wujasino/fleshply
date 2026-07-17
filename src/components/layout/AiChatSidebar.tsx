import { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Loader2, Target, Users, CalendarClock, Bell, Sparkles, Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

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

interface AiChatSidebarProps {
  open: boolean;
  onClose: () => void;
}

const SUGGESTIONS = [
  'Monitor Nike, and track Adidas and Puma weekly',
  'Alert me when my sentiment drops below 60',
  'Only query ChatGPT and Claude',
];

/* Live snapshot of what the assistant has configured so far. */
const ConfigCard = ({ config }: { config: MonitorConfig }) => {
  const hasAnything = config.brand || config.competitors.length || config.alert_metric;
  if (!hasAnything) return null;
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2.5 text-xs">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Check className="w-3 h-3 text-primary" /> Saved monitoring
      </div>
      {config.brand && (
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-foreground font-medium">{config.brand}</span>
        </div>
      )}
      {config.competitors.length > 0 && (
        <div className="flex items-start gap-2">
          <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex flex-wrap gap-1">
            {config.competitors.map(c => (
              <span key={c} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{c}</span>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <CalendarClock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-foreground capitalize">{config.frequency} scan</span>
        <span className="text-muted-foreground">· {config.models.join(', ')}</span>
      </div>
      {config.alert_metric && (
        <div className="flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-foreground">
            Alert if {config.alert_metric} &lt; {config.alert_threshold}
          </span>
        </div>
      )}
    </div>
  );
};

/* Proposed changes awaiting the user's confirmation before anything is saved. */
const ProposalCard = ({
  pending, onApply, onDiscard, applying,
}: {
  pending: PendingAction[];
  onApply: () => void;
  onDiscard: () => void;
  applying: boolean;
}) => (
  <div className="rounded-xl border border-primary/30 bg-primary/[0.07] p-3 space-y-3">
    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
      <Sparkles className="w-3 h-3" /> Proposed changes · review before saving
    </div>
    <ul className="space-y-1.5">
      {pending.map((a, i) => (
        <li key={i} className="flex items-start gap-2 text-xs text-foreground">
          <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <span>{a.label}</span>
        </li>
      ))}
    </ul>
    <div className="flex items-center gap-2 pt-1">
      <button
        onClick={onApply}
        disabled={applying}
        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium px-3 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {applying
          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
          : <><Check className="w-3.5 h-3.5" /> Apply changes</>}
      </button>
      <button
        onClick={onDiscard}
        disabled={applying}
        className="rounded-lg border border-border text-xs text-muted-foreground px-3 py-2 hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-50"
      >
        Discard
      </button>
    </div>
  </div>
);

export const AiChatSidebar = ({ open, onClose }: AiChatSidebarProps) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [config, setConfig] = useState<MonitorConfig | null>(null);
  const [pending, setPending] = useState<PendingAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
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
    <aside
      className={cn(
        'fixed right-0 top-0 bottom-0 z-40 flex flex-col bg-background border-l border-border transition-all duration-200 overflow-hidden',
        open ? 'w-full md:w-80' : 'w-0'
      )}
    >
      {open && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              <div className="leading-tight">
                <span className="block text-sm font-semibold text-foreground">Setup assistant</span>
                <span className="block text-[10px] text-muted-foreground">Configure monitoring by chat</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="mt-6 space-y-4">
                <p className="text-xs text-muted-foreground text-center">
                  Tell me what to monitor — I'll set it up. Try:
                </p>
                <div className="space-y-2">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="w-full text-left text-xs rounded-lg border border-border bg-card/50 px-3 py-2 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                    >
                      “{s}”
                    </button>
                  ))}
                </div>
              </div>
            )}

            {config && <ConfigCard config={config} />}

            {messages.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap',
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
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
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm bg-muted text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-border shrink-0">
            <input
              className="flex-1 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              placeholder="e.g. track Tesla and Rivian daily"
              value={input}
              disabled={loading}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </aside>
  );
};
