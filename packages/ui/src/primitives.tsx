import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { CampaignStatus } from '@telyad/types';

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

// ── Button ─────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'success';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  block?: boolean;
}
export function Button({
  variant = 'primary',
  size = 'md',
  block,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cx(
        'tly-btn',
        `tly-btn-${variant}`,
        size === 'sm' && 'tly-btn-sm',
        block && 'tly-btn-block',
        className,
      )}
      {...rest}
    />
  );
}

// ── Card ───────────────────────────────────────────────────────────────────
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('tly-card', className)}>{children}</div>;
}
export function CardHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="tly-card-head">
      <div>
        <div className="tly-card-title">{title}</div>
        {sub && <div className="tly-card-sub">{sub}</div>}
      </div>
      {action}
    </div>
  );
}

// ── KPI ────────────────────────────────────────────────────────────────────
export interface KpiProps {
  label: string;
  value: ReactNode;
  delta?: string;
  dir?: 'up' | 'down';
}
export function Kpi({ label, value, delta, dir }: KpiProps) {
  return (
    <div className="tly-kpi">
      <div className="tly-kpi-label">{label}</div>
      <div className="tly-kpi-val">{value}</div>
      {delta && <div className={cx('tly-kpi-delta', dir)}>{dir === 'down' ? '▼' : '▲'} {delta}</div>}
    </div>
  );
}
export function KpiGrid({ children }: { children: ReactNode }) {
  return <div className="tly-kpi-grid">{children}</div>;
}

// ── Badge / StatusBadge ────────────────────────────────────────────────────
type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  const dot = tone !== 'neutral';
  return (
    <span className={cx('tly-badge', `tly-badge-${tone}`)}>
      {dot && <span className="d" />}
      {children}
    </span>
  );
}

const STATUS_TONE: Record<CampaignStatus, BadgeTone> = {
  DRAFT: 'neutral',
  READY_FOR_REVIEW: 'info',
  SUBMITTED: 'info',
  PENDING_TELCO_APPROVAL: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  SCHEDULED: 'info',
  LIVE: 'success',
  PAUSED: 'warning',
  COMPLETED: 'neutral',
  CANCELLED: 'neutral',
};
const STATUS_LABEL: Record<CampaignStatus, string> = {
  DRAFT: 'Draft',
  READY_FOR_REVIEW: 'Ready for review',
  SUBMITTED: 'Submitted',
  PENDING_TELCO_APPROVAL: 'Pending approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SCHEDULED: 'Scheduled',
  LIVE: 'Live',
  PAUSED: 'Paused',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};
export function StatusBadge({ status }: { status: CampaignStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}

// ── Misc ───────────────────────────────────────────────────────────────────
export function EmptyState({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="tly-empty">
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
      {desc && <div style={{ fontSize: 12.5 }}>{desc}</div>}
    </div>
  );
}
export function Progress({ value }: { value: number }) {
  return (
    <div className="tly-progress">
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
