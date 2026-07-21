const SITE_URL = 'https://www.presora.app';

interface SeoConfig {
  title: string;
  description: string;
  /** Set true for pages that must not be indexed (auth-gated app views, transactional flows). */
  noindex?: boolean;
}

export const SEO_CONFIG: Record<string, SeoConfig> = {
  '/': {
    title: 'Presora — AI Brand Visibility Scanner | ChatGPT, Claude, Gemini',
    description: 'Presora checks whether ChatGPT, Claude and Gemini recommend your brand — or your competitors. Get your AI visibility score in 30 seconds. Built for agencies, brands and freelancers.',
  },
  '/pricing': {
    title: 'Pricing | Presora',
    description: 'Compare Presora plans — Free, Solo and Growth. Weekly AI visibility monitoring, competitor comparison, API access and alerts across ChatGPT, Claude and Gemini.',
  },
  '/docs/api': {
    title: 'API & Webhooks Documentation | Presora',
    description: 'Integrate Presora into your stack with a REST API and webhooks. Run brand visibility scans, pull scores and automate AI monitoring programmatically.',
  },
  '/polityka-prywatnosci': {
    title: 'Polityka Prywatności | Presora',
    description: 'Polityka prywatności Presora — dowiedz się, jakie dane zbieramy, jak je przetwarzamy i jakie masz prawa jako użytkownik.',
  },
  '/regulamin': {
    title: 'Regulamin | Presora',
    description: 'Regulamin świadczenia usług Presora — zasady korzystania z platformy do monitorowania widoczności marki w AI.',
  },
  '/regulamin-newslettera': {
    title: 'Regulamin Newslettera | Presora',
    description: 'Regulamin newslettera Presora — zasady zapisu, wysyłki i rezygnacji z subskrypcji.',
  },
  '/login': {
    title: 'Sign In | Presora',
    description: 'Sign in to Presora to monitor how ChatGPT, Claude and Gemini describe and recommend your brand.',
  },
  '/register': {
    title: 'Sign Up | Presora',
    description: 'Create a free Presora account and get your first AI brand visibility score in 30 seconds.',
  },
  // Authenticated / transactional views — keep a title for the tab, but tell
  // search engines not to index them (duplicate shells, gated or user-specific content).
  '/dashboard':          { title: 'Dashboard | Presora', description: 'Presora dashboard.', noindex: true },
  '/brand-visibility':   { title: 'Brand Scan | Presora', description: 'Presora brand scan.', noindex: true },
  '/automations':        { title: 'Automations | Presora', description: 'Presora automations.', noindex: true },
  '/changelog':          { title: "What's new | Presora", description: 'Presora changelog.', noindex: true },
  '/profile':            { title: 'Profile | Presora', description: 'Presora profile.', noindex: true },
  '/settings':           { title: 'Settings | Presora', description: 'Presora settings.', noindex: true },
  '/reports':            { title: 'Raporty | Presora', description: 'Presora reports.', noindex: true },
  '/developers':         { title: 'Developers | Presora', description: 'Presora developer tools.', noindex: true },
  '/reset-password':     { title: 'Reset Password | Presora', description: 'Reset your Presora password.', noindex: true },
  '/auth/confirm':       { title: 'Confirm Account | Presora', description: 'Confirm your Presora account.', noindex: true },
  '/auth/google/callback': { title: 'Signing in… | Presora', description: 'Completing Google sign-in.', noindex: true },
  '/onboarding':         { title: 'Onboarding | Presora', description: 'Set up your Presora account.', noindex: true },
};

const DEFAULT_SEO: SeoConfig = { title: 'Presora', description: 'Presora — AI Brand Visibility Scanner.', noindex: true };

const setMeta = (selector: string, attr: string, value: string) => {
  const el = document.head.querySelector<HTMLMetaElement>(selector);
  if (el) el.setAttribute(attr, value);
};

export const applySeo = (pathname: string) => {
  const config = SEO_CONFIG[pathname] ?? DEFAULT_SEO;
  const url = `${SITE_URL}${pathname === '/' ? '' : pathname}`;

  document.title = config.title;
  setMeta('meta[name="description"]', 'content', config.description);
  setMeta('meta[property="og:title"]', 'content', config.title);
  setMeta('meta[property="og:description"]', 'content', config.description);
  setMeta('meta[property="og:url"]', 'content', url);
  setMeta('meta[name="twitter:title"]', 'content', config.title);
  setMeta('meta[name="twitter:description"]', 'content', config.description);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;

  let robotsTag = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!robotsTag) {
    robotsTag = document.createElement('meta');
    robotsTag.name = 'robots';
    document.head.appendChild(robotsTag);
  }
  robotsTag.content = config.noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large';
};
