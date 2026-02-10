/**
 * @sentry/ember - Official Sentry SDK for Ember.js
 *
 * A v2 addon that provides Sentry's error tracking and performance monitoring
 * for Ember apps.
 */

import { startSpan } from '@sentry/browser';
import * as Sentry from '@sentry/browser';
import {
  applySdkMetadata,
  SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN,
  SEMANTIC_ATTRIBUTE_SENTRY_SOURCE,
} from '@sentry/core';

import type Route from '@ember/routing/route';
import type { BrowserOptions } from '@sentry/browser';
import type { Client, TransactionSource } from '@sentry/core';

/**
 * Inline script for marking initial load start time.
 * Add this in a `<script>` tag at the start of `<head>` in your index.html
 * for accurate initial load measurement.
 *
 * If using CSP, add `'sha256-${INITIAL_LOAD_HEAD_SCRIPT_HASH}'` to your script-src directive.
 */
export const INITIAL_LOAD_HEAD_SCRIPT =
  "if(window.performance&&window.performance.mark){window.performance.mark('@sentry/ember:initial-load-start');}";

/**
 * Inline script for marking initial load end time.
 * Add this in a `<script>` tag at the end of `<body>` in your index.html
 * for accurate initial load measurement.
 *
 * If using CSP, add `'sha256-${INITIAL_LOAD_BODY_SCRIPT_HASH}'` to your script-src directive.
 */
export const INITIAL_LOAD_BODY_SCRIPT =
  "if(window.performance&&window.performance.mark){window.performance.mark('@sentry/ember:initial-load-end');}";

/**
 * SHA-256 hash of INITIAL_LOAD_HEAD_SCRIPT for CSP script-src directive.
 * Use as: `script-src 'sha256-rK59cvsWB8z8eOLy4JAib4tBp8c/beXTnlIRV+lYjhg=' ...`
 */
export const INITIAL_LOAD_HEAD_SCRIPT_HASH =
  'rK59cvsWB8z8eOLy4JAib4tBp8c/beXTnlIRV+lYjhg=';

/**
 * SHA-256 hash of INITIAL_LOAD_BODY_SCRIPT for CSP script-src directive.
 * Use as: `script-src 'sha256-jax2B81eAvYZMwpds3uZwJJOraCENeDFUJKuNJau/bg=' ...`
 */
export const INITIAL_LOAD_BODY_SCRIPT_HASH =
  'jax2B81eAvYZMwpds3uZwJJOraCENeDFUJKuNJau/bg=';

/**
 * Initialize the Sentry SDK for Ember.
 *
 * This should be called early in your application's startup, typically in app/app.ts
 * before your Application class is defined.
 *
 * @param config - Sentry browser options
 * @returns The Sentry client instance
 *
 * @example
 * ```typescript
 * import * as Sentry from '@sentry/ember';
 *
 * Sentry.init({
 *   dsn: 'YOUR_DSN_HERE',
 *   tracesSampleRate: 1.0,
 * });
 * ```
 */
export function init(config?: BrowserOptions): Client | undefined {
  const initConfig = { ...config };

  applySdkMetadata(initConfig, 'ember');

  return Sentry.init(initConfig);
}

type RouteConstructor = new (
  ...args: ConstructorParameters<typeof Route>
) => Route;

/**
 * Decorator to instrument an Ember Route for performance monitoring.
 *
 * This wraps the route's lifecycle hooks (beforeModel, model, afterModel, setupController)
 * with Sentry spans to track their performance.
 *
 * @param BaseRoute - The Route class to instrument
 * @returns The instrumented Route class
 *
 * @example
 * ```typescript
 * import Route from '@ember/routing/route';
 * import { instrumentRoutePerformance } from '@sentry/ember';
 *
 * class ApplicationRoute extends Route {
 *   async model() {
 *     return this.store.findAll('post');
 *   }
 * }
 *
 * export default instrumentRoutePerformance(ApplicationRoute);
 * ```
 */
export const instrumentRoutePerformance = <T extends RouteConstructor>(
  BaseRoute: T,
): T => {
  const instrumentFunction = async (
    op: string,
    name: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Route hooks have varied signatures that can't be unified with unknown
    fn: (...args: any[]) => any,
    args: unknown[],
    source: TransactionSource,
  ): Promise<unknown> => {
    return startSpan(
      {
        attributes: {
          [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: source,
          [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.ui.ember',
        },
        op,
        name,
        onlyIfParent: true,
      },
      () => {
        return fn(...args);
      },
    );
  };

  const routeName = BaseRoute.name;

  return {
    // @ts-expect-error TS2545 We do not need to redefine a constructor here
    [routeName]: class extends BaseRoute {
      public beforeModel(...args: unknown[]): void | Promise<unknown> {
        return instrumentFunction(
          'ui.ember.route.before_model',
          this.fullRouteName,
          super.beforeModel.bind(this),
          args,
          'custom',
        );
      }

      public async model(...args: unknown[]): Promise<unknown> {
        return instrumentFunction(
          'ui.ember.route.model',
          this.fullRouteName,
          super.model.bind(this),
          args,
          'custom',
        );
      }

      public afterModel(...args: unknown[]): void | Promise<unknown> {
        return instrumentFunction(
          'ui.ember.route.after_model',
          this.fullRouteName,
          super.afterModel.bind(this),
          args,
          'custom',
        );
      }

      public setupController(...args: unknown[]): void | Promise<unknown> {
        return instrumentFunction(
          'ui.ember.route.setup_controller',
          this.fullRouteName,
          super.setupController.bind(this),
          args,
          'custom',
        );
      }
    },
  }[routeName] as T;
};

// Re-export everything from @sentry/browser
export * from '@sentry/browser';
