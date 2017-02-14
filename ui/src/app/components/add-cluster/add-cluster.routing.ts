import {ModuleWithProviders}  from '@angular/core';
import {RouterModule} from '@angular/router';
import {AddClusterComponent} from './add-cluster.component';

export const routing: ModuleWithProviders = RouterModule.forChild([
  { path: '', component: AddClusterComponent}
]);
