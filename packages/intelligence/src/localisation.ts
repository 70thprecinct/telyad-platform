import {
  LANGUAGE_LABELS,
  type LanguageCode,
  type LanguageVariant,
} from '@telyad/types';

/**
 * Produces language variants for ad creative. This demonstration implementation
 * localises the CALL TO ACTION from a curated phrase dictionary and preserves
 * locked brand terms; body copy is carried through and **flagged for human
 * review** rather than machine-translated (avoiding wrong/garbled output in a
 * live demo). A real localisation/AI provider can replace this behind the
 * interface. Human review is always required before submission (spec §15).
 */
export interface LocalisationService {
  generateVariant(input: LocaliseInput): LanguageVariant;
}

export interface LocaliseInput {
  baseText: string;
  cta?: string;
  targetLanguage: LanguageCode;
  /** Brand terms that must never be translated. */
  lockedTerms?: string[];
  charLimit?: number;
}

// Curated CTA localisations (demonstration). English kept as-is.
const CTA_DICTIONARY: Record<LanguageCode, Record<string, string>> = {
  en: {},
  pcm: {
    'book now': 'Book am now',
    'buy now': 'Buy am now',
    'learn more': 'Sabi more',
    'play now': 'Play now now',
    'subscribe': 'Subscribe sharp sharp',
    'get started': 'Start now',
    'shop now': 'Shop now now',
  },
  yo: {
    'book now': 'Fi orúkọ sílẹ̀',
    'buy now': 'Rà á báyìí',
    'learn more': 'Kọ́ síi',
    'play now': 'Ṣeré báyìí',
    'subscribe': 'Forúkọsílẹ̀',
    'get started': 'Bẹ̀rẹ̀',
    'shop now': 'Rajà báyìí',
  },
  ha: {
    'book now': 'Yi rijista yanzu',
    'buy now': 'Saya yanzu',
    'learn more': 'Ƙara sani',
    'play now': 'Yi wasa yanzu',
    'subscribe': 'Yi biyan kuɗi',
    'get started': 'Fara yanzu',
    'shop now': 'Yi saye yanzu',
  },
  ig: {
    'book now': 'Debe ugbu a',
    'buy now': 'Zụọ ugbu a',
    'learn more': 'Mụtakwuo',
    'play now': 'Gwuo ugbu a',
    'subscribe': 'Denye aha',
    'get started': 'Malite',
    'shop now': 'Zụọ ahịa ugbu a',
  },
};

function localiseCta(cta: string | undefined, lang: LanguageCode): string | undefined {
  if (!cta) return cta;
  if (lang === 'en') return cta;
  return CTA_DICTIONARY[lang][cta.trim().toLowerCase()] ?? cta;
}

export class DemoLocalisationService implements LocalisationService {
  generateVariant(input: LocaliseInput): LanguageVariant {
    const { baseText, targetLanguage, lockedTerms = [], charLimit } = input;
    const isEnglish = targetLanguage === 'en';
    const cta = localiseCta(input.cta, targetLanguage);
    // Body copy is preserved; a suffix marks the requested language for review.
    const text = isEnglish
      ? baseText
      : `${baseText}`; // body kept verbatim; review localises the body properly
    const charCount = text.length;
    return {
      language: targetLanguage,
      text,
      cta,
      status: 'draft',
      requiresReview: !isEnglish,
      charCount,
      charLimit,
      withinLimit: charLimit === undefined || charCount <= charLimit,
      lockedTerms,
    };
  }
}

export function languageName(code: LanguageCode): string {
  return LANGUAGE_LABELS[code];
}
