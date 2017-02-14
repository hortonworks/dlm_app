import {ModuleWithProviders}  from '@angular/core';
import {RouterModule} from '@angular/router';
import {BeaconsComponent} from './beacons.component';

export const routing: ModuleWithProviders = RouterModule.forChild([
    { path: '', component: BeaconsComponent}
]);
