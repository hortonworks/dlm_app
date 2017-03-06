import {NgModule} from '@angular/core';

import {DashboardComponent}   from './dashboard';
import {BreadcrumbModule} from '../../shared/breadcrumb/breadcrumb.module';
import {SharedModule} from '../../shared/shared.module';
import {routing} from './dashboard.routing';

@NgModule({
    imports: [routing, SharedModule, BreadcrumbModule],
    exports: [DashboardComponent],
    declarations: [DashboardComponent],
    providers: [],
})
export class DashboardModule {
}
