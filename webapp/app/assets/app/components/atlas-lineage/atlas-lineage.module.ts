import {NgModule} from '@angular/core';

import {AtlasLineageComponent}   from './atlas-lineage.component';
import {AtlasLineageService} from '../../services/atlas-lineage.service';
import {AtlasEntityService} from '../../services/atlas-entity.service';

@NgModule({
    imports: [],
    exports: [AtlasLineageComponent],
    declarations: [AtlasLineageComponent],
    providers: [AtlasLineageService, AtlasEntityService],
})
export class AtlasLineageModule {
}
