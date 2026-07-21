import { Link } from 'react-router-dom';
import { ExternalLink, Github, Twitter, Linkedin } from 'lucide-react';
import { Wordmark } from '@/components/Wordmark';

export const Footer = () => {

  return (
    <footer className="relative border-t border-[hsl(var(--glass-border))] bg-card/20 pt-16 pb-8 px-4 overflow-hidden">
      {/* Subtle glow top-center */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute left-1/2 -translate-x-1/2 -top-24 w-80 h-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        {/* Top: brand + columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-10 mb-14">

          {/* Brand column — wider on lg */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-2 flex flex-col gap-5">
            <Link to="/" className="flex items-center gap-2.5 w-fit">
              <Wordmark className="text-xl" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              The AI visibility platform for brands that want to be found.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { href: 'https://twitter.com/presora_ai', Icon: Twitter, label: 'Twitter/X' },
                { href: 'https://linkedin.com/company/presora', Icon: Linkedin, label: 'LinkedIn' },
                { href: 'https://github.com/presora-ai', Icon: Github, label: 'GitHub' },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl border border-[hsl(var(--glass-border))] bg-card/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            {/* Status pill */}
            <div className="flex items-center gap-2 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-ping opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px] text-muted-foreground/70">All systems operational</span>
            </div>
          </div>

          {/* Product column */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
              Product
            </p>
            <ul className="flex flex-col gap-3">
              {[
                { label: 'Dashboard', to: '/dashboard' },
                { label: 'Pricing',   to: '/pricing' },
                { label: 'API Docs',  to: '/docs/api' },
                { label: 'Changelog', to: '#', badge: 'Soon' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                  >
                    {item.label}
                    {item.badge && (
                      <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
              Company
            </p>
            <ul className="flex flex-col gap-3">
              {[
                { label: 'About',    to: '#' },
                { label: 'Blog',     to: '#' },
                { label: 'Careers',  to: '#', badge: 'Hiring' },
                { label: 'Contact',  href: 'mailto:kontakt@presora.app' },
              ].map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                    >
                      {item.label}
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </a>
                  ) : (
                    <Link
                      to={item.to!}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                    >
                      {item.label}
                      {item.badge && (
                        <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
              Legal
            </p>
            <ul className="flex flex-col gap-3">
              {[
                { label: 'Privacy Policy',     to: '/privacy' },
                { label: 'Terms of Service',   to: '/terms' },
                { label: 'Newsletter Terms',   to: '/newsletter-terms' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--glass-border))] to-transparent mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/60">© 2026 Presora. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
            <span className="text-base leading-none">🇵🇱</span>
            Made in Poland
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
