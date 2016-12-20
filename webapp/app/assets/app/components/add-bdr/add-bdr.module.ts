import {NgModule} from '@angular/core';
import {AddBdrComponent}   from './add-bdr.component';
import {SharedModule} from '../../shared/shared.module';
import {routing} from './add-bdr.routing';
import {DropDownModule} from '../../shared/dropdown/dropdown.module';

@NgModule({
    imports: [routing, SharedModule, DropDownModule],
    exports: [AddBdrComponent],
    declarations: [AddBdrComponent],
    providers: [],
})
export class AddBdrModule {
}
