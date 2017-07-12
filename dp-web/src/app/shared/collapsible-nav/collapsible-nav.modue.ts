import {NgModule} from '@angular/core';

import {CollapsibleNavComponent}   from './collapsible-nav.component';
import {SharedModule} from '../shared.module';
import {PersonaPopupComponent} from './persona-popup/persona-popup.component';

@NgModule({
  imports: [SharedModule],
  exports: [CollapsibleNavComponent],
  declarations: [PersonaPopupComponent, CollapsibleNavComponent],
  providers: [],
})
export class CollapsibleNavModule {
}
