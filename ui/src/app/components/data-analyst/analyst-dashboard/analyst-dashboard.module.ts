import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AnalystDashboardComponent }   from './analyst-dashboard.component';
import { routing } from './analyst-dashboard.route';
import { DataSetModule } from '../data-set/data-set.module';

@NgModule({
    imports: [CommonModule, FormsModule, routing, DataSetModule],
    exports: [],
    declarations: [AnalystDashboardComponent],
    providers: [],
})
export class AnalystDashboardModule {
}
