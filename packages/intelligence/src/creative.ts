import type { CreativeSuggestion } from '@telyad/types';

/** Creative writing/improvement intelligence. Swappable for a real provider. */
export interface CreativeIntelligence {
  writeCopy(brief: CopyBrief): CreativeSuggestion;
  improve(text: string, mode: ImproveMode, charLimit?: number): CreativeSuggestion;
  score(text: string, charLimit?: number): CreativeSuggestion;
}

export interface CopyBrief {
  brand: string;
  offer: string;
  cta?: string;
  charLimit?: number;
}
export type ImproveMode = 'shorten' | 'expand' | 'improve_cta' | 'tone_friendly' | 'tone_formal';

function analyse(text: string, charLimit?: number): Omit<CreativeSuggestion, 'text'> {
  const charCount = text.length;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const avgWordLen = words.length ? words.reduce((a, w) => a + w.length, 0) / words.length : 0;
  const warnings: string[] = [];
  const withinLimit = charLimit === undefined || charCount <= charLimit;
  if (!withinLimit) warnings.push(`Exceeds ${charLimit} character limit by ${charCount - charLimit}.`);
  if (!/\b(reply|call|dial|tap|visit|buy|book|play|subscribe|shop|get)\b/i.test(text))
    warnings.push('No clear call to action detected.');
  if (!/opt|stop|t&c/i.test(text)) warnings.push('Consider an opt-out / T&Cs note for compliance.');
  const readabilityScore = Math.max(30, Math.min(100, Math.round(100 - (avgWordLen - 4) * 8)));
  const quality =
    (withinLimit ? 40 : 10) +
    (warnings.length === 0 ? 40 : Math.max(0, 30 - warnings.length * 10)) +
    Math.round(readabilityScore * 0.2);
  return {
    charCount,
    charLimit,
    withinLimit,
    qualityScore: Math.max(0, Math.min(100, quality)),
    readabilityScore,
    warnings,
  };
}

export class DemoCreativeIntelligence implements CreativeIntelligence {
  writeCopy(brief: CopyBrief): CreativeSuggestion {
    const cta = brief.cta ?? 'Reply YES';
    let text = `${brief.brand}: ${brief.offer}. ${cta}. T&Cs apply. Reply STOP to opt out.`;
    if (brief.charLimit && text.length > brief.charLimit) {
      text = `${brief.brand}: ${brief.offer}. ${cta}.`.slice(0, brief.charLimit);
    }
    return { text, ...analyse(text, brief.charLimit) };
  }

  improve(text: string, mode: ImproveMode, charLimit?: number): CreativeSuggestion {
    let out = text.trim();
    switch (mode) {
      case 'shorten':
        out = out.replace(/\s+/g, ' ').replace(/[.!]+$/, '').slice(0, charLimit ?? 120);
        break;
      case 'expand':
        out = `${out} Limited time only — don't miss out.`;
        break;
      case 'improve_cta':
        out = out.replace(/\b(reply|tap|click)\b.*$/i, '').trim() + ' Reply YES now to claim.';
        break;
      case 'tone_friendly':
        out = `Hey! ${out}`;
        break;
      case 'tone_formal':
        out = out.replace(/^hey!?\s*/i, '');
        break;
    }
    if (charLimit) out = out.slice(0, charLimit);
    return { text: out, ...analyse(out, charLimit) };
  }

  score(text: string, charLimit?: number): CreativeSuggestion {
    return { text, ...analyse(text, charLimit) };
  }
}
