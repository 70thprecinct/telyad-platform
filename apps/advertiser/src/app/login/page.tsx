'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brand, Button, Field, Input } from '@telyad/ui';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="tly-login">
      <section className="tly-login-story">
        <Brand src="/images/logo.png" height={38} />
        <div className="tly-login-story-copy">
          <div className="tly-login-eyebrow">Advertiser</div>
          <h1>Reach the right audience,<br/><span>with carrier intelligence.</span></h1>
          <p>Plan, forecast and operate campaigns across carrier media with audience intelligence before launch.</p>
          <div className="tly-login-signals"><div><strong>✦</strong><span>Audience Match</span></div><div><strong>◎</strong><span>48 capabilities</span></div><div><strong>↗</strong><span>Forecast before launch</span></div></div>
        </div>
        <div className="tly-login-orbit" aria-hidden="true"><i/><i/><i/><b /></div>
        <div className="tly-login-trust">Secure access · Role based · Demonstration environment</div>
      </section>
      <section className="tly-login-access">
        <form onSubmit={onSubmit} className="tly-login-form">
          <div className="tly-login-mobile-brand"><Brand src="/images/logo.png" height={32} /></div>
          <div className="tly-login-eyebrow">Advertiser portal</div><h2>Welcome back</h2>
          <p className="tly-login-form-desc">Sign in to plan and manage your campaigns.</p>
          <Field label="Work email"><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></Field>
          <Field label="Password" error={error || undefined}><Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="Enter your password" /></Field>
          <Button type="submit" block disabled={busy}>{busy ? 'Signing in…' : 'Sign in securely'}</Button>
          <div className="tly-login-foot">TelyAd · Protected advertiser access</div>
        </form>
      </section>
    </main>
  );
}
