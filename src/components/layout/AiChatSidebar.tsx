import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageAction {
  label: string;
  to: string;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  action?: MessageAction;
}

interface AiChatSidebarProps {
  open: boolean;
  onClose: () => void;
}

// Intent detection: a keyword in the user's message surfaces a shortcut button.
const INTENTS: { match: RegExp; reply: string; action: MessageAction }[] = [
  { match: /(ustawie|settings|konto|profil)/i, reply: 'Jasne — ustawienia konta znajdziesz tutaj:', action: { label: 'Otwórz ustawienia', to: '/settings' } },
  { match: /(rozlicz|billing|faktur|płatnoś|platnos)/i, reply: 'Rozliczenia i faktury są w ustawieniach:', action: { label: 'Przejdź do rozliczeń', to: '/settings?tab=billing' } },
  { match: /(raport|report|histor)/i, reply: 'Twoje raporty analiz są tutaj:', action: { label: 'Zobacz raporty', to: '/reports' } },
  { match: /(api|webhook|klucz|developer|deweloper)/i, reply: 'Klucze API i dokumentację znajdziesz w panelu deweloperskim:', action: { label: 'Panel Developers', to: '/developers' } },
  { match: /(cennik|pricing|\bplan|subskryp|kredyt|upgrade)/i, reply: 'Sprawdź plany i cennik:', action: { label: 'Zobacz cennik', to: '/pricing' } },
];

export const AiChatSidebar = ({ open, onClose }: AiChatSidebarProps) => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);

    const intent = INTENTS.find(i => i.match.test(text));
    setTimeout(() => {
      setMessages(prev => [...prev, intent
        ? { role: 'assistant', text: intent.reply, action: intent.action }
        : { role: 'assistant', text: 'Ta funkcja jest w drodze. Możesz mnie zapytać np. o „ustawienia", „raporty" czy „api".' }
      ]);
    }, 500);
  };

  const goTo = (to: string) => {
    navigate(to);
    onClose();
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
              <span className="text-sm font-semibold text-foreground">AI Assistant</span>
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
              <p className="text-xs text-muted-foreground text-center mt-10">
                Zapytaj o widoczność Twojej marki — albo o „ustawienia", „raporty" czy „api".
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-xl px-3 py-2 text-sm',
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  )}
                >
                  {m.text}
                  {m.action && (
                    <button
                      onClick={() => goTo(m.action!.to)}
                      className="mt-2 inline-flex items-center gap-1.5 w-full justify-center rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      {m.action.label}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-border shrink-0">
            <input
              className="flex-1 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Napisz wiadomość..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </aside>
  );
};
