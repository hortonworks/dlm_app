import {NgModule} from '@angular/core';

import {DataPlaneSearchComponent}   from './data-plane-search.component';
import {SharedModule} from '../shared.module';
import {DropDownModule} from '../dropdown/dropdown.module';

@NgModule({
    imports: [SharedModule, DropDownModule],
    exports: [DataPlaneSearchComponent],
    declarations: [DataPlaneSearchComponent],
    providers: [],
})
export class DataPlaneSearchModule {
}
