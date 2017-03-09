import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AddClusterComponent }   from './add-cluster.component';
import { DropDownModule } from '../../shared/dropdown/dropdown.module';
import { routing } from './add-cluster.routing';
import { BreadcrumbModule } from '../../shared/breadcrumb/breadcrumb.module';


@NgModule({
    imports: [routing, CommonModule, FormsModule, DropDownModule, BreadcrumbModule],
    declarations: [AddClusterComponent]
})
export class AddClusterModule {
}
