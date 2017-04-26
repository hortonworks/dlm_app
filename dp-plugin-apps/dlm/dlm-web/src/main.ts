import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { DlmModule } from './app/dlm.module';
import { environment } from './environments/environment';
import { hmrBootstrap } from './hmr';

if (environment.production) {
  enableProdMode();
}

const bootstrap = () => {
  return platformBrowserDynamic().bootstrapModule(DlmModule);
};

if (environment.hmr) {
  if (module['hot']) {
    hmrBootstrap(module, bootstrap);
  }
} else {
  bootstrap();
}
