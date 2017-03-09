import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardComponent }   from './dashboard';
import { BreadcrumbModule } from '../../shared/breadcrumb/breadcrumb.module';
import { routing } from './dashboard.routing';

@NgModule({
    imports: [routing, CommonModule, FormsModule, BreadcrumbModule],
    exports: [DashboardComponent],
    declarations: [DashboardComponent],
    providers: [],
})
export class DashboardModule {
}
