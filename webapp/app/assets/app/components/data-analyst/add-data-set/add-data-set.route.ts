import {ModuleWithProviders}  from '@angular/core';
import {RouterModule} from '@angular/router';
import {AddDataSetComponent} from './add-data-set.component';

export const routing: ModuleWithProviders = RouterModule.forChild([
    { path: '', component: AddDataSetComponent}
]);
