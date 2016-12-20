import {ModuleWithProviders}  from '@angular/core';
import {RouterModule} from '@angular/router';
import {AddBdrComponent} from './add-bdr.component';

export const routing: ModuleWithProviders = RouterModule.forChild([
    { path: '', component: AddBdrComponent}
]);
