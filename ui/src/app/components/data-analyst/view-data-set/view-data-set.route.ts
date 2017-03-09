import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders }  from '@angular/core';
import { ViewDataSetComponent } from './view-data-set.component';

export const routing: ModuleWithProviders = RouterModule.forChild([
    { path: '', component: ViewDataSetComponent}
]);
