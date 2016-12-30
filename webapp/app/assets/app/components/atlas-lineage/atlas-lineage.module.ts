import {NgModule} from '@angular/core';

import {AtlasLineageComponent}   from './atlas-lineage.component';
import {AtlasService} from '../../services/atlas.service';

@NgModule({
    imports: [],
    exports: [AtlasLineageComponent],
    declarations: [AtlasLineageComponent],
    providers: [AtlasService],
})
export class AtlasLineageModule {
}
