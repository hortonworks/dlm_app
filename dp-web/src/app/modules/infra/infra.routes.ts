import { Routes } from '@angular/router';

import { LakesComponent } from './views/lakes/lakes.component';
import { ClusterAddComponent } from './views/cluster-add/cluster-add.component';

export const routes: Routes = [{
    path: '',
    component: LakesComponent
  },
  {
    path: 'add',
    component: ClusterAddComponent
  }
];
