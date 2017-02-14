import {NgModule} from '@angular/core';

import {AnalystDashboardComponent}   from './analyst-dashboard.component';
import {SharedModule} from '../../../shared/shared.module';
import {routing} from './analyst-dashboard.route';
import {DataSetModule} from '../data-set/data-set.module';

@NgModule({
    imports: [SharedModule, routing, DataSetModule],
    exports: [],
    declarations: [AnalystDashboardComponent],
    providers: [],
})
export class AnalystDashboardModule {
}
