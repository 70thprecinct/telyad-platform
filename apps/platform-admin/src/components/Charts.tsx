'use client';
// Lightweight dependency-free SVG charts, themed with the design tokens.
export function LineChart({
  data, labels, height = 220, stroke = 'var(--tly-primary)', fill = 'var(--tly-primary-dim)',
}: { data: number[]; labels?: string[]; height?: number; stroke?: string; fill?: string }) {
  const w = 640, h = height, pad = { t: 12, r: 12, b: 22, l: 44 };
  const max = Math.max(...data, 1), min = Math.min(...data, 0), span = max - min || 1;
  const x = (i: number) => pad.l + (i * (w - pad.l - pad.r)) / Math.max(1, data.length - 1);
  const y = (v: number) => pad.t + (1 - (v - min) / span) * (h - pad.t - pad.b);
  const pts = data.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const area = `${pad.l},${y(min)} ${pts} ${x(data.length - 1)},${y(min)}`;
  const grid = [0, 0.25, 0.5, 0.75, 1].map((g) => pad.t + g * (h - pad.t - pad.b));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" preserveAspectRatio="none">
      {grid.map((gy, i) => <line key={i} x1={pad.l} x2={w - pad.r} y1={gy} y2={gy} stroke="var(--tly-border)" strokeWidth="1" />)}
      <polygon points={area} fill={fill} opacity="0.5" />
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" fill={stroke} />)}
      {labels && labels.map((l, i) => i % Math.ceil(labels.length / 7) === 0 ? (
        <text key={i} x={x(i)} y={h - 6} fontSize="10" fill="var(--tly-text-faint)" textAnchor="middle">{l}</text>
      ) : null)}
    </svg>
  );
}
export function BarChart({
  data, height = 220, colors,
}: { data: { label: string; value: number }[]; height?: number; colors?: string[] }) {
  const w = 640, h = height, pad = { t: 12, r: 12, b: 34, l: 44 };
  const max = Math.max(...data.map((d) => d.value), 1), bw = (w - pad.l - pad.r) / data.length;
  const y = (v: number) => pad.t + (1 - v / max) * (h - pad.t - pad.b);
  const palette = colors ?? ['var(--tly-primary)', '#0a9d5e', '#3b5bdb', '#7c3aed', '#b26a00'];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img">
      {data.map((d, i) => {
        const bx = pad.l + i * bw + bw * 0.18, barW = bw * 0.64, by = y(d.value);
        return (
          <g key={i}>
            <rect x={bx} y={by} width={barW} height={h - pad.b - by} rx="5" fill={palette[i % palette.length]} />
            <text x={bx + barW / 2} y={h - 18} fontSize="10" fill="var(--tly-text-faint)" textAnchor="middle">{d.label}</text>
            <text x={bx + barW / 2} y={by - 5} fontSize="10" fill="var(--tly-text-dim)" textAnchor="middle">{d.value >= 1000 ? `${(d.value / 1000).toFixed(0)}k` : d.value}</text>
          </g>
        );
      })}
    </svg>
  );
}
