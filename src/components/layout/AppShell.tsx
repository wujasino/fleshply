import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { AppNavbar } from './AppNavbar';
import { AiChatSidebar } from './AiChatSidebar';
import { cn } from '@/lib/utils';

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div
        className={cn(
          'flex-1 flex flex-col overflow-hidden transition-all duration-200 min-w-0',
          collapsed ? 'md:ml-14' : 'md:ml-60',
          chatOpen && 'md:mr-80'
        )}
      >
        <AppNavbar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          onMobileToggle={() => setMobileOpen(o => !o)}
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
