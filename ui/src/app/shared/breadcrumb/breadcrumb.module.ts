import {NgModule} from '@angular/core';
import {BreadcrumbComponent} from './breadcrumb.component';
import {SharedModule} from '../shared.module';

@NgModule ({
    imports: [ SharedModule ],
    declarations: [ BreadcrumbComponent ],
    exports : [ BreadcrumbComponent ],
    providers: []
})
export class BreadcrumbModule {}
