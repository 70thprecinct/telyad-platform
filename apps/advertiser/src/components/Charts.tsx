'use client';
// Lightweight dependency-free SVG charts, themed with the design tokens.
// Kept local to the advertiser app so no chart library is bundled into the
// other portals. Purely presentational — data is passed in.
import { useId } from 'react';

const ORANGE = 'var(--tly-primary)';

export function LineChart({
  data,
  labels,
  height = 220,
  stroke = ORANGE,
  fill = 'var(--tly-primary-dim)',
}: {
  data: number[];
  labels?: string[];
  height?: number;
  stroke?: string;
  fill?: string;
}) {
  const w = 640;
  const h = height;
  const pad = { t: 12, r: 12, b: 22, l: 40 };
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const x = (i: number) => pad.l + (i * (w - pad.l - pad.r)) / Math.max(1, data.length - 1);
  const y = (v: number) => pad.t + (1 - (v - min) / span) * (h - pad.t - pad.b);
  const pts = data.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const area = `${pad.l},${y(min)} ${pts} ${x(data.length - 1)},${y(min)}`;
  const gid = useId().replace(/:/g, '');
  const grid = [0, 0.25, 0.5, 0.75, 1].map((g) => pad.t + g * (h - pad.t - pad.b));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" preserveAspectRatio="none">
      {grid.map((gy, i) => (
        <line key={i} x1={pad.l} x2={w - pad.r} y1={gy} y2={gy} stroke="var(--tly-border)" strokeWidth="1" />
      ))}
      <polygon points={area} fill={fill} opacity="0.5" />
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="3" fill={stroke} />
      ))}
      {labels &&
        labels.map((l, i) =>
          i % Math.ceil(labels.length / 7) === 0 ? (
            <text key={i} x={x(i)} y={h - 6} fontSize="10" fill="var(--tly-text-faint)" textAnchor="middle">
              {l}
            </text>
          ) : null,
        )}
      <title>{gid}</title>
    </svg>
  );
}

export function BarChart({
  data,
  height = 220,
  colors,
}: {
  data: { label: string; value: number }[];
  height?: number;
  colors?: string[];
}) {
  const w = 640;
  const h = height;
  const pad = { t: 12, r: 12, b: 34, l: 44 };
  const max = Math.max(...data.map((d) => d.value), 1);
  const bw = (w - pad.l - pad.r) / data.length;
  const y = (v: number) => pad.t + (1 - v / max) * (h - pad.t - pad.b);
  const palette = colors ?? ['var(--tly-primary)', '#0a9d5e', '#3b5bdb', '#0891b2', '#b26a00'];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img">
      {data.map((d, i) => {
        const bx = pad.l + i * bw + bw * 0.18;
        const barW = bw * 0.64;
        const by = y(d.value);
        return (
          <g key={i}>
            <rect x={bx} y={by} width={barW} height={h - pad.b - by} rx="5" fill={palette[i % palette.length]} />
            <text x={bx + barW / 2} y={h - 18} fontSize="10" fill="var(--tly-text-faint)" textAnchor="middle">
              {d.label}
            </text>
            <text x={bx + barW / 2} y={by - 5} fontSize="10" fill="var(--tly-text-dim)" textAnchor="middle">
              {d.value >= 1000 ? `${(d.value / 1000).toFixed(0)}k` : d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function DoughnutChart({
  data,
  size = 200,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2;
  const inner = r * 0.62;
  let angle = -Math.PI / 2;
  const arcs = data.map((d) => {
    const frac = d.value / total;
    const a0 = angle;
    const a1 = angle + frac * Math.PI * 2;
    angle = a1;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = (rad: number, ang: number) => [r + rad * Math.cos(ang), r + rad * Math.sin(ang)];
    const [x0, y0] = p(r, a0);
    const [x1, y1] = p(r, a1);
    const [ix1, iy1] = p(inner, a1);
    const [ix0, iy0] = p(inner, a0);
    return { d, path: `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${ix1} ${iy1} A ${inner} ${inner} 0 ${large} 0 ${ix0} ${iy0} Z` };
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img">
        {arcs.map((a, i) => (
          <path key={i} d={a.path} fill={a.d.color} />
        ))}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
            <span style={{ color: 'var(--tly-text-dim)' }}>{d.label}</span>
            <span className="tly-mono" style={{ marginLeft: 'auto', fontWeight: 600 }}>
              {((d.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
