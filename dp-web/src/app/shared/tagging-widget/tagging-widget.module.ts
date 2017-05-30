import {NgModule} from '@angular/core';

import {SharedModule} from '../shared.module';
import {TaggingWidget} from "./tagging-widget.component";

@NgModule({
  imports: [SharedModule],
  exports: [TaggingWidget],
  declarations: [TaggingWidget],
  providers: [],
})
export class TaggingWidgetModule {
}
