import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsDropdownModule } from 'ng2-bootstrap';
import { CardComponent } from './card/card.component';
import { SearchInputComponent } from './search-input/search-input.component';
import { DropdownComponent } from './dropdown/dropdown.component';

@NgModule({
  imports: [
    CommonModule,
    BsDropdownModule.forRoot(),
  ],
  declarations: [
    CardComponent,
    SearchInputComponent,
    DropdownComponent
  ],
  exports: [
    CardComponent,
    SearchInputComponent,
    DropdownComponent
  ]
})
export class CommonComponentsModule {}
