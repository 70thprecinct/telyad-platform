import type { ReactNode } from 'react';
import { Badge, cx } from './primitives';

export interface IntelligenceMetric {
  label: string;
  value: ReactNode;
  note?: string;
}

export function IntelligenceStrip({
  title = 'TelyAd Intelligence',
  status = 'Deterministic intelligence',
  metrics,
}: {
  title?: string;
  status?: string;
  metrics: IntelligenceMetric[];
}) {
  return (
    <section className="tly-intelligence" aria-label={title}>
      <div className="tly-intelligence-head">
        <div>
          <div className="tly-intelligence-kicker">✦ Intelligence layer</div>
          <div className="tly-intelligence-title">{title}</div>
        </div>
        <Badge tone="info">{status}</Badge>
      </div>
      <div className="tly-intelligence-grid">
        {metrics.map((metric) => (
          <div className="tly-intelligence-metric" key={metric.label}>
            <div className="tly-intelligence-label">{metric.label}</div>
            <div className="tly-intelligence-value">{metric.value}</div>
            {metric.note && <div className="tly-intelligence-note">{metric.note}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

export function InsightCard({
  title,
  detail,
  value,
  tone = 'default',
}: {
  title: string;
  detail: string;
  value?: ReactNode;
  tone?: 'default' | 'success' | 'warning';
}) {
  return (
    <div className={cx('tly-insight-card', `tly-insight-${tone}`)}>
      <div className="tly-insight-icon">✦</div>
      <div>
        <div className="tly-insight-title">{title}</div>
        <div className="tly-insight-detail">{detail}</div>
        {value && <div className="tly-insight-value">{value}</div>}
      </div>
    </div>
  );
}

export function CommandBar({
  placeholder = 'Search campaigns, advertisers, capabilities, reports…',
  actionLabel = 'Ask TelyAd',
}: {
  placeholder?: string;
  actionLabel?: string;
}) {
  return (
    <div className="tly-command" data-testid="telyad-command-shell">
      <span className="tly-command-search" aria-hidden="true">⌕</span>
      <span className="tly-command-placeholder">{placeholder}</span>
      <span className="tly-command-shortcut">⌘ K</span>
      <button className="tly-command-ai" type="button" title="Deterministic intelligence assistant shell">
        ✦ {actionLabel}
      </button>
    </div>
  );
}
