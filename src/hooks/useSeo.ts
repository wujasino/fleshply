const SITE_URL = 'https://www.bitbrew.pl';

interface SeoConfig {
  title: string;
  description: string;
  /** Set true for pages that must not be indexed (auth-gated app views, transactional flows). */
  noindex?: boolean;
}

export const SEO_CONFIG: Record<string, SeoConfig> = {
  '/': {
    title: 'Perceply — AI Brand Visibility Scanner | ChatGPT, Claude, Gemini',
    description: 'Perceply checks whether ChatGPT, Claude and Gemini recommend your brand — or your competitors. Get your AI visibility score in 30 seconds. Built for agencies, brands and freelancers.',
  },
  '/pricing': {
    title: 'Pricing | Perceply',
    description: 'Compare Perceply plans — Free, Solo and Growth. Weekly AI visibility monitoring, competitor comparison, API access and alerts across ChatGPT, Claude and Gemini.',
  },
  '/docs/api': {
    title: 'API & Webhooks Documentation | Perceply',
    description: 'Integrate Perceply into your stack with a REST API and webhooks. Run brand visibility scans, pull scores and automate AI monitoring programmatically.',
  },
  '/polityka-prywatnosci': {
    title: 'Polityka Prywatności | Perceply',
    description: 'Polityka prywatności Perceply — dowiedz się, jakie dane zbieramy, jak je przetwarzamy i jakie masz prawa jako użytkownik.',
  },
  '/regulamin': {
    title: 'Regulamin | Perceply',
    description: 'Regulamin świadczenia usług Perceply — zasady korzystania z platformy do monitorowania widoczności marki w AI.',
  },
  '/regulamin-newslettera': {
    title: 'Regulamin Newslettera | Perceply',
    description: 'Regulamin newslettera Perceply — zasady zapisu, wysyłki i rezygnacji z subskrypcji.',
  },
  '/login': {
    title: 'Sign In | Perceply',
    description: 'Sign in to Perceply to monitor how ChatGPT, Claude and Gemini describe and recommend your brand.',
  },
  '/register': {
    title: 'Sign Up | Perceply',
    description: 'Create a free Perceply account and get your first AI brand visibility score in 30 seconds.',
  },
  // Authenticated / transactional views — keep a title for the tab, but tell
  // search engines not to index them (duplicate shells, gated or user-specific content).
  '/dashboard':          { title: 'Dashboard | Perceply', description: 'Perceply dashboard.', noindex: true },
  '/brand-visibility':   { title: 'Brand Scan | Perceply', description: 'Perceply brand scan.', noindex: true },
  '/automations':        { title: 'Automations | Perceply', description: 'Perceply automations.', noindex: true },
  '/changelog':          { title: "What's new | Perceply", description: 'Perceply changelog.', noindex: true },
  '/profile':            { title: 'Profile | Perceply', description: 'Perceply profile.', noindex: true },
  '/settings':           { title: 'Settings | Perceply', description: 'Perceply settings.', noindex: true },
  '/reports':            { title: 'Raporty | Perceply', description: 'Perceply reports.', noindex: true },
  '/developers':         { title: 'Developers | Perceply', description: 'Perceply developer tools.', noindex: true },
  '/reset-password':     { title: 'Reset Password | Perceply', description: 'Reset your Perceply password.', noindex: true },
  '/auth/confirm':       { title: 'Confirm Account | Perceply', description: 'Confirm your Perceply account.', noindex: true },
  '/auth/google/callback': { title: 'Signing in… | Perceply', description: 'Completing Google sign-in.', noindex: true },
  '/onboarding':         { title: 'Onboarding | Perceply', description: 'Set up your Perceply account.', noindex: true },
};

const DEFAULT_SEO: SeoConfig = { title: 'Perceply', description: 'Perceply — AI Brand Visibility Scanner.', noindex: true };

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
