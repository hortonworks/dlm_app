import {NgModule} from '@angular/core';

import {SharedModule} from '../shared.module';
import {SimplePaginationWidget} from './pagination.component';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [SimplePaginationWidget],
  exports: [SimplePaginationWidget],
  imports: [SharedModule, TranslateModule],
  providers: [],
})
export class PaginationModule {
}
