# Migrate to `@sentry/ember@v11`

`@sentry/ember` is now a v2 addon. After installing the latest version, you will need to update your project configuration.


## 1. Pass Sentry configuration

Pass the configuration object directly to `Sentry.init` in `app/app.{js,ts}`, instead of the `ENV` object in `config/environment.js`.

```ts
import Application from '@ember/application';
import * as Sentry from '@sentry/ember';

Sentry.init({
  dsn: 'YOUR_DSN',
  // ... additional options
});

export default class App extends Application {
  // ...
}
```


## 2. Set up performance monitoring (optional)

The v2 addon no longer automatically calls `setupPerformance`. Create `app/instance-initializers/sentry.ts` to call `setupPerformance`.

```ts
// app/instance-initializers/sentry.ts
import type ApplicationInstance from '@ember/application/instance';
import { setupPerformance } from '@sentry/ember';

export function initialize(appInstance: ApplicationInstance): void {
  setupPerformance(appInstance);
}

export default { initialize };
```


### Add `<script>` tags to measure the initial load

The v2 addon no longer automatically injects `<script>` tags into your HTML. To measure the performance of the initial load, manually add the scripts to `app/index.html` (for v1 apps) or `index.html` (v2 apps).

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Add the script at the very beginning of <head> to get accurate measurements -->
    <script>
      if (window.performance && window.performance.mark) { 
        window.performance.mark('@sentry/ember:initial-load-start');
      }
    </script>
  </head>
  <body>
    {{content-for "body"}}
    <script src="assets/vendor.js"></script>
    <script src="assets/your-app.js"></script>
    <!-- Add the script at the very end of <body> to get accurate measurements -->
    <script>
      if (window.performance && window.performance.mark) {
        window.performance.mark('@sentry/ember:initial-load-end');
      }
    </script>
  </body>
</html>
```


### Call `instrumentRoutePerformance` to measure route performance

```ts
import Route from '@ember/routing/route';
import { instrumentRoutePerformance } from '@sentry/ember';

class ApplicationRoute extends Route {
  async model() {
    return this.store.findAll('post');
  }
}

export default instrumentRoutePerformance(ApplicationRoute);
```
