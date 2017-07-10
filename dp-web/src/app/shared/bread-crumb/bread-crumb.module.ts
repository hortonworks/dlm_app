import {NgModule} from '@angular/core';

import { BreadCrumbComponent } from './bread-crumb.component';
import {SharedModule} from '../shared.module';
import {BreadCrumbNamePipe} from './bread-crumb-name.pipe';

@NgModule({
  imports: [SharedModule],
  exports: [BreadCrumbNamePipe, BreadCrumbComponent],
  declarations: [BreadCrumbNamePipe, BreadCrumbComponent],
  providers: [],
})

export class BreadCrumbModule {
}
