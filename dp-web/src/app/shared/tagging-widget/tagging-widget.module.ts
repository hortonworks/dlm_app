import {NgModule} from "@angular/core";

import {SharedModule} from "../shared.module";
import {TaggingWidget} from "./tagging-widget.component";

@NgModule({
  declarations: [TaggingWidget],
  exports: [TaggingWidget],
  imports: [SharedModule],
  providers: [],
})
export class TaggingWidgetModule {
}
