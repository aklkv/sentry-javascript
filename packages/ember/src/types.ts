import type {
  BrowserOptions,
  browserTracingIntegration,
} from '@sentry/browser';

type BrowserTracingOptions = Parameters<typeof browserTracingIntegration>[0];

// This is private in Ember and not really exported, so we "mock" these types here.
export interface EmberRouterMain {
  location: {
    formatURL?: (url: string) => string;
    getURL?: () => string;
    implementation?: string;
    rootURL: string;
  };
}

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
