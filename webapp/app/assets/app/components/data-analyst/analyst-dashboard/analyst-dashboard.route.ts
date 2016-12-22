import {ModuleWithProviders}  from '@angular/core';
import {RouterModule} from '@angular/router';
import {AnalystDashboardComponent} from './analyst-dashboard.component';

export const routing: ModuleWithProviders = RouterModule.forChild([
    { path: '', component: AnalystDashboardComponent}
]);
