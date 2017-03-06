import { NgModule } from '@angular/core';
import ViewClusterComponent from './view-cluster.component';
import {BreadcrumbModule} from '../../shared/breadcrumb/breadcrumb.module';
import {SharedModule} from '../../shared/shared.module';
import {BackupPolicyListModule} from '../backup-policy-list/backup-policy-list.module';

@NgModule ({
    declarations: [ ViewClusterComponent ],
    imports: [ SharedModule, BreadcrumbModule, BackupPolicyListModule ],
})

export class ViewClusterModule {
}
