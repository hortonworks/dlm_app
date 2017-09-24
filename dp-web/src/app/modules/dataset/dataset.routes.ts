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
import {RedirectUrlComponent} from '../../shared/redirect-url/redirect-url.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dataset' },
  { component: DatasetDashboardComponent, path: "dataset"},
  { component: DsFullView, path: "dataset/full-view/:id"},
  { component: DsEditor, path: "dataset/add"},
  { component: DsEditor, path: "dataset/edit/:id"},
  { component: DsEditor, path: "edit"},
  { component: DsAssetSearch, path: "asset-search"},
  { component: RedirectUrlComponent, path: "dataset/assets/details/:id/:guid", data: {find: '^/datasteward/dataset', replace: ''}},
];
