import {NgModule} from '@angular/core';
import {AddClusterComponent}   from './add-cluster.component';
import {DropDownModule} from '../../shared/dropdown/dropdown.module';
import {SharedModule} from '../../shared/shared.module';
import {routing} from './add-cluster.routing';
import {BreadcrumbModule} from '../../shared/breadcrumb/breadcrumb.module';


@NgModule({
    imports: [routing, SharedModule, DropDownModule, BreadcrumbModule],
    declarations: [AddClusterComponent]
})
export class AddClusterModule {
}
