import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

// Gate for the Home/Reports hub (/dashboard): a user who has never run a
// scan has nothing to see there, so send them to /brand-visibility to run
// their first one instead of showing an empty hub. Assumes the caller has
// already verified authentication (wrap with ProtectedRoute).
const RequireScanHistory = ({ children }: { children: JSX.Element }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { if (active) { setHasScanned(false); setIsLoading(false); } return; }

        const { count, error } = await supabase
          .from('analyses')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (active) {
          // Fail open on a query error — don't lock out a returning user
          // with real history just because of a transient network blip.
          setHasScanned(error ? true : (count ?? 0) > 0);
          setIsLoading(false);
        }
      } catch {
        if (active) { setHasScanned(true); setIsLoading(false); }
      }
    })();
    return () => { active = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!hasScanned) {
    return <Navigate to="/brand-visibility" replace />;
  }

  return children;
};

export default RequireScanHistory;
