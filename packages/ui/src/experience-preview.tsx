import type { ReactNode } from 'react';
import type { PreviewRenderer, PreviewContent } from '@telyad/types';

export interface ExperiencePreviewProps {
  renderer: PreviewRenderer;
  content: PreviewContent;
  device?: 'smartphone' | 'feature_phone';
}

/**
 * Capability-specific subscriber-experience mockup. Renders a distinct, credible
 * visual for every PreviewRenderer — there is deliberately NO generic fallback:
 * the switch is exhaustive over the union (TypeScript checks this via `never`).
 */
export function ExperiencePreview({ renderer, content, device = 'smartphone' }: ExperiencePreviewProps) {
  return (
    <div className={`tly-xp tly-xp-${device}`} data-renderer={renderer}>
      {renderScene(renderer, content)}
    </div>
  );
}

// ── Small shared helpers ─────────────────────────────────────────────────────
function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="tly-phone tly-xp-phone">
      <div className="tly-phone-notch" />
      {children}
    </div>
  );
}

function StatusBar({ label }: { label?: string }) {
  return (
    <div className="tly-xp-statusbar">
      <span>{label || '9:41'}</span>
      <span className="tly-xp-statusbar-icons">····· ▮</span>
    </div>
  );
}

function AppIcon({ brand }: { brand?: string }) {
  return <div className="tly-xp-appicon">{(brand || 'A').charAt(0).toUpperCase()}</div>;
}

