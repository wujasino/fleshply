import { Sidebar } from './Sidebar';

export const AppShell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen bg-background overflow-hidden">
    <Sidebar />
    <main className="flex-1 overflow-auto ml-60">
      {children}
    </main>
  </div>
);
