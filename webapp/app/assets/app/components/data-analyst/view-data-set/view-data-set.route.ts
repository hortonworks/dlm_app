import {Routes, RouterModule} from '@angular/router';
import {ViewDataSetComponent} from './view-data-set.component';

export const routing: ModuleWithProviders = RouterModule.forChild([
    { path: '', component: ViewDataSetComponent}
]);