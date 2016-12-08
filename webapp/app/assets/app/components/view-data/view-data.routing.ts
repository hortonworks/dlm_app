import {ModuleWithProviders}  from '@angular/core';
import {RouterModule} from '@angular/router';
import {ViewDataComponent} from './view-data.component';

export const routing: ModuleWithProviders = RouterModule.forChild([
    { path: 'ui/view-data/:id', component: ViewDataComponent}
]);