# Multilingual Intelligence

First-class multilingual advertising across **English, Nigerian Pidgin, Yoruba,
Hausa, Igbo** (`LANGUAGES` / `LANGUAGE_LABELS` in `@telyad/types`).

## What is implemented
- Language selection in the campaign wizard creative step.
- `POST /ai/localise` → a `LanguageVariant` per target language: localised **CTA**
  from a curated dictionary, **brand-term locking** (`lockedTerms` preserved),
  character-limit awareness, and a `requiresReview` flag.
- Variants are **drafts** (`status: 'draft'`) — generated translations are never
  auto-activated; **human review is required before submission** (spec §15).

## Translation vs localisation
The demo localises the CTA and preserves brand terms; body copy is carried
through and **flagged for human review** rather than machine-translated, to avoid
wrong/garbled output in a live demo. A real localisation/AI provider swaps in
behind `LocalisationService`.

## Language-targeting safety (spec §16)
The platform does **not** infer ethnicity, religion, tribal identity, or language
from a person's name, and never exposes individual subscriber language records.
Language targeting is modelled as a **permitted, aggregate/contextual capability**
— advertisers see aggregate opportunities (e.g. "Hausa-language campaign
opportunity — Kano metro — estimated eligible audience 840K"), never identities.
Audience privacy enforcement is unchanged (see Audience Intelligence doc).
