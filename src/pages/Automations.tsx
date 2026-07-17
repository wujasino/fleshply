import { useState, useEffect, useRef } from 'react';
import {
  Bot, Send, Loader2, Target, Users, CalendarClock, Bell, Sparkles, Check, ArrowRight,
  Paperclip, Mic, Square, X, ChevronDown, Coins, FileText, AudioLines,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

/* Language models the assistant can run on. Claude models are live;
   others are shown as upcoming (disabled) until their providers are wired. */
const MODELS: { id: string; label: string; available: boolean }[] = [
  { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5', available: true },
  { id: 'claude-haiku-4-5',  label: 'Claude Haiku 4.5',  available: true },
  { id: 'gpt-4o',            label: 'GPT-4o',            available: true },
  { id: 'gemini-1-5-pro',    label: 'Gemini 1.5 Pro',    available: true },
];

// Monthly automation-credit limits per plan (must match the chat function).
const PLAN_LIMITS: Record<string, number> = { free: 3, starter: 20, solo: 100, growth: 500, enterprise: 999999 };

interface Attachment { id: string; name: string; size: number; kind: 'file' | 'voice'; status: 'uploading' | 'done' | 'error'; path?: string; }

const UPLOAD_BUCKET = 'automation-uploads';

const fmtDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

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
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [config, setConfig] = useState<MonitorConfig | null>(null);
  const [pending, setPending] = useState<PendingAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Model selection
  const [model, setModel] = useState(MODELS[0].id);
  const [modelOpen, setModelOpen] = useState(false);
  const modelLabel = MODELS.find(m => m.id === model)?.label ?? 'Claude Sonnet 4.5';

  // Attachments (files + voice notes)
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice recording
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const recStartRef = useRef(0);
  const recTimerRef = useRef<number | null>(null);

  // Credits
  const [credits, setCredits] = useState<{ used: number; limit: number } | null>(null);

  // Load saved config + credits once on mount.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      const uid = session.user.id;
      supabase
        .from('brand_monitors')
        .select('brand, competitors, frequency, models, alert_metric, alert_threshold, enabled')
        .eq('user_id', uid)
        .maybeSingle()
        .then(({ data }) => { if (data) setConfig(data as MonitorConfig); });

      supabase.from('profiles').select('plan').eq('id', uid).single().then(({ data }) => {
        const plan = String(data?.plan ?? 'free').toLowerCase();
        const limit = PLAN_LIMITS[plan] ?? 3;
        const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
        supabase.from('automation_usage')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', uid)
          .gte('created_at', startOfMonth.toISOString())
          .then(({ count }) => setCredits({ used: count ?? 0, limit }));
      });
    });
  }, []);

  const uploadBlob = async (id: string, blob: Blob, filename: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setError('Please sign in to upload.'); setAttachments(a => a.map(x => x.id === id ? { ...x, status: 'error' } : x)); return; }
    const path = `${session.user.id}/${id}-${filename}`;
    const { error: upErr } = await supabase.storage.from(UPLOAD_BUCKET).upload(path, blob, { upsert: false });
    setAttachments(a => a.map(x => x.id === id ? { ...x, status: upErr ? 'error' : 'done', path } : x));
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const room = Math.max(0, 5 - attachments.length);
    for (const f of Array.from(files).slice(0, room)) {
      const id = crypto.randomUUID();
      setAttachments(a => [...a, { id, name: f.name, size: f.size, kind: 'file', status: 'uploading' }]);
      void uploadBlob(id, f, f.name);
    }
  };

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      mr.ondataavailable = e => chunks.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const secs = Math.max(1, Math.round((Date.now() - recStartRef.current) / 1000));
        const id = crypto.randomUUID();
        setAttachments(a => [...a, { id, name: `Voice note (${fmtDuration(secs)})`, size: blob.size, kind: 'voice', status: 'uploading' }].slice(0, 5));
        void uploadBlob(id, blob, 'voice.webm');
      };
      mr.start();
      mediaRef.current = mr;
      recStartRef.current = Date.now();
      setRecording(true);
      setRecSeconds(0);
      recTimerRef.current = window.setInterval(() => setRecSeconds(s => s + 1), 1000);
    } catch {
      setError('Microphone access was denied. You can still attach files.');
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
    if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null; }
  };

  const removeAttachment = (id: string) => {
    setAttachments(a => {
      const found = a.find(x => x.id === id);
      if (found?.path) void supabase.storage.from(UPLOAD_BUCKET).remove([found.path]);
      return a.filter(x => x.id !== id);
    });
  };

  const send = async (raw: string) => {
    const text = raw.trim();
    if ((!text && attachments.length === 0) || loading) return;
    if (attachments.some(a => a.status === 'uploading')) return; // wait for uploads

    // Fold any attachments into the message as context for the assistant.
    const attachNote = attachments.length
      ? `\n\n[Attached: ${attachments.map(a => a.name).join(', ')}]`
      : '';
    const displayText = (text || 'See the attached files.') + attachNote;

    setInput('');
    setError('');
    setAttachments([]);
    setPending([]); // a new instruction supersedes any un-applied proposal

    const history: Message[] = [...messages, { role: 'user', text: displayText }];
    setMessages(history);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please sign in to configure monitoring.');

      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ messages: history, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');

      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      if (data.config) setConfig(data.config);
      if (Array.isArray(data.pending)) setPending(data.pending);
      if (data.credits) setCredits(data.credits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const uploading = attachments.some(a => a.status === 'uploading');

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
      if (data.credits) setCredits(data.credits);
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
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="inline-flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-display text-foreground leading-tight">Automations</h1>
            <p className="text-xs text-muted-foreground">Set up monitoring by chat — no forms</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Credits pill */}
          {credits && (
            <div
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border bg-card/50 px-2.5 py-1.5"
              title={`${credits.used} of ${credits.limit} monthly credits used`}
            >
              <Coins className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground tabular-nums">
                {Math.max(0, credits.limit - credits.used)}
                <span className="text-muted-foreground font-normal"> / {credits.limit >= 9999 ? '∞' : credits.limit}</span>
              </span>
              <span className="text-[11px] text-muted-foreground">credits</span>
            </div>
          )}

          {/* Model selector */}
          <Popover open={modelOpen} onOpenChange={setModelOpen}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card/50 px-2.5 py-1.5 text-xs font-medium text-foreground hover:border-primary/40 transition-colors"
                aria-label="Choose language model"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="max-w-[7rem] truncate">{modelLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-1.5">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Language model</p>
              {MODELS.map(m => (
                <button
                  key={m.id}
                  disabled={!m.available}
                  onClick={() => { if (m.available) { setModel(m.id); setModelOpen(false); } }}
                  className={cn(
                    'w-full flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-left transition-colors',
                    m.available ? 'text-foreground hover:bg-accent cursor-pointer' : 'text-muted-foreground/60 cursor-not-allowed'
                  )}
                >
                  <span className="flex items-center gap-2">
                    {m.label}
                    {!m.available && <span className="text-[9px] uppercase tracking-wide rounded bg-muted px-1 py-0.5">Soon</span>}
                  </span>
                  {model === m.id && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>

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
        {/* Attachment chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map(a => (
              <span
                key={a.id}
                title={a.status === 'error' ? 'Upload failed' : undefined}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border pl-2 pr-1 py-1 text-xs max-w-[16rem]',
                  a.status === 'error' ? 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400' : 'border-border bg-card/60 text-foreground'
                )}
              >
                {a.status === 'uploading'
                  ? <Loader2 className="w-3.5 h-3.5 text-muted-foreground shrink-0 animate-spin" />
                  : a.kind === 'voice'
                    ? <AudioLines className="w-3.5 h-3.5 text-primary shrink-0" />
                    : <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                <span className="truncate">{a.name}</span>
                <button
                  onClick={() => removeAttachment(a.id)}
                  className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
                  aria-label={`Remove ${a.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background p-1.5 shadow-sm">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
          />

          {/* Attach file */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || recording}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-40 shrink-0"
            aria-label="Attach files"
            title="Attach files"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Record voice */}
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            disabled={loading}
            className={cn(
              'flex items-center justify-center h-9 rounded-lg transition-colors disabled:opacity-40 shrink-0',
              recording ? 'gap-1.5 px-2.5 bg-red-500/15 text-red-600 dark:text-red-400' : 'w-9 text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
            aria-label={recording ? 'Stop recording' : 'Record a voice message'}
            title={recording ? 'Stop recording' : 'Record a voice message'}
          >
            {recording ? <><Square className="w-3.5 h-3.5 fill-current" /><span className="text-xs font-medium tabular-nums">{fmtDuration(recSeconds)}</span></> : <Mic className="w-4 h-4" />}
          </button>

          <input
            className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground px-2 py-2 focus:outline-none disabled:opacity-50"
            placeholder={recording ? 'Recording…' : 'e.g. track Tesla and Rivian daily'}
            value={input}
            disabled={loading || recording}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
          />

          <button
            onClick={() => send(input)}
            disabled={(!input.trim() && attachments.length === 0) || loading || recording || uploading}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 shrink-0"
            aria-label="Send"
            title={uploading ? 'Waiting for uploads…' : 'Send'}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Credit awareness */}
        <p className="text-[11px] text-muted-foreground/70 mt-2 px-1">
          Running on <span className="text-foreground/80">{modelLabel}</span>. Files and voice notes add context.
          {credits && <> Applying a change uses <span className="text-foreground/80">1 automation credit</span>.</>}
        </p>
      </div>
    </div>
  );
};

export default Automations;
