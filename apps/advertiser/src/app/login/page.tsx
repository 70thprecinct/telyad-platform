'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import styles from './login.module.css';

const CAROUSEL_SLIDES = [
  {
    headline: 'Carrier-Powered Reach & Precision Targeting',
    subtext: 'Direct access to MTN Nigeria’s mobile subscriber network with privacy-safe audience targeting.',
    campaignName: 'Toyota Highlander 2026',
    tag: 'CAMPAIGN READY',
    badge: 'MTN Verified',
    stat1: '1.42M Urban',
    stat2: '100% Opt-in',
    stat3: 'SMS + STK',
  },
  {
    headline: 'Instant Scheduling & Real-Time Telco Routing',
    subtext: 'Zero-latency carrier delivery pipelines with live throughput monitoring across all 36 states.',
    campaignName: 'Maltina Ramadan Refresh',
    tag: 'HIGH PRIORITY',
    badge: 'Telecom Tier-1',
    stat1: '2.80M Users',
    stat2: 'Multi-State',
    stat3: 'RCS + STK',
  },
  {
    headline: 'Real-Time Yield & Verified Conversion',
    subtext: 'Carrier-verified delivery receipts with zero fraudulent clicks and deterministic telemetry.',
    campaignName: 'Access Bank Digital Loans',
    tag: 'FINTECH VERIFIED',
    badge: 'Carrier Audited',
    stat1: '950K ARPU',
    stat2: 'Tier-1 KYC',
    stat3: 'USSD + STK',
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('ada@toyota.example');
  const [password, setPassword] = useState('DemoPassword123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-advance carousel slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch {
      setError('Invalid email or password. Please verify your credentials or use the demo login.');
    } finally {
      setBusy(false);
    }
  }

  function fillDemoCredentials() {
    setEmail('ada@toyota.example');
    setPassword('DemoPassword123!');
    setError('');
  }

  const slide = CAROUSEL_SLIDES[activeSlide] ?? CAROUSEL_SLIDES[0]!;

  return (
    <div className={styles.pageContainer}>
      {/* Ambient background confetti & pills */}
      <div className={styles.bgDecoPill1} />
      <div className={styles.bgDecoDot1} />
      <div className={styles.bgDecoPill2} />
      <div className={styles.bgDecoDot2} />
      <div className={styles.bgDecoDot3} />
      <div className={styles.bgDecoPill3} />
      <div className={styles.bgDecoBlob} />

      <main className={styles.modalCard}>
        {/* ── Left Hero Side (Brand Visual + Mockup Cards) ── */}
        <section className={styles.heroSide} aria-label="TelyAd Feature Highlights">
          <div className={styles.heroGlow1} />
          <div className={styles.heroGlow2} />
          <div className={styles.heroShape1} />
          <div className={styles.heroShape2} />
          <div className={styles.heroShape3} />
          <div className={styles.heroShape4} />
          <div className={styles.heroWaveArc} />

          {/* Floating Cards Composition */}
          <div className={styles.cardShowcase}>
            {/* Floating Leaf / Signal Badge (Top Right) */}
            <div className={styles.floatingBadge} title="MTN Verified Carrier Partner">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>

            {/* Main Tilted Card */}
            <div className={styles.mainCard}>
              {/* Creative Media Placeholder as requested */}
              <div className={styles.creativePlaceholder}>
                <div className={styles.placeholderPattern} />
                <span className={styles.placeholderTag}>Ad Creative</span>
                <div className={styles.placeholderIconBox}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </div>
                <span className={styles.placeholderLabel}>Image Placeholder</span>
              </div>

              <div className={styles.mainCardContent}>
                <div className={styles.mainCardHeader}>
                  <span className={styles.mainCardTag}>{slide.tag}</span>
                  <span className={styles.mainCardStatus}>
                    <span className={styles.mainCardStatusDot} />
                    {slide.badge}
                  </span>
                </div>
                <h3 className={styles.mainCardTitle}>{slide.campaignName}</h3>

                <div className={styles.mainCardList}>
                  <div className={styles.mainCardListItem}>
                    <span className={styles.itemKey}>
                      <span>1</span> Reach
                    </span>
                    <span className={styles.itemVal}>{slide.stat1}</span>
                  </div>
                  <div className={styles.mainCardListItem}>
                    <span className={styles.itemKey}>
                      <span>2</span> Safety
                    </span>
                    <span className={styles.itemVal}>{slide.stat2}</span>
                  </div>
                  <div className={styles.mainCardListItem}>
                    <span className={styles.itemKey}>
                      <span>3</span> Format
                    </span>
                    <span className={styles.itemVal}>{slide.stat3}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Floating Card (Overlapping Bottom Right) */}
            <div className={styles.subCard}>
              <div className={styles.subCardItem}>
                <div className={styles.subCardBadge} style={{ background: '#fff7ed', color: '#ea580c' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div className={styles.subCardItemText}>
                  <span className={styles.subCardItemTitle}>CPM Yield</span>
                  <span className={styles.subCardItemDesc}>₦1,250 avg tier-1</span>
                </div>
              </div>
              <div className={styles.subCardItem}>
                <div className={styles.subCardBadge} style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className={styles.subCardItemText}>
                  <span className={styles.subCardItemTitle}>MTN Direct</span>
                  <span className={styles.subCardItemDesc}>99.2% delivery</span>
                </div>
              </div>
              <div className={styles.subCardItem}>
                <div className={styles.subCardBadge} style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div className={styles.subCardItemText}>
                  <span className={styles.subCardItemTitle}>Audience Match</span>
                  <span className={styles.subCardItemDesc}>Zero spoofing</span>
                </div>
              </div>
            </div>

            {/* Floating Micro Pill (Bottom Left) */}
            <div className={styles.floatingPill}>
              <div className={styles.pillPlayIcon}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <span>STK Push · 120ms Latency</span>
            </div>
          </div>

          {/* Hero Carousel Footer Text & Navigation */}
          <div className={styles.heroFooter}>
            <h2 className={styles.heroHeadline}>{slide.headline}</h2>
            <p className={styles.heroSubtext}>{slide.subtext}</p>
            <div className={styles.carouselDots} role="tablist" aria-label="Feature Highlights Slider">
              {CAROUSEL_SLIDES.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={activeSlide === index}
                  aria-label={`Slide ${index + 1}`}
                  onClick={() => setActiveSlide(index)}
                  className={`${styles.dot} ${activeSlide === index ? styles.dotActive : ''}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Right Form Side (Login Form) ── */}
        <section className={styles.formSide}>
          <div className={styles.formHeader}>
            <div className={styles.logoBadge}>
              <Image
                src="/images/logo.png"
                alt="TelyAd"
                width={62}
                height={28}
                style={{ objectFit: 'contain', width: 'auto', height: '26px' }}
                priority
              />
            </div>
            <h1 className={styles.welcomeTitle}>Hello Again!</h1>
            <p className={styles.welcomeDesc}>
              Sign in to manage and launch campaigns across MTN Nigeria’s subscriber network.
            </p>
          </div>

          <form onSubmit={onSubmit} className={styles.loginForm} noValidate>
            {error && (
              <div className={styles.errorAlert} role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Email Field with @ trailing icon */}
            <div className={styles.inputGroup}>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className={styles.inputField}
                autoComplete="email"
                aria-label="Email Address"
              />
              <span className={styles.inputIconRight} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
                </svg>
              </span>
            </div>

            {/* Password Field with lock icon and eye toggle */}
            <div className={styles.inputGroup}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={styles.inputField}
                autoComplete="current-password"
                aria-label="Password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
              </button>
            </div>

            {/* Remember Me */}
            <div className={styles.optionsRow}>
              <label className={styles.rememberMeLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>Remember Me</span>
              </label>
            </div>

            {/* Primary Submit Button */}
            <button type="submit" disabled={busy} className={styles.submitBtn}>
              {busy ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.spinnerIcon}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>Signing in…</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>

            {/* Quick Demo Pre-fill Box */}
            <div className={styles.demoHelperBox}>
              <div className={styles.demoHelperText}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Demo: Ada Obi (Toyota Admin)</span>
              </div>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className={styles.demoFillBtn}
              >
                Auto-fill
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
