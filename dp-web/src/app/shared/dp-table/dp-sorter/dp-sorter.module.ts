import {NgModule} from '@angular/core';

import {DpSorterComponent}   from './dp-sorter.component';
import {SharedModule} from '../../shared.module';

@NgModule({
    imports: [SharedModule],
    exports: [DpSorterComponent],
    declarations: [DpSorterComponent],
    providers: [],
})
export class DpSorterModule {
}
