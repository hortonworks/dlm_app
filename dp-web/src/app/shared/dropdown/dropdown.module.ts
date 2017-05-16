import {NgModule} from '@angular/core';

import {DropdownComponent}   from './dropdown.component';
import {SharedModule} from '../shared.module';

@NgModule({
  imports: [SharedModule],
  exports: [DropdownComponent],
  declarations: [DropdownComponent],
  providers: [],
})
export class DropdownModule {
}
