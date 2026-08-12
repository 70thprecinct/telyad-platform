# TelyAd brand assets

Canonical logo assets for all four portals. The `<Brand>` component
(`packages/ui/src/brand.tsx`) is the single source of truth — apps never
embed their own copy of the logo.

## Required variants (supplied by the brand owner)

Produce these from the master logo. **Preserve the exact proportions — no
stretching, squeezing, recolouring or recreation.** All must have a
**transparent background** (do not place the black master rectangle onto the
white enterprise UI).

| File | Use | Background |
| --- | --- | --- |
| `telyad-logo.svg` (or `.png` @2x/@3x) | Full colour lockup (mark + wordmark) | light surfaces |
| `telyad-logo-reversed.svg` | Reversed/light lockup | dark surfaces (e.g. inside phone previews) |
| `telyad-mark.svg` | Icon/mark only | compact sidebar / favicon |

The payoff line **“SMART ADS. REAL RESULTS.”** is available via the
`withTagline` prop for spacious brand moments (login). The compact
sidebar/header uses the wordmark **without** the tagline.

## Where the files go

Because Next.js apps serve static files from their own `public/` directory,
drop the chosen variant into each app:

```
apps/advertiser/public/brand/telyad-logo.svg
apps/telco-console/public/brand/telyad-logo.svg
apps/platform-admin/public/brand/telyad-logo.svg
apps/telydial/public/brand/telyad-logo.svg
```

…and pass the path to the component:

```tsx
<Brand src="/brand/telyad-logo.svg" height={30} />          // sidebar/header
<Brand src="/brand/telyad-logo.svg" height={40} withTagline /> // login brand moment
```

Until the asset is added, `<Brand>` (called without `src`) renders a neutral
placeholder wordmark so layouts stay complete — it is **not** a recreation of
the official mark.
