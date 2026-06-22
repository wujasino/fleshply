import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { AppNavbar } from './AppNavbar';
import { AiChatSidebar } from './AiChatSidebar';

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar collapsed={collapsed} />

      <div
        className="flex-1 flex flex-col overflow-hidden transition-all duration-200"
        style={{ marginLeft: collapsed ? '3.5rem' : '15rem', marginRight: chatOpen ? '20rem' : '0' }}
      >
        <AppNavbar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          chatOpen={chatOpen}
          onChatToggle={() => setChatOpen(o => !o)}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <AiChatSidebar open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};
