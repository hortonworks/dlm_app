import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {ViewClusterComponent} from './view-cluster.component';
import {BreadcrumbModule} from '../../shared/breadcrumb/breadcrumb.module';
import {BackupPolicyListModule} from '../backup-policy-list/backup-policy-list.module';

@NgModule ({
    declarations: [ ViewClusterComponent ],
    imports: [ CommonModule, FormsModule, BreadcrumbModule, BackupPolicyListModule ],
})

export class ViewClusterModule {
}
