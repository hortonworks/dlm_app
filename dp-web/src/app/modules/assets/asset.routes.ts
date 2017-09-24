/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

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
