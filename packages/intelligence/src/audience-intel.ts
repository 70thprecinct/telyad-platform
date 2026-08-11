import type { AudienceDefinition, AudienceEstimate, AudienceOpportunity } from '@telyad/types';

/** Suggests permitted, aggregate audience expansions. Swappable for real AI. */
export interface AudienceIntelligence {
  findOpportunities(def: AudienceDefinition, estimate: AudienceEstimate): AudienceOpportunity[];
}

export class DemoAudienceIntelligence implements AudienceIntelligence {
  findOpportunities(def: AudienceDefinition, estimate: AudienceEstimate): AudienceOpportunity[] {
    const out: AudienceOpportunity[] = [];
    const reach = estimate.estimatedReach;

    // 1) Multilingual expansion (Pidgin) if only English / no languages chosen.
    if (def.languages.length === 0 || (def.languages.length === 1 && def.languages[0] === 'en')) {
      const inc = Math.round(reach * 0.18);
      out.push({
        title: 'Add Nigerian Pidgin creative',
        reason:
          'A large share of the aggregate audience engages more with Pidgin creative. Adding a Pidgin variant expands permitted, consented reach.',
        incrementalReach: inc,
        budgetImpactMinor: Math.round(inc * 0.9),
        action: 'add_language:pcm',
      });
    }

    // 2) Adjacent geographies if narrowly targeted.
    if (def.geographies.length > 0 && def.geographies.length <= 2) {
      const inc = Math.round(reach * 0.32);
      out.push({
        title: 'Expand to two adjacent permitted cohorts',
        reason: `Your audience is estimated at ${reach.toLocaleString()}. Adding two adjacent permitted geographic cohorts could increase estimated eligible reach.`,
        incrementalReach: inc,
        budgetImpactMinor: Math.round(inc * 1.1),
        action: 'expand_geo',
      });
    }

    // 3) Device broadening if smartphone-only.
    if (def.deviceTypes.length === 1 && def.deviceTypes[0] === 'smartphone') {
      const inc = Math.round(reach * 0.24);
      out.push({
        title: 'Include feature-phone reachable formats',
        reason:
          'Adding feature-phone-capable formats (SMS/USSD/STK) extends reach to subscribers outside the smartphone cohort.',
        incrementalReach: inc,
        budgetImpactMinor: Math.round(inc * 0.7),
        action: 'add_device:feature_phone',
      });
    }

    return out;
  }
}
