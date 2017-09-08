/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

/*
* Usage :
* <multi-select [list]="myList" (update)="onMultiSelectChange($event)"></multi-select>
*
*
*class consumerComponent{
*   myList: any[] = [{"name":"display name"}, ...];
*   onMultiSelectChange(selection : any[]) {
*     // do something with selection
*   }
* }
*
* */
import {Component, Input, Output, EventEmitter} from "@angular/core";

@Component({
  selector: 'multi-select',
  template: `
    <div *ngFor="let optn of options; let i = index">
      <input #checkboxInput type="checkbox" [checked]="optn.checked" (click)="updateChecked(i, checkboxInput.checked)"/>
      <label (click)="updateChecked(i, checkboxInput.checked = !checkboxInput.checked);">{{optn.name}}</label>
    </div>
  `
})
export class MultiSelect {
  @Input('list')
  options : any[];

  @Output('update')
  changeEmitter: EventEmitter<any[]> = new EventEmitter<any[]>();

  updateChecked (i, state) {
    this.options[i].checked = state;
    this.changeEmitter.emit(this.options)
  }
}
