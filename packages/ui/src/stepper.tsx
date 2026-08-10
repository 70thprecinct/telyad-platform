import { Fragment } from 'react';
import { cx } from './primitives.js';

export interface Step {
  n: number;
  label: string;
}

export function Stepper({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <div className="tly-steps">
      {steps.map((s, i) => (
        <Fragment key={s.n}>
          <div className={cx('tly-step', s.n === current && 'active', s.n < current && 'done')}>
            <div className="tly-step-num">{s.n < current ? '✓' : s.n}</div>
            <div className="tly-step-label">{s.label}</div>
          </div>
          {i < steps.length - 1 && <div className="tly-step-conn" />}
        </Fragment>
      ))}
    </div>
  );
}
