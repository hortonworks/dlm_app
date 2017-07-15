import {Routes} from "@angular/router";
import {DatasetDashboardComponent} from "./views/dashboard/dataset-dashboard.component";
import {DsAssetSearch} from "./views/ds-asset-search/ds-asset-search.component";
import {DsEditor} from "./views/ds-editor/ds-editor.component";
import {DsFullView} from "./views/ds-full-view/ds-full-view.component";
import {RedirectUrlComponent} from '../../shared/redirect-url/redirect-url.component';

export const routes: Routes = [
  { path: '', redirectTo: 'datafolio' },
  { component: DatasetDashboardComponent, path: "datafolio"},
  { component: DsFullView, path: "datafolio/full-view/:id"},
  { component: DsEditor, path: "datafolio/add"},
  { component: DsEditor, path: "datafolio/edit/:id"},
  { component: DsEditor, path: "edit"},
  { component: DsAssetSearch, path: "asset-search"},
  { component: RedirectUrlComponent, path: "datafolio/assets/details/:id/:guid", data: {find: '^/datasteward/datafolio', replace: ''}},
];
