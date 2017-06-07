import {NgModule} from '@angular/core';

import {LineageComponent}   from './lineage.component';
import {AtlasService} from '../../services/atlas.service';
import {SharedModule} from '../shared.module';

@NgModule({
  imports: [SharedModule],
  exports: [LineageComponent],
  declarations: [LineageComponent],
  providers: [AtlasService],
})
export class LineageModule {
}
