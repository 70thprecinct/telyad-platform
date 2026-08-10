# Advertising Format Registry

Formats are registered in `packages/ad-formats`. The registry is the single
place the platform learns about an advertising format; the campaign wizard, the
creative validator and the API all read from it. Adding a format is additive —
**the campaign engine does not change.**

## Current inventory

| id | Name | Category | Pricing | Preview |
| --- | --- | --- | --- | --- |
| `stk` | STK Push Notification | interactive | CPM, CPA | SIM Toolkit dialog |
| `sms` | SMS Campaign | messaging | CPM, CPC | SMS bubble |
| `obd` | OBD Voice Call | voice | CPM, CPL | Voice card |
| `wap` | WAP Push | web | CPM, CPC | WAP banner |
| `ussd` | USSD Campaign | interactive | CPA, CPL | USSD screen |

Each format is an `AdvertisingFormat` descriptor:

```ts
{
  id, name, category, description,
  supportedTelcoIds,        // 'all' or specific telcos
  creativeSchema,           // typed fields (label, type, maxLength, required, options)
  pricingModels,            // CPM | CPC | CPA | CPL
  targetingCapabilities,
  previewRenderer,          // which handset preview to use
  complianceRequirements,   // DND | NDPA | NCC_VAS | CONSENT | CONTENT
  status,                   // available | beta | coming_soon
}
```

## Adding a format (the extensibility contract)

```ts
import { registerFormat } from '@telyad/ad-formats';

registerFormat({
  id: 'rcs',
  name: 'RCS Rich Card',
  category: 'messaging',
  creativeSchema: [
    { key: 'title', label: 'Card title', type: 'text', maxLength: 40, required: true },
    { key: 'body', label: 'Body', type: 'textarea', maxLength: 200, required: true },
  ],
  pricingModels: ['CPM', 'CPC'],
  // …
});
```

The wizard renders the new `creativeSchema` automatically, `validateCreative()`
enforces it, and the API accepts it — no engine changes. This is how the
remaining ~19 formats will be added in the next work package.

## Creative validation

`validateCreative(formatId, fields)` checks required fields, max lengths, URL
shape and select options against the format's schema, returning per-field
errors. The API rejects invalid creatives with `400` before a campaign is saved.
