import { ModuleWithProviders }  from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard';

export const routing: ModuleWithProviders = RouterModule.forChild([
    { path: '', component: DashboardComponent}
]);
