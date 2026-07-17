import { lazy, Suspense, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/components/ProtectedRoute";

// AppShell (sidebar, app navbar, AI chat) is only used on authenticated app routes —
// code-split it so it stays out of the initial bundle served on landing/login/register.
const AppShell = lazy(() =>
  import("@/components/layout/AppShell").then(m => ({ default: m.AppShell }))
);

// Route-level code splitting — each page loads only when navigated to
const Landing        = lazy(() => import("./pages/Landing"));
const Dashboard      = lazy(() => import("./pages/Dashboard"));
const Automations    = lazy(() => import("./pages/Automations"));
const Pricing        = lazy(() => import("./pages/Pricing"));
const Profile        = lazy(() => import("./pages/Profile"));
const Login          = lazy(() => import("./pages/Login"));
const Register       = lazy(() => import("./pages/Register"));
const Privacy        = lazy(() => import("./pages/Privacy"));
const Terms          = lazy(() => import("./pages/Terms"));
const NewsletterTerms = lazy(() => import("./pages/NewsletterTerms"));
const Settings       = lazy(() => import("./pages/Settings"));
const Reports        = lazy(() => import("./pages/Reports"));
const Developers     = lazy(() => import("./pages/Developers"));
const ApiDocs        = lazy(() => import("./pages/ApiDocs"));
const NotFound       = lazy(() => import("./pages/NotFound"));
const ResetPassword  = lazy(() => import("./pages/ResetPassword"));
const AuthConfirm    = lazy(() => import("./pages/AuthConfirm"));
const Onboarding     = lazy(() => import("./pages/Onboarding"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

const PAGE_TITLES: Record<string, string> = {
  '/':           'Perceply — AI Brand Visibility Scanner',
  '/dashboard':  'Dashboard | Perceply',
  '/automations':'Automations | Perceply',
  '/pricing':    'Pricing | Perceply',
  '/profile':    'Profile | Perceply',
  '/settings':   'Settings | Perceply',
  '/developers': 'Developers | Perceply',
  '/login':      'Sign In | Perceply',
  '/register':   'Sign Up | Perceply',
  '/docs/api':   'API Docs | Perceply',
};

const PageTitle = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = PAGE_TITLES[pathname] ?? 'Perceply';
  }, [pathname]);
  return null;
};

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PageTitle />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<AppShell><Dashboard /></AppShell>} />
            <Route
              path="/automations"
              element={
                <ProtectedRoute>
                  <AppShell><Automations /></AppShell>
                </ProtectedRoute>
              }
            />
            <Route path="/pricing" element={<AppShell><Pricing /></AppShell>} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppShell><Profile /></AppShell>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/polityka-prywatnosci" element={<Privacy />} />
            <Route path="/regulamin" element={<Terms />} />
            <Route path="/regulamin-newslettera" element={<NewsletterTerms />} />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppShell><Settings /></AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <AppShell><Reports /></AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/developers"
              element={
                <ProtectedRoute>
                  <AppShell><Developers /></AppShell>
                </ProtectedRoute>
              }
            />
            <Route path="/docs/api" element={<ApiDocs />} />
            <Route path="/reset-password"        element={<ResetPassword />} />
            <Route path="/auth/confirm"          element={<AuthConfirm />} />
            <Route path="/onboarding"            element={<Onboarding />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
