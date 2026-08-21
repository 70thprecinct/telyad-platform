'use client';
// Dependency-free inline-SVG charts, themed with the Light Enterprise tokens.
// No chart library is bundled — the prototype's Chart.js visuals are recreated here.

export interface Series {
  label: string;
  data: number[];
  color?: string;
  dashed?: boolean;
}

export function LineChart({
  series,
  labels,
  height = 210,
  area = true,
}: {
  series: Series[];
  labels: string[];
  height?: number;
  area?: boolean;
}) {
  const w = 640,
    h = height,
    pad = { t: 12, r: 14, b: 24, l: 46 };
  const all = series.flatMap((s) => s.data);
  const max = Math.max(...all, 1);
  const min = Math.min(...all, 0);
  const span = max - min || 1;
  const n = Math.max(1, labels.length - 1);
  const x = (i: number) => pad.l + (i * (w - pad.l - pad.r)) / n;
  const y = (v: number) => pad.t + (1 - (v - min) / span) * (h - pad.t - pad.b);
  const grid = [0, 0.25, 0.5, 0.75, 1].map((g) => pad.t + g * (h - pad.t - pad.b));
  const palette = ['var(--tly-primary)', 'var(--tly-success)', 'var(--tly-warning)', 'var(--tly-secondary)'];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" preserveAspectRatio="none">
      {grid.map((gy, i) => (
        <line key={i} x1={pad.l} x2={w - pad.r} y1={gy} y2={gy} stroke="var(--tly-border)" strokeWidth="1" />
      ))}
      {series.map((s, si) => {
        const color = s.color ?? palette[si % palette.length];
        const pts = s.data.map((v, i) => `${x(i)},${y(v)}`).join(' ');
        const areaPts = `${pad.l},${y(min)} ${pts} ${x(s.data.length - 1)},${y(min)}`;
        return (
          <g key={s.label}>
            {area && !s.dashed && <polygon points={areaPts} fill={color} opacity="0.08" />}
            <polyline
              points={pts}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeDasharray={s.dashed ? '5 3' : undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>
        );
      })}
      {labels.map((l, i) =>
        i % Math.ceil(labels.length / 7) === 0 ? (
          <text key={i} x={x(i)} y={h - 7} fontSize="10" fill="var(--tly-text-faint)" textAnchor="middle">
            {l}
          </text>
        ) : null,
      )}
    </svg>
  );
}

export function BarChart({
  data,
  height = 210,
  horizontal = false,
  colors,
}: {
  data: { label: string; value: number }[];
  height?: number;
  horizontal?: boolean;
  colors?: string[];
}) {
  const w = 640,
    h = height,
    pad = horizontal ? { t: 10, r: 16, b: 22, l: 92 } : { t: 14, r: 12, b: 30, l: 46 };
  const max = Math.max(...data.map((d) => d.value), 1);
  const fill = (i: number) => colors?.[i] ?? 'var(--tly-primary)';

  if (horizontal) {
    const bh = (h - pad.t - pad.b) / data.length;
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" preserveAspectRatio="none">
        {data.map((d, i) => {
          const bw = (d.value / max) * (w - pad.l - pad.r);
          const yy = pad.t + i * bh;
          return (
            <g key={d.label}>
              <rect x={pad.l} y={yy + bh * 0.15} width={Math.max(bw, 1)} height={bh * 0.6} rx="3" fill={fill(i)} />
              <text x={pad.l - 8} y={yy + bh * 0.55} fontSize="10.5" fill="var(--tly-text-dim)" textAnchor="end">
                {d.label}
              </text>
              <text x={pad.l + bw + 6} y={yy + bh * 0.55} fontSize="10" fill="var(--tly-text-faint)">
                {compact(d.value)}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  const bw = (w - pad.l - pad.r) / data.length;
  const y = (v: number) => pad.t + (1 - v / max) * (h - pad.t - pad.b);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" preserveAspectRatio="none">
      {[0, 0.5, 1].map((g) => {
        const gy = pad.t + g * (h - pad.t - pad.b);
        return <line key={g} x1={pad.l} x2={w - pad.r} y1={gy} y2={gy} stroke="var(--tly-border)" strokeWidth="1" />;
      })}
      {data.map((d, i) => {
        const cx = pad.l + i * bw;
        const top = y(d.value);
        return (
          <g key={d.label}>
            <rect x={cx + bw * 0.2} y={top} width={bw * 0.6} height={h - pad.b - top} rx="3" fill={fill(i)} />
            <text x={cx + bw / 2} y={top - 5} fontSize="10" fill="var(--tly-text-faint)" textAnchor="middle">
              {compact(d.value)}
            </text>
            <text x={cx + bw / 2} y={h - 10} fontSize="9.5" fill="var(--tly-text-dim)" textAnchor="middle">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function DoughnutChart({
  data,
  size = 180,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2;
  const inner = r * 0.58;
  let acc = 0;
  const arc = (frac: number) => {
    const a = 2 * Math.PI * frac - Math.PI / 2;
    return [r + r * Math.cos(a), r + r * Math.sin(a)];
  };
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img">
      {data.map((d) => {
        const start = acc / total;
        acc += d.value;
        const end = acc / total;
        const [x1, y1] = arc(start);
        const [x2, y2] = arc(end);
        const large = end - start > 0.5 ? 1 : 0;
        return (
          <path
            key={d.label}
            d={`M ${r} ${r} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
            fill={d.color}
          />
        );
      })}
      <circle cx={r} cy={r} r={inner} fill="var(--tly-card, #fff)" />
    </svg>
  );
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}
