/**
 * Created by rksv on 29/11/16.
 */

import { NgModule } from '@angular/core';
import ViewClusterComponent from './view-cluster.component';
import {BreadcrumbModule} from '../../shared/breadcrumb/breadcrumb.module';

@NgModule ({
    declarations: [ ViewClusterComponent ],
    imports: [ BreadcrumbModule ]
})

export class ViewClusterModule {}
