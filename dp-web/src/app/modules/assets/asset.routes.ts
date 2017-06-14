import {Routes} from '@angular/router';

import {AssetViewComponent} from './asset-view/asset-view.component';
import {NodeDetailsComponent} from './asset-view/node-details/node-details.component';

export const routes: Routes = [{
  path: '',
  component: AssetViewComponent
}, {
  path: 'details/:id/:guid',
  component: AssetViewComponent,
  children: [
    {
      path: 'node/:guid',
      component: NodeDetailsComponent,
      outlet: 'sidebar'

    }
  ]
}
];
