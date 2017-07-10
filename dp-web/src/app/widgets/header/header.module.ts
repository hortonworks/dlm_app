import {NgModule} from '@angular/core';

import {HeaderComponent}   from './header.component';
import {SharedModule} from '../../shared/shared.module';
import {BreadCrumbModule} from '../../shared/bread-crumb/bread-crumb.module';

@NgModule({
  imports: [SharedModule, BreadCrumbModule],
  exports: [HeaderComponent],
  declarations: [HeaderComponent],
  providers: [],
})
export class HeaderModule {
}
