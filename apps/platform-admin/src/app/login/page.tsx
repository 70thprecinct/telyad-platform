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
          <div className="tly-login-eyebrow">Master Admin</div>
          <h1>Control the carrier ecosystem,<br/><span>from one command plane.</span></h1>
          <p>Operate telcos, platform health, governance and access from TelyAd's cross-network control plane.</p>
          <div className="tly-login-signals"><div><strong>✦</strong><span>Cross-telco control</span></div><div><strong>◎</strong><span>Platform health</span></div><div><strong>↗</strong><span>Governance & access</span></div></div>
        </div>
        <div className="tly-login-orbit" aria-hidden="true"><i/><i/><i/><b>TA</b></div>
        <div className="tly-login-trust">Secure access · Role based · Demonstration environment</div>
      </section>
      <section className="tly-login-access"><form onSubmit={onSubmit} className="tly-login-form">
        <div className="tly-login-mobile-brand"><Brand src="/images/logo.png" height={32} /></div>
        <div className="tly-login-eyebrow">Master Admin</div><h2>Welcome back</h2>
        <p className="tly-login-form-desc">Sign in to Master Admin.</p>
        <Field label="Work email"><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></Field>
        <Field label="Password" error={error || undefined}><Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="Enter your password" /></Field>
        <Button type="submit" block disabled={busy}>{busy ? 'Signing in…' : 'Sign in securely'}</Button>
        <div className="tly-login-foot">TelyAd · Protected platform access</div>
      </form></section>
    </main>
  );
}
