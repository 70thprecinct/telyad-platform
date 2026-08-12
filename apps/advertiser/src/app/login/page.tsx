'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input } from '@telyad/ui';
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(ellipse at top, rgba(255,106,61,0.10), transparent 55%), var(--tly-bg)',
      }}
    >
      <form
        onSubmit={onSubmit}
        className="tly-card"
        style={{ width: 'min(400px, 92vw)', marginBottom: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div className="tly-brand-mark">T</div>
          <div className="tly-brand-name" style={{ fontSize: 18 }}>
            TelyAds — Advertiser
          </div>
        </div>
        <p className="tly-page-desc" style={{ marginBottom: 20 }}>
          Sign in to create and manage campaigns on MTN Nigeria.
        </p>
        <Field label="Work email">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </Field>
        <Field label="Password" error={error || undefined}>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            placeholder="Enter your password"
          />
        </Field>
        <Button type="submit" block disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
        <p className="tly-faint" style={{ fontSize: 10.5, textAlign: 'center', marginTop: 14 }}>
          Demonstration Environment · TelyAd
        </p>
      </form>
    </div>
  );
}
