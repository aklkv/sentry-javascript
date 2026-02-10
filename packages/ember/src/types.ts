import type {
  BrowserOptions,
  browserTracingIntegration,
} from '@sentry/browser';

type BrowserTracingOptions = Parameters<typeof browserTracingIntegration>[0];

export type EmberSentryConfig = {
  browserTracingOptions: BrowserTracingOptions;
  disableInitialLoadInstrumentation: boolean;
  disableInstrumentComponents: boolean;
  disablePerformance: boolean;
  disableRunloopPerformance: boolean;
  enableComponentDefinitions: boolean;
  minimumComponentRenderDuration: number;
  minimumRunloopQueueDuration: number;
  sentry: BrowserOptions & {
    browserTracingOptions?: BrowserTracingOptions;
  };
  transitionTimeout: number;
};
