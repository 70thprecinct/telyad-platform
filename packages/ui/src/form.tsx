import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cx } from './primitives';

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="tly-field">
      {label && <label>{label}</label>}
      {children}
      {error ? (
        <div className="hint" style={{ color: 'var(--tly-danger)' }}>
          {error}
        </div>
      ) : (
        hint && <div className="hint">{hint}</div>
      )}
    </div>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx('tly-input', className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx('tly-textarea', className)} {...rest} />;
}

export function Select({
  className,
  options,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { options: Array<{ value: string; label: string }> }) {
  return (
    <select className={cx('tly-select', className)} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Money input in major units; reports minor units (integer) via onChangeMinor. */
export function MoneyInput({
  valueMinor,
  onChangeMinor,
  symbol = '₦',
  ...rest
}: {
  valueMinor: number;
  onChangeMinor: (minor: number) => void;
  symbol?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'>) {
  return (
    <div style={{ position: 'relative' }}>
      <span
        style={{
          position: 'absolute',
          left: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--tly-text-faint)',
          fontSize: 13,
        }}
      >
        {symbol}
      </span>
      <Input
        type="number"
        min={0}
        step={1}
        style={{ paddingLeft: 26 }}
        value={valueMinor === 0 ? '' : valueMinor / 100}
        onChange={(e) => {
          const major = Number(e.target.value);
          onChangeMinor(Number.isFinite(major) ? Math.round(major * 100) : 0);
        }}
        {...rest}
      />
    </div>
  );
}

export function Chip({
  active,
  onToggle,
  children,
}: {
  active: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" className={cx('tly-chip', active && 'on')} onClick={onToggle}>
      {children}
    </button>
  );
}
export function ChipWrap({ children }: { children: ReactNode }) {
  return <div className="tly-chip-wrap">{children}</div>;
}
