import {NgModule} from '@angular/core';
import { RouterModule } from '@angular/router';

import {LineageComponent}   from './lineage.component';
import {AtlasService} from '../../services/atlas.service';
import {SharedModule} from '../shared.module';

@NgModule({
  imports: [SharedModule, RouterModule],
  exports: [LineageComponent],
  declarations: [LineageComponent],
  providers: [AtlasService],
})
export class LineageModule {
}
