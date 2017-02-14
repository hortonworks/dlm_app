import {NgModule} from '@angular/core';
import {DataManagerComponent}   from './data-manager.component';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
    imports: [SharedModule],
    exports: [DataManagerComponent],
    declarations: [DataManagerComponent],
    providers: [],
})
export class DataManagerModule {
}
