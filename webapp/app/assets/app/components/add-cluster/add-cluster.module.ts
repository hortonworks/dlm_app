/**
 * Created by rksv on 03/12/16.
 */
import {NgModule} from '@angular/core';
import {AddClusterComponent}   from './add-cluster.component';
import {DropDownModule} from '../../shared/dropdown/dropdown.module';
import {SharedModule} from '../../shared/shared.module';
import {routing} from './add-cluster.routing';


@NgModule({
    imports: [routing, SharedModule, DropDownModule],
    declarations: [AddClusterComponent]
})
export class AddClusterModule {
}
