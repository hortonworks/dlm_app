import {NgModule} from '@angular/core';

import {CollapsibleNavComponent}   from './collapsible-nav.component';
import {SharedModule} from '../shared.module';

@NgModule({
  imports: [SharedModule],
  exports: [CollapsibleNavComponent],
  declarations: [CollapsibleNavComponent],
  providers: [],
})
export class CollapsibleNavModule {
}
