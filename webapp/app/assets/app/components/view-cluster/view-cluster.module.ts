import { NgModule } from '@angular/core';
import ViewClusterComponent from './view-cluster.component';
import {BreadcrumbModule} from '../../shared/breadcrumb/breadcrumb.module';
import {DataCenterService} from '../../services/data-center.service';

@NgModule ({
    declarations: [ ViewClusterComponent ],
    imports: [ BreadcrumbModule ]
})

export class ViewClusterModule {
}
