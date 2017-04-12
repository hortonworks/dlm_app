import { Routes } from '@angular/router';

import { FirstRunComponent } from './views/first-run/first-run.component';
import { LakesComponent } from './views/lakes/lakes.component';

export const routes: Routes = [{
    path: '',
    component: FirstRunComponent
  }, {
    path: 'lakes',
    component: LakesComponent
  },
];
