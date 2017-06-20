import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {routes} from "./dataset.routes";
import {DatasetSharedModule} from './dataset-shared.module';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    DatasetSharedModule
  ]
})
export class DatasetModule {
}
