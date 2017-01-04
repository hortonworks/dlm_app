import {NgModule} from '@angular/core';

import {ChipsBarComponent}   from './chips-bar.component';
import {SharedModule} from '../shared.module';

@NgModule({
    imports: [SharedModule],
    exports: [ChipsBarComponent],
    declarations: [ChipsBarComponent],
    providers: [],
})
export class ChipsBarModule {
}
