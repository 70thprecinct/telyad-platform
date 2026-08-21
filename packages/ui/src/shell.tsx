'use client';
import { useState, type ReactNode } from 'react';
import { cx } from './primitives';

export interface NavItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string;
}
export interface NavGroup {
  group: string;
  items: NavItem[];
}

export interface AppShellProps {
  /** URL of the official TelyAd logo (served from each app's public/). When set,
   *  it replaces the temporary letter mark. Aspect ratio is preserved. */
  brandLogo?: string;
  /** Fallback letter mark, shown only when no brandLogo is supplied. */
  brandMark?: string;
  /** Portal descriptor shown beside the logo (e.g. "Advertiser"). */
  brandName: string;
  netBadge?: { label: string; value: string };
  nav: NavGroup[];
  activeId: string;
  onNavigate: (id: string) => void;
  title: string;
  subtitle?: string;
  user: { name: string; role: string; initials: string };
  envLabel?: string;
  topbarRight?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function AppShell(props: AppShellProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="tly-app">
      <aside className={cx('tly-sidebar', open && 'open')}>
        <div className="tly-sb-brand">
          {props.brandLogo ? (
            <img
              src={props.brandLogo}
              alt="TelyAd"
              className="tly-brand-logo"
              // Fixed height, width auto → the official proportions are preserved.
              style={{ height: 26, width: 'auto', display: 'block' }}
            />
          ) : (
            <div className="tly-brand-mark">{props.brandMark}</div>
          )}
          <div className="tly-brand-name">{props.brandName}</div>
        </div>
        {props.netBadge && (
          <div className="tly-net-badge">
            <div className="l">{props.netBadge.label}</div>
            <div>{props.netBadge.value}</div>
          </div>
        )}
        <nav style={{ overflowY: 'auto', flex: 1 }}>
          {props.nav.map((g) => (
            <div key={g.group}>
              <div className="tly-sb-group">{g.group}</div>
              {g.items.map((it) => (
                <button
                  key={it.id}
                  className={cx('tly-sb-item', it.id === props.activeId && 'active')}
                  onClick={() => {
                    props.onNavigate(it.id);
                    setOpen(false);
                  }}
                >
                  {it.icon && <span className="ic">{it.icon}</span>}
                  <span>{it.label}</span>
                  {it.badge && <span className="tly-sb-badge">{it.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        {props.footer && <div className="tly-sb-footer">{props.footer}</div>}
      </aside>

      <div className="tly-main">
        <header className="tly-topbar">
          <button
            className="tly-btn tly-btn-ghost tly-btn-sm tly-hamburger"
            aria-label="Toggle menu"
            data-testid="menu-toggle"
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
          <div className="tly-topbar-title">
            {props.title}
            {props.subtitle && <span className="sub">{props.subtitle}</span>}
          </div>
          <div className="tly-topbar-right">
            {props.topbarRight}
            <div className="tly-user-chip">
              <div className="tly-avatar">{props.user.initials}</div>
              <div className="tly-user-text">
                <div style={{ fontSize: 12, fontWeight: 600 }}>{props.user.name}</div>
                <div style={{ fontSize: 10, color: 'var(--tly-text-faint)' }}>{props.user.role}</div>
              </div>
            </div>
          </div>
        </header>
        {props.envLabel && (
          <div className="tly-env-banner">
            <span>🔒 {props.envLabel}</span>
          </div>
        )}
        <main className="tly-content">{props.children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, desc }: { eyebrow?: string; title: string; desc?: string }) {
  return (
    <div className="tly-page-head">
      {eyebrow && <div className="tly-eyebrow">{eyebrow}</div>}
      <h1 className="tly-h1">{title}</h1>
      {desc && <p className="tly-page-desc">{desc}</p>}
    </div>
  );
}
