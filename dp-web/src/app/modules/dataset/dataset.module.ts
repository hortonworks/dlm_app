import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {routes} from "./dataset.routes";
import {DatasetSharedModule} from './dataset-shared.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    DatasetSharedModule
  ]
})
export class DatasetModule {
}
