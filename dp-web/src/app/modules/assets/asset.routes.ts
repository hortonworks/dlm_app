import { Routes } from '@angular/router';

import {AssetViewComponent} from './asset-view/asset-view.component';

export const routes: Routes = [{
    path: 'details/:id/:guid',
    component: AssetViewComponent
  }
];
