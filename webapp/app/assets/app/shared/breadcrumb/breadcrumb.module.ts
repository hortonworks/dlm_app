/**
 * Created by rksv on 29/11/16.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BreadcrumbComponent} from './breadcrumb.component';

@NgModule ({
    imports: [ CommonModule ],
    declarations: [ BreadcrumbComponent ],
    exports : [ BreadcrumbComponent ]
})
export class BreadcrumbModule {}