// ── Scene router ─────────────────────────────────────────────────────────────
function renderScene(renderer: PreviewRenderer, c: PreviewContent) {
  const brand = c.brand || 'BrandCo';
  const sender = c.sender || c.brand || 'MTNOffers';
  const cta = c.cta || 'Learn more';
  const offer = c.offer || c.title || 'Get 2GB for ₦200 today';

  switch (renderer) {
    // ── Messaging surfaces ──────────────────────────────────────────────────
    case 'sms':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-sms-head">{sender}</div>
          <div className="tly-sms-bubble">{c.body || offer}</div>
          <div className="tly-sms-meta">{sender} · now</div>
        </Phone>
      );

    case 'flash_sms':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-flash">
            <div className="tly-xp-flash-tag">Class 0 · Flash message</div>
            <div className="tly-xp-flash-body">{c.body || offer}</div>
            <div className="tly-xp-flash-actions">
              <div className="tly-xp-flash-btn">Dismiss</div>
              <div className="tly-xp-flash-btn primary">{cta}</div>
            </div>
          </div>
        </Phone>
      );

    case 'ussd':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-ussd-screen">
            {`${c.title || brand}\n\n${c.body || offer}\n\n1. ${cta}\n2. ${c.cta2 || 'More info'}\n0. Exit`}
          </div>
          <div className="tly-xp-ussd-input">
            <span>Reply</span>
            <span className="tly-xp-ussd-actions">Cancel · Send</span>
          </div>
        </Phone>
      );

    case 'voice_call':
      return (
        <Phone>
          <div className="tly-xp-call">
            <div className="tly-xp-call-tag">Incoming call</div>
            <div className="tly-xp-call-avatar">{brand.charAt(0).toUpperCase()}</div>
            <div className="tly-xp-call-name">{brand}</div>
            <div className="tly-xp-call-sub">{c.note || 'Sponsored voice message'}</div>
            <div className="tly-xp-call-actions">
              <div className="tly-xp-call-btn decline">✕</div>
              <div className="tly-xp-call-btn accept">✓</div>
            </div>
          </div>
        </Phone>
      );

    case 'end_of_call':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-eoc">
            <div className="tly-xp-eoc-status">Call ended · 02:14</div>
            <div className="tly-xp-eoc-card">
              <div className="tly-xp-eoc-brand">
                <AppIcon brand={brand} />
                <span>{brand}</span>
              </div>
              <div className="tly-xp-eoc-body">{c.body || offer}</div>
              <div className="tly-xp-eoc-cta">{cta}</div>
            </div>
            <div className="tly-xp-sponsored">Sponsored message</div>
          </div>
        </Phone>
      );

    case 'stk':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-stk-dialog tly-xp-stk">
            <div className="tly-stk-header">{c.title || `${brand} Service`}</div>
            <div className="tly-stk-body">{c.body || offer}</div>
            <div className="tly-stk-btns">
              <div className="tly-stk-btn primary">{cta}</div>
              {c.cta2 && <div className="tly-stk-btn">{c.cta2}</div>}
              <div className="tly-stk-btn">{c.cta3 || 'Cancel'}</div>
            </div>
          </div>
        </Phone>
      );

    case 'wap_push':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-wap">
            <div className="tly-xp-wap-head">
              <span className="tly-xp-wap-icon">↧</span>
              <span>Service message</span>
            </div>
            <div className="tly-xp-wap-title">{c.title || brand}</div>
            <div className="tly-xp-wap-body">{c.body || offer}</div>
            <div className="tly-xp-wap-url tly-mono">{c.url || 'http://mtn.ng/offer'}</div>
            <div className="tly-xp-wap-cta">{cta}</div>
          </div>
        </Phone>
      );

    case 'lock_screen':
      return (
        <Phone>
          <div className="tly-xp-lock">
            <div className="tly-xp-lock-time">9:41</div>
            <div className="tly-xp-lock-date">Tuesday, 11 August</div>
            <div className="tly-xp-lock-card">
              <div className="tly-xp-lock-brand">
                <AppIcon brand={brand} />
                <span>{brand}</span>
                <span className="tly-xp-lock-now">now</span>
              </div>
              <div className="tly-xp-lock-title">{c.title || offer}</div>
              <div className="tly-xp-lock-body">{c.body || 'Tap to view your offer.'}</div>
            </div>
            <div className="tly-xp-lock-slide">Swipe up to open</div>
          </div>
        </Phone>
      );

    case 'notification':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-shade">
            <div className="tly-xp-shade-label">Notifications</div>
            <div className="tly-xp-notif">
              <AppIcon brand={brand} />
              <div className="tly-xp-notif-main">
                <div className="tly-xp-notif-top">
                  <span className="tly-xp-notif-app">{c.appName || brand}</span>
                  <span className="tly-xp-notif-time">now</span>
                </div>
                <div className="tly-xp-notif-title">{c.title || offer}</div>
                <div className="tly-xp-notif-body">{c.body || 'Tap for details.'}</div>
              </div>
            </div>
          </div>
        </Phone>
      );

    case 'browser':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-browser">
            <div className="tly-xp-browser-bar">
              <span className="tly-xp-browser-lock">🔒</span>
              <span className="tly-xp-browser-url tly-mono">{c.url || 'portal.mtn.ng'}</span>
            </div>
            <div className="tly-xp-browser-body">
              <div className="tly-xp-portal-banner">
                <div className="tly-xp-portal-brand">{brand}</div>
                <div className="tly-xp-portal-title">{c.title || offer}</div>
                <div className="tly-xp-portal-cta">{cta}</div>
              </div>
              <div className="tly-xp-skeleton" />
              <div className="tly-xp-skeleton short" />
              <div className="tly-xp-skeleton" />
            </div>
          </div>
        </Phone>
      );

    case 'receipt':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-receipt">
            <div className="tly-xp-receipt-head">Transaction receipt</div>
            <div className="tly-xp-receipt-row">
              <span>Recharge</span>
              <span>{c.amount || '₦1,000'}</span>
            </div>
            <div className="tly-xp-receipt-row">
              <span>New balance</span>
              <span>₦1,240</span>
            </div>
            <div className="tly-xp-receipt-row">
              <span>Data bonus</span>
              <span>{c.reward || '500MB'}</span>
            </div>
            <div className="tly-xp-receipt-divider" />
            <div className="tly-xp-receipt-ad">
              <div className="tly-xp-receipt-ad-body">{c.body || offer}</div>
              <div className="tly-xp-sponsored">Sponsored by {brand}</div>
            </div>
          </div>
        </Phone>
      );

    case 'rcs':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-rcs-head">
            {sender} <span className="tly-xp-verified">✓</span>
          </div>
          <div className="tly-xp-rcs-card">
            <div className="tly-xp-rcs-media">{brand}</div>
            <div className="tly-xp-rcs-title">{c.title || offer}</div>
            <div className="tly-xp-rcs-body">{c.body || 'Rich message with tappable actions.'}</div>
          </div>
          <div className="tly-xp-quick">
            <div className="tly-xp-quick-btn">{cta}</div>
            {c.cta2 && <div className="tly-xp-quick-btn">{c.cta2}</div>}
          </div>
        </Phone>
      );

    case 'whatsapp':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-wa-head">
            <AppIcon brand={brand} />
            <div>
              <div className="tly-xp-wa-name">
                {brand} <span className="tly-xp-verified">✓</span>
              </div>
              <div className="tly-xp-wa-sub">Business message</div>
            </div>
          </div>
          <div className="tly-xp-wa-thread">
            <div className="tly-xp-wa-bubble">{c.body || offer}</div>
            <div className="tly-xp-wa-time">now</div>
          </div>
          <div className="tly-xp-quick">
            <div className="tly-xp-quick-btn">{cta}</div>
            {c.cta2 && <div className="tly-xp-quick-btn">{c.cta2}</div>}
          </div>
        </Phone>
      );

    case 'interactive_message':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-sms-head">{sender}</div>
          <div className="tly-xp-im-thread">
            <div className="tly-sms-bubble">{c.body || offer}</div>
            <div className="tly-xp-im-out">{c.cta || 'YES'}</div>
            <div className="tly-sms-bubble">{c.cta2 || 'Thanks! Your bonus is on the way. Reply STOP to opt out.'}</div>
          </div>
        </Phone>
      );

    // ── Conversion / engagement surfaces ────────────────────────────────────
    case 'reward':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-reward">
            <div className="tly-xp-reward-check">✓</div>
            <div className="tly-xp-reward-title">Reward earned</div>
            <div className="tly-xp-reward-amount">{c.reward || c.amount || '1GB data'}</div>
            <div className="tly-xp-reward-body">{c.body || `Courtesy of ${brand}. Added to your account.`}</div>
            <div className="tly-xp-reward-cta">{cta}</div>
          </div>
        </Phone>
      );

    case 'voucher':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-voucher">
            <div className="tly-xp-voucher-brand">{brand}</div>
            <div className="tly-xp-voucher-offer">{c.offer || c.title || '20% off your next order'}</div>
            <div className="tly-xp-voucher-tear" />
            <div className="tly-xp-voucher-code-label">Coupon code</div>
            <div className="tly-xp-voucher-code tly-mono">{c.code || 'SAVE20'}</div>
            <div className="tly-xp-voucher-cta">{cta}</div>
          </div>
        </Phone>
      );

    case 'survey':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-survey">
            <div className="tly-xp-survey-brand">{brand}</div>
            <div className="tly-xp-survey-q">{c.question || 'How likely are you to recommend us?'}</div>
            <div className="tly-xp-survey-opts">
              {(c.options && c.options.length ? c.options : ['Very likely', 'Somewhat', 'Not likely']).map((o, i) => (
                <div key={i} className="tly-xp-survey-opt">
                  <span className="tly-xp-survey-radio" />
                  {o}
                </div>
              ))}
            </div>
            <div className="tly-xp-survey-cta">{cta}</div>
          </div>
        </Phone>
      );

    case 'lead_form':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-form">
            <div className="tly-xp-form-brand">{brand}</div>
            <div className="tly-xp-form-title">{c.title || 'Request a callback'}</div>
            <div className="tly-xp-form-field">
              <span className="tly-xp-form-label">Full name</span>
              <span className="tly-xp-form-input" />
            </div>
            <div className="tly-xp-form-field">
              <span className="tly-xp-form-label">Phone number</span>
              <span className="tly-xp-form-input" />
            </div>
            <div className="tly-xp-form-cta">{cta || 'Submit'}</div>
          </div>
        </Phone>
      );

    case 'competition':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-comp">
            <div className="tly-xp-comp-brand">{brand}</div>
            <div className="tly-xp-comp-title">{c.title || 'Instant win!'}</div>
            <div className="tly-xp-comp-ticket">
              <div className="tly-xp-comp-ticket-label">You won</div>
              <div className="tly-xp-comp-ticket-prize">{c.reward || offer}</div>
              <div className="tly-xp-comp-ticket-code tly-mono">{c.code || 'WIN-4821'}</div>
            </div>
            <div className="tly-xp-comp-cta">{cta || 'Claim prize'}</div>
          </div>
        </Phone>
      );

    case 'video':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-video">
            <div className="tly-xp-video-frame">
              <div className="tly-xp-video-play">▶</div>
              <div className="tly-xp-video-skip">Skip in 5s</div>
              <div className="tly-xp-video-brand">{brand}</div>
            </div>
            <div className="tly-xp-video-caption">{c.title || offer}</div>
            <div className="tly-xp-video-reward">Watch to earn {c.reward || '100MB'}</div>
          </div>
        </Phone>
      );

    case 'search':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-search">
            <div className="tly-xp-search-bar tly-mono">{c.question || c.title || 'best data plans'}</div>
            <div className="tly-xp-search-result sponsored">
              <div className="tly-xp-search-tag">Sponsored</div>
              <div className="tly-xp-search-title">{c.title || `${brand} — ${offer}`}</div>
              <div className="tly-xp-search-url tly-mono">{c.url || 'ad.mtn.ng'}</div>
              <div className="tly-xp-search-snippet">{c.body || 'Official offer. Tap to activate instantly.'}</div>
            </div>
            <div className="tly-xp-search-result">
              <div className="tly-xp-search-title dim">Organic result</div>
              <div className="tly-xp-skeleton short" />
            </div>
            <div className="tly-xp-search-result">
              <div className="tly-xp-search-title dim">Organic result</div>
              <div className="tly-xp-skeleton short" />
            </div>
          </div>
        </Phone>
      );

    // ── Connectivity surfaces ───────────────────────────────────────────────
    case 'sponsored_data':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-conn">
            <div className="tly-xp-conn-icon">◉</div>
            <div className="tly-xp-conn-title">Free data sponsored by {brand}</div>
            <div className="tly-xp-conn-body">{c.body || 'Browse this app data-free, on us.'}</div>
            <div className="tly-xp-conn-meter">
              <span style={{ width: '68%' }} />
            </div>
            <div className="tly-xp-conn-meta">{c.amount || '340MB'} of 500MB sponsored data left</div>
          </div>
        </Phone>
      );

    case 'captive_portal':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-conn tly-xp-captive">
            <div className="tly-xp-conn-icon">⌂</div>
            <div className="tly-xp-conn-title">{c.title || `${brand} Wi-Fi`}</div>
            <div className="tly-xp-conn-body">{c.body || 'Connect free — sponsored access.'}</div>
            <div className="tly-xp-captive-check">
              <span className="tly-xp-form-check" /> I agree to the terms
            </div>
            <div className="tly-xp-conn-cta">{cta || 'Connect'}</div>
          </div>
        </Phone>
      );

    // ── Non-phone mini-mockups ──────────────────────────────────────────────
    case 'journey': {
      const steps =
        c.steps && c.steps.length
          ? c.steps
          : [
              { channel: 'SMS', label: 'Welcome offer', delay: 'Day 0' },
              { channel: 'USSD', label: 'Opt-in menu', delay: 'Day 1' },
              { channel: 'Reward', label: 'Bonus granted', delay: 'Day 3' },
            ];
      return (
        <div className="tly-xp-journey">
          <div className="tly-xp-panel-title">{c.title || 'Subscriber journey'}</div>
          {steps.map((s, i) => (
            <div key={i} className="tly-xp-journey-step">
              <div className="tly-xp-journey-node">
                <span className="tly-xp-journey-chip">{s.channel}</span>
                <div className="tly-xp-journey-body">
                  <div className="tly-xp-journey-label">{s.label}</div>
                  {s.delay && <div className="tly-xp-journey-delay">{s.delay}</div>}
                </div>
              </div>
              {i < steps.length - 1 && <div className="tly-xp-journey-conn">↓</div>}
            </div>
          ))}
        </div>
      );
    }

    case 'dooh':
      return (
        <div className="tly-xp-dooh">
          <div className="tly-xp-panel-title">{c.title || 'Digital out-of-home'}</div>
          <div className="tly-xp-dooh-flow">
            <div className="tly-xp-dooh-stage">
              <div className="tly-xp-dooh-stage-num">1</div>
              <div className="tly-xp-dooh-stage-label">Privacy-safe aggregate audience</div>
              <div className="tly-xp-dooh-agg">
                <span>~48,200</span> devices · <span>no individuals</span>
              </div>
            </div>
            <div className="tly-xp-dooh-arrow">→</div>
            <div className="tly-xp-dooh-stage">
              <div className="tly-xp-dooh-stage-num">2</div>
              <div className="tly-xp-dooh-stage-label">Location / screen selection</div>
              <div className="tly-xp-dooh-billboard">
                <div className="tly-xp-dooh-screen">{brand}</div>
                <div className="tly-xp-dooh-post" />
              </div>
            </div>
            <div className="tly-xp-dooh-arrow">→</div>
            <div className="tly-xp-dooh-stage">
              <div className="tly-xp-dooh-stage-num">3</div>
              <div className="tly-xp-dooh-stage-label">Activation &amp; measurement</div>
              <div className="tly-xp-dooh-agg">
                <span>1.2M</span> impressions · <span>+18%</span> lift
              </div>
            </div>
          </div>
        </div>
      );

    case 'carrier_app':
      return (
        <Phone>
          <StatusBar />
          <div className="tly-xp-app">
            <div className="tly-xp-app-header">
              <span className="tly-xp-app-name">{c.appName || 'MyMTN'}</span>
              <span className="tly-xp-app-menu">☰</span>
            </div>
            <div className="tly-xp-app-tiles">
              <div className="tly-xp-app-tile">Airtime</div>
              <div className="tly-xp-app-tile">Data</div>
            </div>
            <div className="tly-xp-app-banner">
              <div className="tly-xp-app-banner-brand">{brand}</div>
              <div className="tly-xp-app-banner-body">{c.body || offer}</div>
              <div className="tly-xp-app-banner-cta">{cta}</div>
            </div>
            <div className="tly-xp-app-nav">
              <span className="on">Home</span>
              <span>Pay</span>
              <span>Shop</span>
              <span>Me</span>
            </div>
          </div>
        </Phone>
      );

    case 'geo':
      return (
        <div className="tly-xp-geo">
          <div className="tly-xp-panel-title">{(c.note || 'Airport') + ' geo-zone'}</div>
          <div className="tly-xp-geo-map">
            <div className="tly-xp-geo-zone" />
            <div className="tly-xp-geo-pin">◎</div>
          </div>
          <div className="tly-xp-geo-arrow">↓ triggers</div>
          <div className="tly-xp-geo-msg">
            <div className="tly-xp-geo-msg-brand">{brand}</div>
            <div className="tly-xp-geo-msg-body">{c.body || offer}</div>
          </div>
        </div>
      );

    case 'trigger':
      return (
        <div className="tly-xp-trigger">
          <div className="tly-xp-panel-title">Context trigger</div>
          <div className="tly-xp-trigger-flow">
            <div className="tly-xp-trigger-event">
              <div className="tly-xp-trigger-tag">Event</div>
              <div className="tly-xp-trigger-label">{c.note || 'Low balance detected'}</div>
            </div>
            <div className="tly-xp-trigger-arrow">→</div>
            <div className="tly-xp-trigger-action">
              <div className="tly-xp-trigger-tag">Action</div>
              <div className="tly-xp-trigger-label">{c.body || offer}</div>
              <div className="tly-xp-trigger-cta">{cta}</div>
            </div>
          </div>
        </div>
      );

    default:
      return assertNever(renderer);
  }
}

/** Compile-time exhaustiveness guard: unreachable at runtime for a valid union. */
function assertNever(x: never): never {
  throw new Error(`ExperiencePreview: unhandled renderer ${String(x)}`);
}
