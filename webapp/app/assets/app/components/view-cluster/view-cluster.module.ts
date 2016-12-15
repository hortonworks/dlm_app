import { NgModule } from '@angular/core';
import ViewClusterComponent from './view-cluster.component';
import {BreadcrumbModule} from '../../shared/breadcrumb/breadcrumb.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule ({
    declarations: [ ViewClusterComponent ],
    imports: [ SharedModule, BreadcrumbModule ]
})

export class ViewClusterModule {
}
