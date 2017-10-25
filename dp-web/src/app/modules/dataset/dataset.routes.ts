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

import {Routes} from "@angular/router";
import {DatasetDashboardComponent} from "./views/dashboard/dataset-dashboard.component";
import {DsAssetSearch} from "./views/ds-asset-search/ds-asset-search.component";
import {DsEditor} from "./views/ds-editor/ds-editor.component";
import {DsFullView} from "./views/ds-full-view/ds-full-view.component";
import {AssetViewComponent} from './views/asset-view/asset-view.component';
import {NodeDetailsComponent} from './views/asset-view/node-details/node-details.component';

export const routes: Routes = [{
    path: '',
    pathMatch: 'full',
    redirectTo: 'collections'
  }, {
    path: "collections",
    data: {
      crumb: 'dss.collections'
    },
    children: [{
      path: '',
      pathMatch: 'full',
      component: DatasetDashboardComponent,
      data: {
        crumb: undefined
      },
    }, {
      path: "add",
      component: DsEditor,
      data: {
        crumb: 'dss.collections.add'
      }
    }, {
      path: ":id",
      component: DsFullView,
      data: {
        crumb: 'dss.collections.cCollection'
      }
    }, {
      path: ":id/edit",
      component: DsEditor,
      data: {
        crumb: 'dss.collections.cCollection.edit'
      }
    }]
  }, {
    path: "clusters/:clusterId/assets/:guid",
    component: AssetViewComponent,
    data: {
      crumb: 'dss.assets.cAsset'
    },
    children: [{
      path: 'nodes/:guidOfNode',
      component: NodeDetailsComponent,
      outlet: 'sidebar'
    }]
}];
