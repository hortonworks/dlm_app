import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ViewDataSetComponent }   from './view-data-set.component';
import { routing } from './view-data-set.route';
import { DataPlaneSearchModule } from '../../../shared/data-plane-search/data-plane-search.modue';
import { SearchQueryService } from '../../../services/search-query.service';
import { BackupPolicyService } from '../../../services/backup-policy.service';
import { BreadcrumbModule } from '../../../shared/breadcrumb/breadcrumb.module';

@NgModule({
    imports: [CommonModule, FormsModule, routing, DataPlaneSearchModule, BreadcrumbModule],
    exports: [ViewDataSetComponent],
    declarations: [ViewDataSetComponent],
    providers: [SearchQueryService, BackupPolicyService],
})
export class ViewDataSetModule {
}
