import type { CSSProperties } from 'react';

/**
 * Canonical TelyAd brand lockup. Single source of truth for all four apps.
 *
 * The official logo is a raster/vector asset supplied by the brand owner and
 * dropped into each app's `public/brand/` directory (see
 * `packages/ui/src/brand/README.md` for the required variants and exact
 * filenames). This component renders that asset without ever distorting it —
 * height is fixed and width is `auto`, so the supplied proportions are
 * preserved exactly (no stretch / squeeze / recolour).
 *
 * Until the asset is present, `src` is omitted and a neutral text wordmark is
 * shown as a placeholder so the layout is complete. It is intentionally NOT a
 * recreation of the official mark.
 */
export interface BrandProps {
  /**
   * URL of the logo asset for the current surface. Pass the reversed/light
   * variant on dark backgrounds and the full-colour variant on light ones.
   * Apps typically pass `/brand/telyad-logo.svg` (served from public/).
   */
  src?: string;
  /** 'full' = mark + wordmark lockup; 'mark' = compact icon only. */
  variant?: 'full' | 'mark';
  /** Rendered height in px; width scales to preserve the exact aspect ratio. */
  height?: number;
  /** Optional payoff line ("SMART ADS. REAL RESULTS.") for spacious brand moments. */
  withTagline?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Brand({ src, variant = 'full', height = 30, withTagline = false, className, style }: BrandProps) {
  return (
    <div className={className} style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, ...style }}>
      {src ? (
        <img
          src={src}
          alt="TelyAd"
          // Height fixed, width auto → original proportions preserved exactly.
          style={{ height, width: 'auto', display: 'block' }}
        />
      ) : (
        // Placeholder wordmark (replaced by the official asset once supplied).
        <span
          aria-label="TelyAd"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 9,
            fontFamily: 'var(--tly-font-display)',
            fontWeight: 700,
            fontSize: height * 0.66,
            letterSpacing: '-0.02em',
            color: 'var(--tly-text)',
          }}
        >
          <span
            aria-hidden
            style={{
              width: height,
              height,
              borderRadius: height * 0.28,
              background: 'var(--tly-primary)',
              color: 'var(--tly-primary-contrast)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: height * 0.5,
            }}
          >
            T
          </span>
          {variant === 'full' && (
            <span>
              Tely<span style={{ color: 'var(--tly-accent-ink)' }}>Ad</span>
            </span>
          )}
        </span>
      )}
      {withTagline && variant === 'full' && (
        <span
          style={{
            fontFamily: 'var(--tly-font-mono)',
            fontSize: 9.5,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--tly-text-faint)',
          }}
        >
          Smart ads. Real results.
        </span>
      )}
    </div>
  );
}
