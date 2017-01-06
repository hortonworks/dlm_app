import {NgModule} from '@angular/core';
// import {AddBdrComponent}   from './add-bdr.component';
import {BeaconsComponent}   from './beacons.component';
import {SharedModule} from '../../shared/shared.module';
import {routing} from './add-bdr.routing';
import {DropDownModule} from '../../shared/dropdown/dropdown.module';
import {DataPlaneSearchModule} from '../../shared/data-plane-search/data-plane-search.modue';
import {SearchQueryService} from '../../services/search-query.service';

@NgModule({
    imports: [routing, SharedModule, DropDownModule, DataPlaneSearchModule],
    exports: [BeaconsComponent],
    declarations: [BeaconsComponent],
    providers: [SearchQueryService],
})
export class AddBdrModule {
}
