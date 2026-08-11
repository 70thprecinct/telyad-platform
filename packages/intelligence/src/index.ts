export * from './planner';
export * from './localisation';
export * from './creative';
export * from './audience-intel';
export * from './revenue';

import { DemoAIPlanner } from './planner';
import { DemoLocalisationService } from './localisation';
import { DemoCreativeIntelligence } from './creative';
import { DemoAudienceIntelligence } from './audience-intel';
import { DemoRevenueIntelligence } from './revenue';

/** Default demonstration intelligence singletons used by the API. */
export const intelligence = {
  planner: new DemoAIPlanner(),
  localisation: new DemoLocalisationService(),
  creative: new DemoCreativeIntelligence(),
  audience: new DemoAudienceIntelligence(),
  revenue: new DemoRevenueIntelligence(),
};
