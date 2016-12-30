import {NgModule} from '@angular/core';

import {ViewDataSetComponent}   from './view-data-set.component';
import {SharedModule} from '../../../shared/shared.module';
import {routing} from './view-data-set.route';
import {DataPlaneSearchModule} from '../../../shared/data-plane-search/data-plane-search.modue';
import {SearchQueryService} from '../../../services/search-query.service';
import {BackupPolicyService} from '../../../services/backup-policy.service';

@NgModule({
    imports: [SharedModule, routing, DataPlaneSearchModule],
    exports: [ViewDataSetComponent],
    declarations: [ViewDataSetComponent],
    providers: [SearchQueryService, BackupPolicyService],
})
export class ViewDataSetModule {
}
