export * from '@sentry/browser';

/**
 * @sentry/ember - Official Sentry SDK for Ember.js
 *
 * A v2 addon that provides Sentry's error tracking and performance monitoring
 * for Ember apps.
 */
export type { EmberSentryConfig, EmberRouterMain } from './types.ts';
export {
  INITIAL_LOAD_BODY_SCRIPT,
  INITIAL_LOAD_BODY_SCRIPT_HASH,
  INITIAL_LOAD_HEAD_SCRIPT,
  INITIAL_LOAD_HEAD_SCRIPT_HASH,
} from './utils/sentry/constants.ts';
export { init } from './utils/sentry/init.ts';
export { instrumentRoutePerformance } from './utils/sentry/instrument-route-performance.ts';
export { setupPerformance } from './utils/sentry/setup-performance.ts';
