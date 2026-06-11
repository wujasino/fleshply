import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/components/ProtectedRoute";

// Route-level code splitting — each page loads only when navigated to
const Landing        = lazy(() => import("./pages/Landing"));
const Dashboard      = lazy(() => import("./pages/Dashboard"));
const Pricing        = lazy(() => import("./pages/Pricing"));
const Profile        = lazy(() => import("./pages/Profile"));
const Login          = lazy(() => import("./pages/Login"));
const Register       = lazy(() => import("./pages/Register"));
const Privacy        = lazy(() => import("./pages/Privacy"));
const Terms          = lazy(() => import("./pages/Terms"));
const NewsletterTerms = lazy(() => import("./pages/NewsletterTerms"));
const Settings       = lazy(() => import("./pages/Settings"));
const Developers     = lazy(() => import("./pages/Developers"));
const ApiDocs        = lazy(() => import("./pages/ApiDocs"));
const NotFound       = lazy(() => import("./pages/NotFound"));
const ResetPassword  = lazy(() => import("./pages/ResetPassword"));
const AuthConfirm    = lazy(() => import("./pages/AuthConfirm"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
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
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/developers"
              element={
                <ProtectedRoute>
                  <Developers />
                </ProtectedRoute>
              }
            />
            <Route path="/docs/api" element={<ApiDocs />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/confirm"   element={<AuthConfirm />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
