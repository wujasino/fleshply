import { Sidebar } from './Sidebar';
import { AppNavbar } from './AppNavbar';

export const AppShell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen bg-background overflow-hidden">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden ml-60">
      <AppNavbar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  </div>
);
