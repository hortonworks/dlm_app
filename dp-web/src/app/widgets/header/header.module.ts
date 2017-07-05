import {NgModule} from '@angular/core';

import {HeaderComponent}   from './header.component';
import {SharedModule} from '../../shared/shared.module';
import {BreadCrumbNamePipe} from './bread-crumb-name.pipe';

@NgModule({
  imports: [SharedModule],
  exports: [HeaderComponent],
  declarations: [BreadCrumbNamePipe, HeaderComponent],
  providers: [],
})
export class HeaderModule {
}
