import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsDropdownModule, ButtonsModule } from 'ng2-bootstrap';
import { CardComponent } from './card/card.component';
import { SearchInputComponent } from './search-input/search-input.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { ClusterCardComponent } from './cluster-card/cluster-card.component';
import { StatusColumnComponent } from './table-columns/status-column/status-column.component';
import { IconColumnComponent } from './table-columns/icon-column/icon-column.component';

@NgModule({
  imports: [
    CommonModule,
    BsDropdownModule.forRoot(),
    ButtonsModule.forRoot()
  ],
  declarations: [
    CardComponent,
    SearchInputComponent,
    DropdownComponent,
    ClusterCardComponent,
    StatusColumnComponent,
    IconColumnComponent
  ],
  exports: [
    CardComponent,
    SearchInputComponent,
    DropdownComponent,
    ClusterCardComponent,
    StatusColumnComponent,
    IconColumnComponent
  ]
})
export class CommonComponentsModule {}
