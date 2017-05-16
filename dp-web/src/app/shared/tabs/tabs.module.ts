import {NgModule} from '@angular/core';

import {TabsComponent}   from './tabs.component';
import {SharedModule} from '../shared.module';

@NgModule({
  imports: [SharedModule],
  exports: [TabsComponent],
  declarations: [TabsComponent],
  providers: [],
})
export class TabsModule {
}
