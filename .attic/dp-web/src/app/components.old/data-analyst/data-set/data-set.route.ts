import { ModuleWithProviders }  from '@angular/core';
import { RouterModule } from '@angular/router';
import { DataSetComponent } from './data-set.component';

export const routing: ModuleWithProviders = RouterModule.forChild([
    { path: '', component: DataSetComponent}
]);
