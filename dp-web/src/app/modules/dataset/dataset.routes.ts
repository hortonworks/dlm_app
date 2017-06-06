import {Routes} from "@angular/router";
import {DatasetDashboardComponent} from "./views/dashboard/dataset-dashboard.component";
import {DsAssetSearch} from "./views/ds-asset-search/ds-asset-search.component";
import {DsEditor} from "./views/ds-editor/ds-editor.component";
import {DsFullView} from "./views/ds-full-view/ds-full-view.component";

export const routes: Routes = [
  {
    component: DatasetDashboardComponent,
    path: ""
  },
  {
    component: DsFullView,
    path: "full-view/:id"
  },
  {
    component: DsEditor,
    path: "add"
  },
  {
    component: DsEditor,
    path: "edit/:id"
  },
  {
    component: DsEditor,
    path: "edit"
  },
  {
    component: DsAssetSearch,
    path: "asset-search"
  }
];
